# 🌐 Развёртывание сервера обновлений для всех пользователей

## 📋 Варианты хостинга

### ⭐ Вариант 1: Render.com (Рекомендуется)
**Плюсы:** Бесплатный, автоматический SSL, простой деплой  
**Минусы:** Засыпает после 15 минут бездействия (на бесплатном плане)

### Шаги:

1. **Создай GitHub репозиторий:**
   ```bash
   cd C:\Users\flehka\Desktop\claudecode\mod-update-server
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Загрузи на GitHub:**
   - Создай новый репозиторий на https://github.com/new
   - Назови его `arcanic-mod-server`
   - Выполни команды:
   ```bash
   git remote add origin https://github.com/ТВОЙ_НИК/arcanic-mod-server.git
   git branch -M main
   git push -u origin main
   ```

3. **Деплой на Render:**
   - Зайди на https://render.com
   - Нажми **"New +"** → **"Web Service"**
   - Подключи свой GitHub репозиторий
   - Настройки:
     - **Name:** `arcanic-mod-server`
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Нажми **"Create Web Service"**

4. **Получи URL:**
   - После деплоя ты получишь URL типа: `https://arcanic-mod-server.onrender.com`
   - Этот URL работает из любой точки мира!

5. **Обнови лаунчер:**
   - Замени `http://localhost:3000` на твой новый URL

---

### 💎 Вариант 2: Railway.app
**Плюсы:** Не засыпает, 500 часов бесплатно  
**Минусы:** Ограничение по часам

1. Зайди на https://railway.app
2. Подключи GitHub репозиторий
3. Автоматический деплой — всё!

---

### 🔥 Вариант 3: Glitch.com (Самый простой)
1. Зайди на https://glitch.com
2. **New Project** → **Import from GitHub**
3. Вставь URL репозитория
4. Готово! Glitch даст тебе URL

---

### 🏠 Вариант 4: Свой компьютер 24/7

Если компьютер работает постоянно:

1. **Используй ngrok (временно):**
   ```bash
   npm install -g ngrok
   ngrok http 3000
   ```
   Получишь временный публичный URL (сбрасывается при перезапуске)

2. **Проброс портов на роутере (постоянно):**
   - Зайди в настройки роутера (обычно 192.168.1.1)
   - Найди "Port Forwarding" / "Проброс портов"
   - Проброс порта 3000 на свой IP
   - Используй свой внешний IP (проверь на https://myip.com)
   - **Минус:** IP может меняться, нужен статический IP или DynDNS

---

## 🔧 После развёртывания

Когда получишь публичный URL (например `https://arcanic-mod-server.onrender.com`), скажи мне — я обновлю лаунчер, чтобы он проверял обновления с твоего сервера.

---

## 📝 Тестирование

После деплоя проверь:
```bash
# Открой в браузере:
https://твой-url.onrender.com

# Или через curl:
curl https://твой-url.onrender.com/api/versions
```

Должен вернуться JSON с версиями модов.

---

## 💡 Рекомендация

Для начала используй **Render.com** — это самый простой способ. Если лаунчер станет популярным и нужна большая стабильность, перейдёшь на платный план или VPS.
