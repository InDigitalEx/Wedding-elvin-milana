# 📋 INSTALL - Полная инструкция по установке

## Требования
- **Python 3.11+** - [Скачать](https://www.python.org/downloads/)
- **Современный браузер** (Chrome, Firefox, Safari, Edge)
- **Git** (опционально) - [Скачать](https://git-scm.com/)

## Windows 10/11

### 1️⃣ Установить Python

1. Откройте https://www.python.org/downloads/
2. Нажмите "Download Python 3.x.x"
3. **Важно!** При установке отметьте ✅ "Add Python to PATH"
4. Нажмите Install Now
5. Проверьте установку:
   ```cmd
   python --version
   pip --version
   ```

### 2️⃣ Клонировать проект

```cmd
# Вариант 1: С использованием Git
git clone <url-проекта>
cd Wedding-elvin-milana

# Вариант 2: Вручную
# Скачайте ZIP файл и распакуйте
```

### 3️⃣ Установить Backend зависимости

```cmd
cd backend

# Создать виртуальное окружение
python -m venv venv

# Активировать окружение
venv\Scripts\activate

# Установить зависимости
pip install -r requirements.txt

# Проверка (должно быть 0 ошибок)
pip list
```

### 4️⃣ Запустить Backend

```cmd
# Убедитесь, что находитесь в папке backend
# и виртуальное окружение активировано (видна префикс (venv))

python main.py

# Должно вывести:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

✅ Backend запущен! Оставьте это окно открытым.

### 5️⃣ Запустить Frontend (в НОВОМ окне терминала)

```cmd
cd frontend

# Python 3 встроенный сервер
python -m http.server 3000

# Должно вывести:
# Serving HTTP on 0.0.0.0 port 3000
```

✅ Frontend запущен! Оставьте это окно открытым.

## macOS

### 1️⃣ Установить Python

**Вариант 1: Используя Homebrew (рекомендуется)**
```bash
# Установить Homebrew (если не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установить Python
brew install python@3.11

# Проверить
python3 --version
pip3 --version
```

**Вариант 2: Прямая загрузка**
1. Откройте https://www.python.org/downloads/macos/
2. Скачайте и установите Python 3.11+

### 2️⃣ Клонировать проект

```bash
# Вариант 1: С использованием Git
git clone <url-проекта>
cd Wedding-elvin-milana

# Вариант 2: Загрузить ZIP
# Откройте в Finder, распакуйте и откройте терминал в папке
```

### 3️⃣ Установить Backend зависимости

```bash
cd backend

# Создать виртуальное окружение
python3 -m venv venv

# Активировать окружение
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Проверка
pip list
```

### 4️⃣ Запустить Backend

```bash
# Убедитесь, что окружение активировано
python3 main.py

# Должно вывести:
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ Backend запущен!

### 5️⃣ Запустить Frontend (в НОВОМ терминале)

```bash
cd frontend

python3 -m http.server 3000

# Должно вывести:
# Serving HTTP on 0.0.0.0 port 3000
```

✅ Frontend запущен!

## Linux (Ubuntu/Debian)

### 1️⃣ Установить Python

```bash
# Обновить пакеты
sudo apt update
sudo apt upgrade -y

# Установить Python и pip
sudo apt install python3.11 python3.11-venv python3.11-dev -y

# Установить как python по умолчанию (опционально)
sudo update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1

# Проверить
python --version
pip --version
```

### 2️⃣ Клонировать проект

```bash
# С использованием Git
git clone <url-проекта>
cd Wedding-elvin-milana

# Или загрузить ZIP и распаковать
```

### 3️⃣ Установить Backend зависимости

```bash
cd backend

# Создать виртуальное окружение
python3.11 -m venv venv

# Активировать окружение
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Проверка
pip list
```

### 4️⃣ Запустить Backend

```bash
python3.11 main.py
```

### 5️⃣ Запустить Frontend

```bash
cd frontend
python3 -m http.server 3000
```

## 🌐 Открыть в браузере

После запуска Backend и Frontend откройте в браузере:

### Главная страница
```
http://localhost:3000
```

### Админ-панель
```
http://localhost:3000/admin
```

### API документация (Swagger UI)
```
http://localhost:8000/docs
```

### API документация (ReDoc)
```
http://localhost:8000/redoc
```

## ✅ Проверка установки

Если вы видите:
- ✅ Красивую главную страницу с именами жениха и невесты
- ✅ Админ-панель с разделами управления
- ✅ Работающие кнопки и формы

То установка **успешна**! 🎉

## 🚨 Решение ошибок

### Ошибка: "python: command not found"
```bash
# Используйте python3 вместо python
python3 --version

# Или установите alias (Linux/macOS)
alias python=python3
```

### Ошибка: "No module named 'fastapi'"
```bash
# Активируйте виртуальное окружение:
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Затем установите зависимости:
pip install -r requirements.txt
```

### Ошибка: "Address already in use"
```bash
# Порт занят другим процессом
# Измените порт:
python -m http.server 3001  # вместо 3000
```

### Ошибка: "CORS error" или "Failed to fetch"
```
# Убедитесь:
1. Backend запущен на http://localhost:8000
2. Frontend запущен на http://localhost:3000
3. Оба окна терминала открыты и активны
```

## 📝 Дополнительные команды

### Активировать окружение (Backend)

**Windows:**
```cmd
cd backend
venv\Scripts\activate
```

**macOS/Linux:**
```bash
cd backend
source venv/bin/activate
```

### Деактивировать окружение
```bash
deactivate
```

### Переустановить зависимости
```bash
pip install --upgrade -r requirements.txt
```

### Помощь по Python
```bash
python --version              # Версия Python
pip list                      # Список пакетов
pip show fastapi             # Информация о пакете
```

## 🔄 Обновление после изменений

Если вы затянули новые коммиты:
```bash
# Backend
cd backend
pip install -r requirements.txt  # На случай новых зависимостей

# Frontend
# Просто обновите страницу в браузере (Ctrl+R)
```

## 📦 Запуск с использованием скриптов (Windows/macOS/Linux)

**Windows:**
```cmd
run_backend.bat
run_frontend.bat  # В отдельном окне
```

**macOS/Linux:**
```bash
./run_backend.sh
./run_frontend.sh  # В отдельном терминале
```

## 🎯 Готово к работе!

Теперь вы можете:

1. **Перейти в админ-панель** и установить параметры свадьбы
2. **Создать приглашения** с QR кодами
3. **Отправить ссылки** гостям
4. **Отслеживать ответы** на панели управления
5. **Экспортировать список** гостей в CSV

---

**Дополнительная помощь:**
- Полная документация: [README.md](README.md)
- Быстрый старт: [QUICKSTART.md](QUICKSTART.md)
- Проблемы? Смотрите раздел "Решение проблем" в README.md
