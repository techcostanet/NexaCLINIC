"""
NexaASSIST - Sincronizador de E-mails Assistenciais (Titan IMAP)
Conta Monitorada: integracao@dialize.com.br
Servidor IMAP: imap.titan.email:993 (SSL/TLS)
"""

import imaplib
import email
from email.header import decode_header
import json
import re
import os
import sys
from html import unescape
from datetime import datetime

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
    # Remove scripts and style
    text = re.sub(r'<style[\s\S]*?</style>', '', html_text, flags=re.IGNORECASE)
    text = re.sub(r'<script[\s\S]*?</script>', '', text, flags=re.IGNORECASE)
    # Replace block tags with newline
    text = re.sub(r'<(div|p|br|tr|li)[^>]*>', '\n', text, flags=re.IGNORECASE)
    # Remove remaining HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Unescape HTML entities
    text = unescape(text)
    # Clean redundant whitespace and lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Filter out common signatures and disclaimers
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
    import unicodedata
    n = unicodedata.normalize('NFD', text.lower())
    n = "".join(c for c in n if unicodedata.category(c) != 'Mn')
    n = re.sub(r'[^a-z0-9\s]', ' ', n)
    return re.sub(r'\s+', ' ', n).strip()

def load_patients():
    patients = []
    data_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'import_2026.json')
    if os.path.exists(data_path):
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    patients = data
                elif isinstance(data, dict) and 'patients' in data:
                    patients = data['patients']
        except Exception as e:
            print(f"Aviso ao carregar import_2026.json: {e}")
    return patients

def match_patient(text, patients_list):
    if not text or not patients_list:
        return None, 0.0, 'none'
    
    norm_text = normalize_text(text)
    best_patient = None
    highest_score = 0.0
    match_type = 'none'

    for pat in patients_list:
        pat_name = pat.get('name', '')
        if not pat_name:
            continue
        
        norm_pat = normalize_text(pat_name)
        parts = [p for p in norm_pat.split() if len(p) > 2]

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

        # 3. Match de Tokens
        matched_tokens = sum(1 for p in parts if p in norm_text)
        token_ratio = matched_tokens / len(parts) if parts else 0
        if matched_tokens >= 2 and token_ratio >= 0.6:
            score = 0.75 + (token_ratio * 0.20)
            if score > highest_score:
                highest_score = score
                best_patient = pat
                match_type = 'token_overlap'

    return best_patient, highest_score, match_type

def classify_content(subject, body):
    full = normalize_text(f"{subject} {body}")
    category = 'Geral'
    urgency = 'Informativo'

    if any(w in full for w in ['internad', 'internacao', 'cti', 'uti', 'hospital']):
        category = 'Internação'
        urgency = 'Urgente'
    elif any(w in full for w in ['alta', 'retorno', 'desospitaliz']):
        category = 'Alta'
        urgency = 'Atenção'
    elif any(w in full for w in ['transfer', 'transferencia', 'vaga']):
        category = 'Transferência'
        urgency = 'Atenção'
    elif any(w in full for w in ['infeccao', 'intercorrencia', 'sangramento', 'febre', 'cateter', 'fav', 'atb', 'ceftazidima', 'vancomicina', 'hemocultura']):
        category = 'Intercorrência'
        urgency = 'Urgente'
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

PROCESSED_IDS_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'processed_email_ids.json')

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

def sync_inbox():
    now_str = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    print(f"[{now_str}] Verificando caixa Titan ({TITAN_CONFIG['email']})...")
    patients = load_patients()
    processed_ids = load_processed_ids()

    try:
        mail = imaplib.IMAP4_SSL(TITAN_CONFIG['imap_server'], TITAN_CONFIG['imap_port'])
        mail.login(TITAN_CONFIG['email'], TITAN_CONFIG['password'])
        mail.select('INBOX')

        status, msg_ids = mail.search(None, 'ALL')
        ids = msg_ids[0].split()
        
        new_posts = []
        new_ids_found = 0

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

            # Ignora e-mails automáticos da Titan
            if 'titan-tips@titan.email' in sender.lower():
                processed_ids.add(id_str)
                continue

            matched_pat, conf, m_type = match_patient(f"{subject} {body}", patients)
            category, urgency = classify_content(subject, body)

            clean_author = sender.split('<')[0].replace('"', '').strip()
            is_linked = matched_pat and conf >= 0.75

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
                'createdAt': datetime.now().isoformat(),
                'readBy': []
            }

            new_posts.append(post)
            processed_ids.add(id_str)
            new_ids_found += 1
            print(f" -> NOVO E-MAIL [{id_str}]: Assunto='{subject}' | Paciente='{post['patientName']}' | Categoria='{category}' | Urgência='{urgency}'")

        mail.close()
        mail.logout()

        save_processed_ids(processed_ids)

        if new_posts:
            # Atualiza o arquivo synced_assist_emails.json
            output_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'synced_assist_emails.json')
            existing_posts = []
            if os.path.exists(output_path):
                try:
                    with open(output_path, 'r', encoding='utf-8') as f:
                        existing_posts = json.load(f)
                except Exception:
                    existing_posts = []
            
            all_posts = new_posts + existing_posts
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(all_posts, f, ensure_ascii=False, indent=2)

            print(f"[{now_str}] {len(new_posts)} novo(s) e-mail(s) sincronizado(s) e salvo(s)!")
        else:
            print(f"[{now_str}] Caixa verificada. Nenhum e-mail novo (Total processados: {len(processed_ids)}).")

        return new_posts

    except Exception as e:
        print(f"[{now_str}] Erro ao conectar/sincronizar IMAP Titan: {e}")
        return []

def main():
    import time
    interval = 60 # 60 segundos
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
