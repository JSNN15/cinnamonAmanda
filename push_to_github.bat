@echo off
cd /d "%~dp0"
echo ==========================================================
echo   Subiendo Cinnamoroll Land a GitHub (cinnamonAmanda)
echo ==========================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
  echo [OK] Repositorio subido con exito a GitHub!
) else (
  echo [!] Ocurrio un error al subir. Verifica tus credenciales de GitHub.
)
echo.
pause
