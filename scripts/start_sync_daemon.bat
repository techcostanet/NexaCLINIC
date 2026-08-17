@echo off
title NexaASSIST - Sincronizador Continuo Titan Email
echo ======================================================
echo    NexaASSIST - Monitoramento de E-mails Titan (60s)
echo    Conta: integracao@dialize.com.br
echo ======================================================
cd /d "%~dp0\.."
python scripts/sync_assist_emails.py --loop
pause
