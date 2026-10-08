"""
NexaASSIST - Sincronizador de E-mails Assistenciais em Tempo Real
Conta Monitorada: integracao@dialize.com.br
Servidor IMAP: imap.titan.email:993 (SSL/TLS)
Destino: Firebase Firestore ('assist_posts') & Backup Local ('src/data/synced_assist_emails.json')
"""

import imaplib
import email
from email.header import decode_header
import json
import re
import os
import sys
import subprocess
import unicodedata
from html import unescape
from datetime import datetime
import time
import functools

# Garante compatibilidade UTF-8 no Windows Console e flush imediato de logs
print = functools.partial(print, flush=True)

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

TITAN_CONFIG = {
    'imap_server': 'imap.titan.email',
    'imap_port': 993,
    'email': 'integracao@dialize.com.br',
    'password': 'Dialize@#3344'
}

PROCESSED_IDS_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'processed_email_ids.json')
SYNCED_POSTS_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'synced_assist_emails.json')
CHECK_STATUS_SCRIPT = os.path.join(os.path.dirname(__file__), 'check_import_status.mjs')

def is_import_enabled():
    """Consulta o Firestore para verificar se a importação está ativa nas configurações do NexaCONFIG."""
    if os.path.exists(CHECK_STATUS_SCRIPT):
        try:
            res = subprocess.run(['node', CHECK_STATUS_SCRIPT], capture_output=True, text=True, timeout=12)
            if 'DISABLED' in res.stdout:
                return False
        except Exception:
            return True
    return True

def load_processed_ids():
    if os.path.exists(PROCESSED_IDS_FILE):
        try:
            with open(PROCESSED_IDS_FILE, 'r', encoding='utf-8') as f:
                return set(json.load(f))
        except Exception:
            return set()
    return set()

def save_processed_ids(ids_set):
    try:
        with open(PROCESSED_IDS_FILE, 'w', encoding='utf-8') as f:
            json.dump(list(ids_set), f, indent=2)
    except Exception as e:
        print(f"Aviso ao salvar IDs processados: {e}")

def decode_mime_words(s):
    if not s:
        return ""
    try:
        decoded_fragments = decode_header(s)
        result = []
        for fragment, encoding in decoded_fragments:
            if isinstance(fragment, bytes):
                enc = encoding or 'utf-8'
                try:
                    result.append(fragment.decode(enc, errors='ignore'))
                except Exception:
                    result.append(fragment.decode('latin-1', errors='ignore'))
            else:
                result.append(str(fragment))
        return "".join(result)
    except Exception:
        return str(s)

def clean_html_to_text(html_text):
    if not html_text:
        return ""
    text = re.sub(r'<!--[\s\S]*?-->', '', html_text)
    text = re.sub(r'<style[\s\S]*?</style>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<script[\s\S]*?</script>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<head[\s\S]*?</head>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<img[\s\S]*?>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</(p|div|tr|li|h[1-6]|table|blockquote|signature)>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<(p|div|tr|li|h[1-6]|table|blockquote|signature)[^>]*>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = unescape(text)
    text = text.replace('\xa0', ' ')
    lines = [re.sub(r'\s+', ' ', line).strip() for line in text.split('\n')]
    
    filtered = []
    for line in lines:
        if not line:
            if filtered and filtered[-1] != '':
                filtered.append('')
            continue
        lower = line.lower()
        if lower.startswith('>') or lower.startswith('de:') or lower.startswith('enviado em:') or lower.startswith('para:') or lower.startswith('assunto:'):
            continue
        if lower in ('atenciosamente', 'atenciosamente,', 'cordialmente', 'cordialmente,', 'obrigado', 'obrigada') or lower.startswith(('att,', 'att:', 'att', 'at.te,', 'at.te')):
            continue
        if 'enviado do meu' in lower or 'enviado pelo outlook' in lower or 'enviado pelo mail do windows' in lower or 'gentileza acusar recebimento' in lower:
            continue
        if re.match(r'^[-=_*]{3,}$', line):
            continue
        filtered.append(line)

    return "\n".join(filtered).strip()

def decode_payload_part(part):
    charset = part.get_content_charset() or 'utf-8'
    payload = part.get_payload(decode=True)
    if not payload:
        return ""
    try:
        return payload.decode(charset, errors='replace')
    except Exception:
        try:
            return payload.decode('latin-1', errors='replace')
        except Exception:
            return payload.decode('utf-8', errors='ignore')

def get_body(msg):
    text_content = ""
    html_content = ""
    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            cdispo = str(part.get('Content-Disposition'))
            if 'attachment' in cdispo:
                continue
            if ctype == 'text/plain' and not text_content:
                text_content = decode_payload_part(part)
            elif ctype == 'text/html' and not html_content:
                html_content = decode_payload_part(part)
    else:
        raw = decode_payload_part(msg)
        if msg.get_content_type() == 'text/html':
            html_content = raw
        else:
            text_content = raw

    if text_content and len(text_content.strip()) > 10:
        if re.search(r'<[a-z!][\s\S]*>', text_content, re.IGNORECASE):
            return clean_html_to_text(text_content)
        return clean_html_to_text(text_content) if '<' in text_content else text_content.strip()
    elif html_content:
        return clean_html_to_text(html_content)
    return text_content or ""

def normalize_text(text):
    if not text:
        return ""
    n = unicodedata.normalize('NFD', text.lower())
    n = "".join(c for c in n if unicodedata.category(c) != 'Mn')
    n = re.sub(r'[^a-z0-9\s]', ' ', n)
    return re.sub(r'\s+', ' ', n).strip()

def load_patients():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'patients_extracted.json')
    if os.path.exists(data_path):
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                clean_patients = []
                for p in data:
                    raw_name = p.get('name', '').replace('|', '').strip()
                    clean_patients.append({
                        **p,
                        'id': p.get('id') or f"pat-{re.sub(r'[^a-z0-9]', '', raw_name.lower())[:25]}",
                        'name': raw_name
                    })
                return clean_patients
        except Exception as e:
            print(f"Aviso ao carregar patients_extracted.json: {e}")
    return []

def match_patient(text, patients_list):
    if not text or not patients_list:
        return None, 0.0, 'none'
    
    norm_text = normalize_text(text)
    best_patient = None
    highest_score = 0.0
    match_type = 'none'

    for pat in patients_list:
        pat_name = pat.get('name', '')
        if not pat_name or len(pat_name) < 3:
            continue
        
        norm_pat = normalize_text(pat_name)
        parts = [p for p in norm_pat.split() if len(p) > 2]
        if not parts:
            continue

        # 1. Match Nome Completo Exato
        if norm_pat in norm_text:
            return pat, 1.0, 'exact_full_name'

        # 2. Match Primeiro e Último Nome
        if len(parts) >= 2:
            first_last = f"{parts[0]} {parts[-1]}"
            if first_last in norm_text:
                score = 0.95
                if score > highest_score:
                    highest_score = score
                    best_patient = pat
                    match_type = 'first_last_name'

        # 3. Match Primeiros 2 nomes se houver
        if len(parts) >= 2:
            first_two = f"{parts[0]} {parts[1]}"
            if first_two in norm_text:
                score = 0.90
                if score > highest_score:
                    highest_score = score
                    best_patient = pat
                    match_type = 'first_two_names'

        # 4. Match de Tokens
        matched_tokens = sum(1 for p in parts if p in norm_text)
        token_ratio = matched_tokens / len(parts) if parts else 0
        if matched_tokens >= 2 and token_ratio >= 0.5:
            score = 0.70 + (token_ratio * 0.20)
            if score > highest_score:
                highest_score = score
                best_patient = pat
                match_type = 'token_overlap'

    return best_patient, highest_score, match_type

def classify_content(subject, body):
    full = normalize_text(f"{subject} {body}")
    category = 'Geral'
    urgency = 'Informativo'

    if any(w in full for w in ['infeccao', 'infecc', 'intercorrencia', 'sangramento', 'febre', 'cateter', 'fav', 'atb', 'ceftazidima', 'vancomicina', 'hemocultura', 'perda de acesso', 'puncao fav', 'retirada de cdl', 'cdl', 'critico', 'resultado critico']):
        category = 'Intercorrência'
        urgency = 'Urgente'
    elif any(w in full for w in ['alta', 'alta hospitalar', 'retorno', 'desospitaliz']):
        category = 'Alta'
        urgency = 'Atenção'
    elif any(w in full for w in ['internad', 'internacao', 'admissao', 'admitid', 'cti', 'uti', 'hospital', 'hospitalizacao']):
        category = 'Internação'
        urgency = 'Urgente'
    elif any(w in full for w in ['transfer', 'transferencia', 'vaga']):
        category = 'Transferência'
        urgency = 'Atenção'
    elif any(w in full for w in ['soroteca', 'coleta', 'exame', 'laboratorio', 'labicon', 'amostra']):
        category = 'Intercorrência'
        urgency = 'Atenção'
    elif any(w in full for w in ['nutri', 'dieta', 'suplement', 'potassio', 'fosforo']):
        category = 'Nutrição'
        urgency = 'Informativo'
    elif any(w in full for w in ['psicolog', 'emocional', 'ansiedad', 'depress']):
        category = 'Psicologia'
        urgency = 'Informativo'
    elif any(w in full for w in ['social', 'transporte', 'tfd', 'beneficio']):
        category = 'Serviço Social'
        urgency = 'Informativo'
    elif any(w in full for w in ['obito', 'falec']):
        category = 'Óbito'
        urgency = 'Urgente'

    return category, urgency

def sync_inbox():
    now_str = datetime.now().strftime('%d/%m/%Y %H:%M:%S')

    # 1. Checagem de permissão nas configurações do sistema
    if not is_import_enabled():
        print(f"[{now_str}] [NexaASSIST] Importação de e-mails DESLIGADA no NexaCONFIG. Aguardando ativação...")
        return []

    print(f"[{now_str}] [NexaASSIST] Verificando caixa Titan ({TITAN_CONFIG['email']})...")
    patients = load_patients()
    processed_ids = load_processed_ids()

    try:
        mail = imaplib.IMAP4_SSL(TITAN_CONFIG['imap_server'], TITAN_CONFIG['imap_port'])
        mail.login(TITAN_CONFIG['email'], TITAN_CONFIG['password'])
        mail.select('INBOX')

        status, msg_ids = mail.search(None, 'ALL')
        ids = msg_ids[0].split()
        
        new_posts = []

        for msg_id in ids:
            id_str = msg_id.decode()
            if id_str in processed_ids:
                continue

            res, msg_data = mail.fetch(msg_id, '(RFC822)')
            if not msg_data or not isinstance(msg_data[0], tuple):
                continue
            
            msg = email.message_from_bytes(msg_data[0][1])
            subject = decode_mime_words(msg.get('Subject', ''))
            sender = decode_mime_words(msg.get('From', ''))
            date_str = msg.get('Date', '')
            body = get_body(msg)

            # Ignora e-mails automáticos de dicas do Titan
            if 'titan-tips@titan.email' in sender.lower():
                processed_ids.add(id_str)
                continue

            matched_pat, conf, m_type = match_patient(f"{subject} {body}", patients)
            category, urgency = classify_content(subject, body)

            clean_author = sender.split('<')[0].replace('"', '').strip()
            is_linked = matched_pat and conf >= 0.70

            # Formata data ISO
            try:
                dt = email.utils.parsedate_to_datetime(date_str)
                created_at_iso = dt.isoformat()
            except Exception:
                created_at_iso = datetime.now().isoformat()

            unit_id = 'betim'
            if matched_pat and matched_pat.get('unitId'):
                unit_id = matched_pat.get('unitId')

            post = {
                'id': f"email-titan-{id_str}",
                'unitId': unit_id,
                'source': 'email',
                'originalFrom': sender,
                'originalSubject': subject,
                'title': subject or f"Comunicado - {category}",
                'message': body,
                'category': category,
                'urgency': urgency,
                'patientId': matched_pat.get('id') if is_linked else None,
                'patientName': matched_pat.get('name') if is_linked else (subject.split('-')[-1].strip() if '-' in subject else None),
                'room': matched_pat.get('room', 'Geral') if is_linked else 'Geral',
                'shift': matched_pat.get('shift', 'Geral') if is_linked else 'Geral',
                'matchConfidence': conf,
                'matchType': m_type,
                'status': 'published',
                'author': clean_author or 'Equipe Assistencial',
                'authorRole': 'Enfermagem / Assistência (Titan)',
                'createdAt': created_at_iso,
                'readBy': []
            }

            new_posts.append(post)
            processed_ids.add(id_str)
            print(f" -> NOVO E-MAIL [{id_str}]: Assunto='{subject}' | Paciente='{post['patientName']}' | Categoria='{category}'")

        mail.close()
        mail.logout()

        save_processed_ids(processed_ids)

        if new_posts:
            # Carrega registros já existentes no arquivo local
            existing_posts = []
            if os.path.exists(SYNCED_POSTS_FILE):
                try:
                    with open(SYNCED_POSTS_FILE, 'r', encoding='utf-8') as f:
                        existing_posts = json.load(f)
                except Exception:
                    existing_posts = []

            # Mescla sem duplicidade por ID
            seen_ids = set()
            all_posts = []
            for p in (new_posts + existing_posts):
                if p.get('id') and p['id'] not in seen_ids:
                    seen_ids.add(p['id'])
                    all_posts.append(p)

            # Ordena do mais recente para o mais antigo
            all_posts.sort(key=lambda x: x.get('createdAt', ''), reverse=True)

            with open(SYNCED_POSTS_FILE, 'w', encoding='utf-8') as f:
                json.dump(all_posts, f, ensure_ascii=False, indent=2)

            print(f"[{now_str}] {len(new_posts)} novo(s) e-mail(s) sincronizado(s) localmente. Atualizando Firestore...")

            # Grava no Firestore via Firebase Admin
            node_script = os.path.join(os.path.dirname(__file__), 'push_to_firestore.mjs')
            if os.path.exists(node_script):
                subprocess.run(['node', node_script], check=False)
        else:
            print(f"[{now_str}] Nenhum novo e-mail para processar. (Total processados: {len(processed_ids)})")

        return new_posts

    except Exception as e:
        print(f"[{now_str}] Erro ao conectar/sincronizar IMAP Titan: {e}")
        return []

def main():
    interval = 60 # 60 segundos
    if '--interval' in sys.argv:
        try:
            idx = sys.argv.index('--interval')
            interval = int(sys.argv[idx + 1])
        except Exception:
            interval = 60

    if '--loop' in sys.argv or '--daemon' in sys.argv:
        print(f"==================================================")
        print(f"[ROBO NexaASSIST] Monitoramento Continuo Ativo")
        print(f"Conta: {TITAN_CONFIG['email']}")
        print(f"Intervalo de Verificacao: {interval} segundos")
        print(f"==================================================")
        while True:
            try:
                sync_inbox()
            except Exception as ex:
                print(f"Exceção no ciclo do robô: {ex}")
            time.sleep(interval)
    else:
        sync_inbox()

if __name__ == '__main__':
    main()
