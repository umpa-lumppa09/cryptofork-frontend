const lessons = [
  {
    title: 'Что такое ноды в экосистеме криптовалют',
    intro: 'Объясняем, как узлы поддерживают блокчейн, чем отличаются полные, лёгкие и архивные клиенты и что нужно для запуска своего узла.',
    button: 'Разобраться в нодах бесплатно',
    sections: [
      ['Что такое нода и какие бывают узлы', 'Нода — это программа, которая подключается к другим участникам блокчейн-сети. Она обменивается данными с соседними узлами. Какие сведения она хранит и какие проверки может выполнить сама, зависит от сети и режима работы.'],
      ['Как узлы поддерживают сеть', 'При первом подключении полная нода догружает историю и проверяет её. Затем она принимает новые блоки, сверяет их с правилами и может передавать дальше. В сетях с доказательством доли у валидаторов есть отдельная роль: они предлагают блоки или голосуют за них по правилам сети.'],
      ['Что происходит с новым блоком', 'Рассмотрим три ситуации, с которыми полная нода может столкнуться после получения блока.'],
      ['Что нужно для своего узла', 'Сначала определите задачу: самостоятельная проверка, доступ к историческим данным или участие в консенсусе. Выберите клиент, поддерживаемый сетью, и сверьте требования к диску, памяти и интернет-каналу с его документацией. Учтите время первой синхронизации, рост объёма данных и регулярные обновления.'],
    ],
  },
  {
    title: 'Что такое ноды в экосистеме криптовалют',
    intro: 'Проследим путь одного блока и покажем, какой узел выбрать для проверки данных, работы с историей или участия в консенсусе.',
    button: 'Попасть на вебинар',
    sections: [
      ['Как узел получает новый блок', 'Нода — программа, которая обменивается данными с другими участниками сети. Если сосед сообщает о новом блоке, узел может запросить его данные. Самостоятельная проверка блока состоит из нескольких этапов.'],
      ['Чем отличаются ноды и валидаторы', 'Полная нода проверяет блоки по правилам протокола. Лёгкий клиент запрашивает только нужные сведения и доказательства. Архивный узел может обслуживать запросы к прошлым состояниям сети. Валидатор в сетях с доказательством доли дополнительно участвует в предложении или подтверждении блоков.'],
      ['Каким может быть результат проверки', 'Действия узла зависят от того, соблюдены ли правила сети и достаточно ли данных, чтобы это проверить.'],
      ['Как подготовиться к запуску', 'Выберите сеть, клиент и режим хранения. Перед установкой проверьте, хватит ли места на SSD, оперативной памяти и пропускной способности подключения. Первичная синхронизация создаёт отдельную нагрузку. После запуска планируйте обновления клиента и следите за свободным местом.'],
    ],
  },
];

const telegramChat = 'https://t.me/cryptofork_webinar';
const cover = '/assets/landing-nodes-rbc.webp';
const coverAlt = 'Рисованные ретрокомпьютеры обмениваются данными по сети без центрального узла';

const nodeExamples = [
  ['Полная нода', 'Хранит и проверяет данные по правилам протокола.'],
  ['Нода с обрезанным хранением', 'Проверяет блоки и освобождает место на диске, удаляя старые данные блоков.'],
  ['Лёгкий клиент', 'Загружает меньше данных и проверяет отдельные сведения с помощью доказательств.'],
];

const blockExamples = [
  ['Получение', 'Узел получает сведения о блоке и запрашивает нужные данные.'],
  ['Проверка', 'Нода сверяет структуру блока и условия его транзакций.'],
  ['Передача', 'Допустимые данные могут получить другие узлы сети.'],
];

const outcomes = [
  ['Блок прошёл проверку', 'Узел может сообщить соседям, что у него есть этот блок.'],
  ['Не хватает предыдущего блока', 'Узел запрашивает недостающие данные, чтобы проверить связь блоков.'],
  ['Блок нарушает правила', 'Узел отклоняет его и продолжает проверять другие данные.'],
];

const icons = {
  nodes: '<rect x="3" y="4" width="6" height="6" rx="1"/><rect x="15" y="4" width="6" height="6" rx="1"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M6 10v2h12v-2m-6 2v3"/>',
  verify: '<path d="M12 22s7-3 7-10V5l-7-3-7 3v7c0 7 7 10 7 10z"/><path d="m9 12 2 2 4-4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
  question: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.6-3.1A8.5 8.5 0 1 1 21 11.5Z"/><path d="M10 9a2 2 0 1 1 3 1.8c-.8.5-1 .8-1 1.7m0 3h.01"/>',
  telegram: '<path d="m21 4-4 16-5-4-3 3v-5L21 4 3 11l6 3"/>',
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[name]}</svg>`;
}

function cards(items, className = 'cards') {
  return `<div class="${className}">${items.map(([title, body], index) => `<div><span class="card-icon" aria-hidden="true">${icon(['nodes', 'verify', 'layers'][index])}</span><h3>${title}</h3><p>${body}</p></div>`).join('')}</div>`;
}

function render(variant, bucket) {
  const { title, intro, button, sections } = lessons[variant - 1];
  const article = sections.map(([heading, paragraph], index) => `
    <section id="part-${index + 1}"><h2>${heading}</h2><p>${paragraph}</p>
    ${index === 0 ? cards(variant === 1 ? nodeExamples : blockExamples) : ''}
    ${index === 1 ? '<p class="pull-quote">Каждая полная нода проверяет блок по правилам протокола независимо от соседей.</p>' : ''}
    ${index === 2 ? cards(outcomes, 'cards outcome-cards') + `<p class="takeaway">Решение зависит от данных блока и правил конкретной сети.</p><div class="note"><strong>Проверка блока на примере</strong><p>Посмотрите, что происходит с блоком при получении, проверке и передаче по сети.</p><a class="button" href="${telegramChat}">Попасть на вебинар</a></div>` : ''}
    ${index === 3 ? '<p class="takeaway">Свой узел даёт возможность самостоятельно проверять данные. Его работа требует места на диске, трафика и времени на обслуживание.</p>' : ''}
    </section>`).join('');
  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | CryptoFork</title><meta name="description" content="${intro}">
<link rel="stylesheet" href="/landing.css?v=atmosphere"><script src="/landing.js" defer></script></head>
<body data-variant="${variant}" data-bucket="${bucket}" id="top">
<header class="site-header"><div class="shell"><a class="brand" href="#top"><span class="brand-mark">${icon('nodes')}</span><span class="brand-word">Crypto<span>Fork</span></span></a><nav aria-label="Навигация"><a href="#part-1">О нодах</a><a href="#part-2">Проверка</a><a href="#part-3">Примеры</a><a class="header-faq" href="#faq" aria-label="Вопросы">${icon('question')}<span>Вопросы</span></a></nav><a class="header-action" href="${telegramChat}" aria-label="Записаться на вебинар в Telegram">${icon('telegram')}<span class="header-action-full">Записаться на вебинар</span><span class="header-action-short">Запись</span></a></div></header>
<main>
  <div class="hero-atmosphere" aria-hidden="true"></div>
  <article class="article-shell">
    <header class="article-header">
      <nav class="breadcrumbs" aria-label="Путь к статье"><a href="#top">Главная</a><span aria-hidden="true">/</span><span>Полезные статьи</span><span aria-hidden="true">/</span><span aria-current="page">Ноды</span></nav>
      <div class="article-hero">
        <div class="hero-copy">
          <div class="article-meta"><span>Блокчейн</span><span>2 минуты чтения</span></div>
          <h1>Что такое ноды <span>в экосистеме криптовалют</span></h1><p class="intro">${intro}</p>
          <div class="intro-action"><a id="landing-cta" class="button" href="${telegramChat}">${button}</a><span>Бесплатный обучающий вебинар CryptoFork</span></div>
        </div>
        <figure class="cover-figure"><img class="cover" src="${cover}" alt="${coverAlt}" width="1440" height="900" fetchpriority="high"></figure>
      </div>
    </header>
    <div id="guide" class="article-grid">
      <div class="story"><p class="story-lead">Чтобы понять устройство сети, проследим, как узел получает данные и решает, какие из них принять.</p>${article}<p class="article-sources">Источники: <a href="https://www.rbc.ru/crypto/news/68ef649e9a794744186f3bec">РБК.Крипто</a>, <a href="https://bitcoin.org/en/full-node">Bitcoin Core</a> и <a href="https://ethereum.org/developers/docs/nodes-and-clients/">документация Ethereum</a>.</p><a class="back-link" href="#top">К началу статьи</a></div>
      <aside class="reading-card" aria-labelledby="reading-card-title">
        <p class="card-label">Бесплатный вебинар CryptoFork</p>
        <h2 id="reading-card-title">Как работают ноды</h2>
        <ul><li>Типы узлов и их задачи</li><li>Проверка нового блока</li><li>Обмен данными в сети</li></ul>
        <a class="button" href="${telegramChat}">Попасть на вебинар</a>
      </aside>
    </div>
  </article>
  <section id="faq" class="shell end-panel">
    <div><h2>Частые вопросы <span>о нодах</span></h2><p>Коротко о создании блоков и хранении истории.</p></div>
    <div class="questions">
      <details><summary>Каждая ли нода создаёт блоки?</summary><p>Роли определяет протокол. В Bitcoin блоки предлагают майнеры, а полные ноды проверяют их.</p></details>
      <details><summary>Хранит ли каждая нода всю историю?</summary><p>Узел с обрезанным хранением может удалить старые блоки после проверки и сохранить последние блоки.</p></details>
      <details><summary>Нужна ли своя нода для знакомства с темой?</summary><p>Для начала достаточно понять, как узлы получают, проверяют и передают данные.</p></details>
    </div>
  </section>
  <section id="webinar" class="shell webinar-panel" aria-labelledby="webinar-title">
    <div class="webinar-fins" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    <p class="card-label">Бесплатный обучающий вебинар</p>
    <h2 id="webinar-title">Разберитесь, <span>как работают ноды</span></h2>
    <p>На примере одного блока разберём, как узлы получают данные, проверяют их и передают соседям.</p>
    <a class="button" href="${telegramChat}">Записаться на вебинар</a>
  </section>
</main>
<footer class="site-footer"><div class="shell">
  
  <nav aria-label="Документы"><strong>Документы</strong><a href="/landing-privacy.html">Политика конфиденциальности</a><a href="/landing-terms.html">Пользовательское соглашение</a></nav>
  <div class="owner"><p>Анненков Михаил Владимирович<br>ИНН 434501171692</p><a href="mailto:cryptofork@mail.ru">cryptofork@mail.ru</a></div>
<p class="footer-note">Образовательный материал о работе блокчейн-сетей.</p></div></footer>
</body></html>`;
}

module.exports = { render };
