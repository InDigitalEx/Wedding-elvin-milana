#!/bin/bash

echo "============================================"
echo "🎉 Свадебный сайт - Frontend сервер"
echo "============================================"
echo ""

cd "$(dirname "$0")/frontend"

echo "✓ Проверка Python..."
if ! command -v python3 &> /dev/null; then
    echo "✗ Python не установлен!"
    echo "Скачайте Python с https://www.python.org"
    exit 1
fi

echo ""
echo "============================================"
echo "🚀 Запуск сервера..."
echo "============================================"
echo ""
echo "📍 Сайт доступен на: http://localhost:3000"
echo "📍 Админ-панель: http://localhost:3000/admin"
echo ""
echo "Нажмите Ctrl+C для остановки сервера"
echo ""

cd "$(dirname "$0")/frontend"
python3 -m http.server 3000
