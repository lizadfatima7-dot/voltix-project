@echo off
setlocal

where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo [error] Windows PowerShell was not found. Install or repair Windows PowerShell, then run this script again.
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-windows.ps1" %*
exit /b %ERRORLEVEL%
