# CryptoFork frontend

Статический интерфейс и Vercel Functions в api/. Зависимости npm не требуются.

Подключите репозиторий к существующему проекту cryptofork в Vercel: Settings → Git → Connect Git Repository.
Корень репозитория: ./; Framework Preset: Other; Build Command: пусто; Output Directory: . (корень).
Node.js: 22.x. Сохраните существующую переменную ANALYTICS_PROXY_SECRET.

Backend URL: https://visitor-notifications-production.up.railway.app
Origin: https://cryptofork.vercel.app
Они указаны в api/auth/[action].js и api/analytics/[endpoint].js. При сохранении текущих проектов менять их не нужно.
Не размещайте проект на GitHub Pages: нужны серверные функции api/.
