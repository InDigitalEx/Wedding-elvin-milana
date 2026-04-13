#!/bin/bash

echo "============================================"
echo "🎉 Свадебный сайт - Backend сервер"
echo "============================================"
echo ""

cd "$(dirname "$0")/backend"

echo "✓ Проверка Python..."
if ! command -v python3 &> /dev/null; then
    echo "✗ Python не установлен!"
    echo "Скачайте Python с https://www.python.org"
    exit 1
fi

echo "✓ Проверка виртуального окружения..."
if [ ! -d "venv" ]; then
    echo "Создание виртуального окружения..."
    python3 -m venv venv
fi

echo "✓ Активирование виртуального окружения..."
source venv/bin/activate

echo "✓ Установка зависимостей..."
pip install -r requirements.txt -q

echo ""
echo "============================================"
echo "🚀 Запуск сервера..."
echo "============================================"
echo ""
echo "📍 API доступен на: http://localhost:8000"
echo "📚 Документация: http://localhost:8000/docs"
echo ""
echo "Нажмите Ctrl+C для остановки сервера"
echo ""

python main.py
