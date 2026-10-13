@echo off
REM Sirve el juego en http://localhost:8080 (necesario para micrófono / voz).
cd /d "%~dp0"
start "" http://localhost:8080
where python >nul 2>nul && (python -m http.server 8080 & goto :eof)
npx --yes http-server -p 8080 -c-1
