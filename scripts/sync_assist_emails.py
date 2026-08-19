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

# Garante compatibilidade UTF-8 no Windows Console e flush imediato de logs
import functools
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

def decode_mime_words(s):
    if not s:
        return ""
    decoded_fragments = decode_header(s)
    result = []
    for fragment, encoding in decoded_fragments:
        if isinstance(fragment, bytes):
            result.append(fragment.decode(encoding or 'utf-8', errors='ignore'))
        else:
            result.append(str(fragment))
    return "".join(result)

def clean_html_to_text(html_text):
    if not html_text:
        return ""
    text = re.sub(r'<style[\s\S]*?</style>', '', html_text, flags=re.IGNORECASE)
    text = re.sub(r'<script[\s\S]*?</script>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<(div|p|br|tr|li)[^>]*>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    text = unescape(text)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    filtered = []
    for line in lines:
        lower = line.lower()
        if lower.startswith('atenciosamente') or lower.startswith('cordialmente') or lower.startswith('obrigado'):
            continue
        if 'enfermeir' in lower and len(line) < 35:
            continue
        if 'dialize - betim' in lower or 'dialize - contagem' in lower:
            continue
        if '----------------' in line:
            continue
        filtered.append(line)

    return "\n".join(filtered)

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
                payload = part.get_payload(decode=True)
                if payload:
                    text_content = payload.decode('utf-8', errors='ignore')
            elif ctype == 'text/html' and not html_content:
                payload = part.get_payload(decode=True)
                if payload:
                    html_content = payload.decode('utf-8', errors='ignore')
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            raw = payload.decode('utf-8', errors='ignore')
            if msg.get_content_type() == 'text/html':
                html_content = raw
            else:
                text_content = raw

    if text_content and len(text_content.strip()) > 10:
        return text_content.strip()
    elif html_content:
        return clean_html_to_text(html_content)
    return ""

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

    if any(w in full for w in ['infeccao', 'infecc', 'intercorrencia', 'sangramento', 'febre', 'cateter', 'fav', 'atb', 'ceftazidima', 'vancomicina', 'hemocultura', 'perda de acesso', 'puncao fav', 'retirada de cdl', 'cdl']):
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
    print(f"[{now_str}] [NexaASSIST] Sincronizando caixa Titan ({TITAN_CONFIG['email']})...")
    patients = load_patients()

    try:
        mail = imaplib.IMAP4_SSL(TITAN_CONFIG['imap_server'], TITAN_CONFIG['imap_port'])
        mail.login(TITAN_CONFIG['email'], TITAN_CONFIG['password'])
        mail.select('INBOX')

        status, msg_ids = mail.search(None, 'ALL')
        ids = msg_ids[0].split()
        
        all_posts = []

        for msg_id in ids:
            id_str = msg_id.decode()
            res, msg_data = mail.fetch(msg_id, '(RFC822)')
            if not msg_data or not isinstance(msg_data[0], tuple):
                continue
            
            msg = email.message_from_bytes(msg_data[0][1])
            subject = decode_mime_words(msg.get('Subject', ''))
            sender = decode_mime_words(msg.get('From', ''))
            date_str = msg.get('Date', '')
            body = get_body(msg)

            # Ignora e-mails de boas-vindas do sistema Titan
            if 'titan-tips@titan.email' in sender.lower():
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

            post = {
                'id': f"email-titan-{id_str}",
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
                'status': 'published' if is_linked else 'pending_link',
                'author': clean_author or 'Equipe Assistencial',
                'authorRole': 'Enfermagem / Assistência (Titan)',
                'createdAt': created_at_iso,
                'readBy': []
            }

            all_posts.append(post)

        mail.close()
        mail.logout()

        # Ordena do mais novo para o mais antigo
        all_posts.sort(key=lambda x: x.get('createdAt', ''), reverse=True)

        # Salva o arquivo local synced_assist_emails.json
        output_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'synced_assist_emails.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(all_posts, f, ensure_ascii=False, indent=2)

        print(f"[{now_str}] {len(all_posts)} comunicado(s) sincronizado(s) localmente.")

        # Invoca o sincronizador do Firestore via Firebase Admin
        node_script = os.path.join(os.path.dirname(__file__), 'push_to_firestore.mjs')
        if os.path.exists(node_script):
            subprocess.run(['node', node_script], check=False)

        return all_posts

    except Exception as e:
        print(f"[{now_str}] Erro ao conectar/sincronizar IMAP Titan: {e}")
        return []

def main():
    interval = 60 # 60 segundos (1 minuto)
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
        print(f"Intervalo de Verificacao: {interval} segundos (1 minuto)")
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
