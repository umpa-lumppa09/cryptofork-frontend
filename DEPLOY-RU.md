# Перенос CryptoFork: Vercel + Railway

Эти архивы подготовлены для новых доменов. Менять адреса в JavaScript/Python не нужно.
Вместо этого заполните Variables по примерам в корне каждого проекта.
Реальные секреты, база и привязки старых аккаунтов в архивы не входят.
Работающий старый сайт этими файлами не изменялся.

## 1. Что лежит в архивах

Фронтенд: HTML, api/, assets/, lib/, CSS/JS, vercel.json, package.json.
Бэкенд: Python-код, Dockerfile, railway.json, runtime_config.py, tools/.
В GitHub загружается распакованное содержимое, не ZIP.
В корне репозитория фронтенда должны быть api/ и vercel.json.
В корне бэкенда — Dockerfile, server.py и railway.json.
Не пропускайте папки при ручной загрузке. Секретные .env не загружайте.
VARIABLES-*.env.example — безопасные шаблоны без реальных секретов.
Они сами по себе не настраивают хостинг: значения нужно внести в Variables.

## 2. Определите два адреса

SITE_ORIGIN — один основной адрес фронтенда, например https://www.example.com.
Если выбрали www, в Vercel Domains перенаправьте example.com на www.example.com.
Если выбрали без www — сделайте наоборот. Не используйте два независимых основных адреса.
Указывайте https://, без /article.html, параметров и других путей.
Конечный / и пробелы по краям код убирает, но лучше их не вводить.

BACKEND_URL в Vercel и PUBLIC_BACKEND_URL в Railway — ОДИН И ТОТ ЖЕ
публичный HTTPS-адрес НОВОГО Railway-сервиса, например https://example-production.up.railway.app.
Он виден в Settings → Networking после Generate Domain; target port — 8080.
Не используйте private *.railway.internal, адрес панели railway.com/project/... или домен старого сервера.

## 3. Создайте один общий секрет

На своём компьютере выполните:

    python3 -c 'import secrets; print(secrets.token_hex(32))'

Скопируйте результат в ANALYTICS_PROXY_SECRET на ОБОИХ хостингах.
Это случайная строка, а не токен Telegram, не домен и не ID проекта.
Значения должны совпадать посимвольно. Не добавляйте кавычки и пробелы.
Не публикуйте результат в GitHub, скриншотах или чате.
Для нового отдельного проекта создавайте новый секрет.

## 4. Railway — настройте бэкенд

1. Создайте сервис из GitHub-репозитория cryptofork-backend. Root Directory: /.
2. Сборка по Dockerfile; Start Command оставьте пустой (взят из Dockerfile).
3. Через правый клик / Cmd+K создайте Volume, подключите к ЭТОМУ сервису, Mount Path: /data.
   Папка /data внутри контейнера сама по себе не означает, что Volume подключён.
4. Создайте публичный домен в Networking, target port 8080.
5. В Variables → Raw Editor вставьте ключи из VARIABLES-RAILWAY.env.example,
   заменив все REPLACE... и примерные домены своими значениями.
6. DATA_DIR=/data. PORT и RAILWAY_* вручную не добавляйте — их выставляет Railway.
7. Примените изменения и дождитесь успешного деплоя. Healthcheck /health уже настроен.

Обязательные: SITE_ORIGIN, PUBLIC_BACKEND_URL, ANALYTICS_PROXY_SECRET, DATA_DIR.
ALLOWED_ORIGINS — дополнительные допустимые адреса через запятую. SITE_ORIGIN разрешается автоматически.
Например https://example.com,https://www.example.com. Без / в путях.
Если Telegram не нужен, TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID оставьте пустыми.
Если нужен — заполните ОБА.

### Telegram

TELEGRAM_BOT_TOKEN: токен нового бота из @BotFather.
TELEGRAM_CHAT_ID: числовой ID личного чата или группы (у групп обычно начинается с -100).
В личном чате предварительно отправьте боту /start; в группе добавьте бота с правом отправки.
MARKETING_CHAT_ID: необязательный дополнительный чат уведомлений; можно оставить пустым.
Один бот — один активный webhook. Для отдельного проекта используйте отдельного бота
или отключите старый сервис от этого бота. Не запускайте несколько серверов с одним токеном.
Webhook автоматически строится как PUBLIC_BACKEND_URL + /telegram/callback.
После запуска ищите Telegram moderation webhook ready в логах.
Telegram configured=true в /health означает только наличие токена и chat ID, а не успешную доставку.
/setlanding управляет существующими образовательными вариантами. В группе команда разрешена администраторам.
При ответе на новый комментарий нажмите «Ответ от автора» и ответьте на запрос того же бота тем же Telegram-аккаунтом.
Старые сообщения/кнопки другого бота после миграции не используйте для проверки.

## 5. Vercel — настройте фронтенд

1. Import Git Repository → cryptofork-frontend.
2. Framework: Other; Root Directory: ./; Node.js 22.x.
3. Build Command: пусто. Output Directory: . (корень).
4. Добавьте свой домен в Settings → Domains и дождитесь HTTPS.
5. В Settings → Environment Variables → Production внесите:

    SITE_ORIGIN=https://www.example.com
    BACKEND_URL=https://example-production.up.railway.app
    ANALYTICS_PROXY_SECRET=ТОТ_ЖЕ_СЕКРЕТ_ЧТО_В_RAILWAY
    WEBINAR_TELEGRAM_URL=https://t.me/your_webinar

6. Redeploy последнего коммита. Изменение Variables не обновляет уже созданный деплой.
   Если правили код в GitHub, публикуйте новый коммит, а не повтор старого.
7. Основная страница остаётся на /. Варианты читаются из lib/pages/webinar-1.html и webinar-2.html.
   Telegram-ссылка регистрации в выдаваемом HTML берётся из WEBINAR_TELEGRAM_URL.
   Она должна быть ссылкой https://t.me/... без параметров.
   Тексты/дизайн редактируются в этих HTML и landing.css; после правки нужен деплой.

## 6. VK ID и восстановление пароля

Для своего приложения заполните VK_CLIENT_ID в Railway числовым ID из кабинета VK ID.
В настройках приложения укажите основной домен сайта и ТОЧНЫЙ Redirect URL:

    https://www.example.com/api/auth/callback

Адрес строится сервером из SITE_ORIGIN. Не оставляйте старый домен cryptofork.vercel.app.
Также проверьте разрешённый домен/доступы в кабинете VK. Без VK_CLIENT_ID кнопка VK не работает;
регистрация по почте и паролю остаётся доступной. Mail-вход в интерфейсе отключён.
Для восстановления пароля заполните SMTP_HOST, SMTP_PORT, SMTP_FROM, SMTP_USER, SMTP_PASSWORD.
Без SMTP восстановление недоступно. У SMTP_FROM должен быть разрешённый провайдером отправитель.
Эти настройки не реализуют подтверждение владения email при регистрации.

## 7. База: новый проект или перенос данных

При пустом Volume приложение само создаст /data/analytics.sqlite3 и таблицы.
Комментарии, аккаунты, выбор версии, счётчик дочитываний и аналитика находятся в этой базе.
Новый Volume НЕ получает данные старого автоматически. .vercel и .railway тоже не переносят базу.

Если старые данные не нужны, этот раздел можно пропустить.
На время переноса не добавляйте новые записи на обоих сайтах. Восстановление ЗАМЕНЯЕТ данные,
а не объединяет их. Сохраняйте старый Volume до проверки нового.

### Экспорт из старого сервера (Console)

Вставьте целиком:

```bash
python - <<'PYCODE'
import sqlite3
src=sqlite3.connect('file:/data/analytics.sqlite3?mode=ro',uri=True)
dst=sqlite3.connect('/tmp/cryptofork-transfer.sqlite3')
src.backup(dst)
print('Проверка:',dst.execute('PRAGMA integrity_check').fetchone()[0])
for row in dst.execute('SELECT thread,COUNT(*) FROM comments GROUP BY thread'):print(*row)
dst.close();src.close()
PYCODE
```

В файловой панели Console: значок диска → tmp → cryptofork-transfer.sqlite3 → Download.
Это согласованный снимок SQLite, включающий данные журнала; не копируйте один живой .sqlite3 обычным cp.
Файл содержит аккаунты/аналитику: не помещайте его в GitHub и публичную папку сайта.

### Импорт в новый сервер

Убедитесь, что Volume подключён к /data, DATA_DIR=/data, сервис запущен.
Через Console → файловую панель → корень → data → Upload загрузите копию как
/data/cryptofork-transfer.sqlite3. Затем в терминале нового сервера выполните:

    python /app/tools/db_transfer.py check /data/cryptofork-transfer.sqlite3
    python /app/tools/db_transfer.py restore /data/cryptofork-transfer.sqlite3 --confirm-replace

Инструмент проверит SQLite, сохранит текущую базу в /data/before-transfer-...sqlite3,
восстановит старую и покажет количества комментариев. После этого перезапустите новый сервис:
секрет подписи из базы кешируется приложением при запуске.

    python /app/tools/db_transfer.py check

Проверьте комментарии после перезапуска и затем ещё одного Redeploy: данные должны сохраниться.
Если сообщения Telegram ещё не отправлялись на старом сервере, копия может содержать очередь:
после запуска новый бот может отправить накопленные уведомления.
Создайте новый тестовый комментарий, а не используйте старые Telegram-кнопки.
После проверки удалите файл переноса с сервера через файловую панель; резервную копию сохраните безопасно.

## 8. Проверка вручную

В Railway Console:

    python /app/tools/check_config.py
    python /app/tools/db_transfer.py check

Проверка конфигурации не печатает токены или секреты. Она не проверяет доставку в Telegram.
В браузере откройте https://ВАШ_BACKEND/health: ожидается ok=true.
На статье TOKEN2049 Network → community должен возвращать 200 и comments.
Пустой comments=[] — связь есть, но у этой статьи нет записей; проверьте перенос и thread.
После согласия на аналитику Network → visit должен возвращать 200; проверьте уведомление Telegram.
При выборе версии корень / меняет содержимое, не адрес; кеш может задержать обновление до примерно 20 секунд.
Откройте VK ID и убедитесь, что возврат идёт на новый домен, а не на старый.
Счётчик статьи: 11 493 + число уникальных дочитываний в базе. Тот же браузер повторно не учитывается.

## 9. Типовые ошибки

origin_denied: SITE_ORIGIN Vercel должен совпадать с Request Headers → Origin браузера.
www и без www — разные origin. Railway SITE_ORIGIN должен быть тем же; дополнительные адреса — ALLOWED_ORIGINS.
deployment_not_configured: отсутствует/неверен SITE_ORIGIN или BACKEND_URL в Vercel.
proxy_not_configured / auth_unavailable: проверьте наличие ANALYTICS_PROXY_SECRET, затем Redeploy.
denied: проверьте совпадение ANALYTICS_PROXY_SECRET на двух хостингах.
collector_unavailable: проверьте BACKEND_URL, работу /health и логи Railway.
Сайт красивый, но нет API: убедитесь, что api/ загружена и хостинг именно Vercel, не GitHub Pages.
После Redeploy пропадают записи: Volume отсутствует или подключён не к DATA_DIR.
VK не загружается: Network → start → Response, затем проверьте VK_CLIENT_ID и кабинет VK.
Ответы Telegram не приходят: PUBLIC_BACKEND_URL, webhook, новый бот/новое сообщение, chat ID.

## 10. Какие служебные файлы переносить

Переносятся: vercel.json, railway.json, Dockerfile, .gitignore, .dockerignore, package.json,
runtime_config.py, lib/runtime-config.cjs, api/, lib/pages/, assets/, tools/.
Не переносятся: .vercel/, .railway/, .git/, __pycache__/, node_modules/, реальные .env и SQLite-файлы.
Привязки новых проектов создают сами хостинги. Никаких старых projectId/teamId копировать не нужно.
Код старого CryptoFork сохранён. Юридические тексты и реквизиты сохранены как в текущем проекте;
если меняется владелец, обновите legal-pages.js, landing-privacy.html, landing-terms.html и footer.js.
В автономной статье также есть копия соответствующих JS в assets/optimized: обновляйте обе версии.
После любых правок исходников требуется новый деплой.

Официальные справки:
https://vercel.com/docs/environment-variables/managing-environment-variables
https://docs.railway.com/volumes
