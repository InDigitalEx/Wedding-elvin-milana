@echo off
chcp 65001 > nul
title Wedding Admin Panel - Backend Server

echo.
echo ============================================
echo 🎉 Свадебный сайт - Backend сервер
echo ============================================
echo.

cd /d "%~dp0backend"

echo ✓ Проверка Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Python не установлен!
    echo Скачайте Python с https://www.python.org
    pause
    exit /b 1
)

echo ✓ Проверка виртуального окружения...
if not exist venv (
    echo Создание виртуального окружения...
    python -m venv venv
)

echo ✓ Активирование виртуального окружения...
call venv\Scripts\activate.bat

echo ✓ Установка зависимостей...
pip install -r requirements.txt -q

echo.
echo ============================================
echo 🚀 Запуск сервера...
echo ============================================
echo.
echo 📍 API доступен на: http://localhost:8000
echo 📚 Документация: http://localhost:8000/docs
echo.
echo Нажмите Ctrl+C для остановки сервера
echo.

python main.py

pause
