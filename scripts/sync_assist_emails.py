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

def sync_inbox():
    print(f"[{datetime.now().strftime('%d/%m/%Y %H:%M:%S')}] Iniciando sincronização IMAP com Titan ({TITAN_CONFIG['email']})...")
    patients = load_patients()
    print(f"Carregados {len(patients)} pacientes para matching.")

    try:
        mail = imaplib.IMAP4_SSL(TITAN_CONFIG['imap_server'], TITAN_CONFIG['imap_port'])
        mail.login(TITAN_CONFIG['email'], TITAN_CONFIG['password'])
        mail.select('INBOX')

        status, msg_ids = mail.search(None, 'ALL')
        ids = msg_ids[0].split()
        print(f"Total de e-mails encontrados na caixa: {len(ids)}")

        synced_posts = []
        for msg_id in ids:
            res, msg_data = mail.fetch(msg_id, '(RFC822)')
            if not msg_data or not isinstance(msg_data[0], tuple):
                continue
            
            msg = email.message_from_bytes(msg_data[0][1])
            subject = decode_mime_words(msg.get('Subject', ''))
            sender = decode_mime_words(msg.get('From', ''))
            date_str = msg.get('Date', '')
            body = get_body(msg)

            # Ignora e-mails automáticos do próprio sistema Titan Tips
            if 'titan-tips@titan.email' in sender.lower():
                continue

            matched_pat, conf, m_type = match_patient(f"{subject} {body}", patients)
            category, urgency = classify_content(subject, body)

            clean_author = sender.split('<')[0].replace('"', '').strip()
            is_linked = matched_pat and conf >= 0.75

            post = {
                'id': f"email-{msg_id.decode()}-{int(datetime.now().timestamp())}",
                'source': 'email',
                'originalFrom': sender,
                'originalSubject': subject,
                'title': subject or f"Comunicado - {category}",
                'message': body,
                'category': category,
                'urgency': urgency,
                'patientId': matched_pat.get('id') if is_linked else None,
                'patientName': matched_pat.get('name') if is_linked else None,
                'room': matched_pat.get('room', 'Geral') if is_linked else 'Geral',
                'shift': matched_pat.get('shift', 'Geral') if is_linked else 'Geral',
                'matchConfidence': conf,
                'matchType': m_type,
                'status': 'published' if is_linked else 'pending_link',
                'author': clean_author or 'Enfermagem / Assistência',
                'authorRole': 'Equipe Assistencial (E-mail Titan)',
                'createdAt': datetime.now().toISOString() if hasattr(datetime.now(), 'toISOString') else datetime.now().isoformat(),
                'readBy': []
            }

            synced_posts.append(post)
            print(f" -> E-mail ID {msg_id.decode()}: Assunto='{subject}' | Paciente='{post['patientName']}' (Conf: {conf*100:.0f}%) | Categoria='{category}' | Urgência='{urgency}'")

        mail.close()
        mail.logout()

        # Salva o resultado sincronizado em src/data/synced_assist_emails.json
        output_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'synced_assist_emails.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(synced_posts, f, ensure_ascii=False, indent=2)

        print(f"Sucesso! {len(synced_posts)} comunicados salvos em {output_path}.")
        return synced_posts

    except Exception as e:
        print(f"Erro durante a sincronização IMAP: {e}")
        return []

if __name__ == '__main__':
    sync_inbox()
