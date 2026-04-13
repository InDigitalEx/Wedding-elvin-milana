@echo off
chcp 65001 > nul
title Wedding Admin Panel - Frontend Server

echo.
echo ============================================
echo 🎉 Свадебный сайт - Frontend сервер
echo ============================================
echo.

cd /d "%~dp0frontend"

echo ✓ Проверка Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Python не установлен!
    echo Скачайте Python с https://www.python.org
    pause
    exit /b 1
)

echo.
echo ============================================
echo 🚀 Запуск сервера...
echo ============================================
echo.
echo 📍 Сайт доступен на: http://localhost:3000
echo 📍 Админ-панель: http://localhost:3000/admin
echo.
echo Нажмите Ctrl+C для остановки сервера
echo.

python -m http.server 3000

pause
