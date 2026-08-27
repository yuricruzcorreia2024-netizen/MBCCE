/* =========================================================
   MCBE.ui / MCBE.favorites / MCBE.views
   Renderização das telas do site, tudo em JS puro.
   ========================================================= */
window.MCBE = window.MCBE || {};

/* ---------- Favoritos (localStorage) ---------- */
MCBE.favorites = (function () {
  const KEY = 'mcbe:favorites';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function isFav(id) { return getAll().includes(id); }
  function toggle(id) {
    const list = getAll();
    const idx = list.indexOf(id);
    if (idx >= 0) { list.splice(idx, 1); } else { list.push(id); }
    localStorage.setItem(KEY, JSON.stringify(list));
    return list.includes(id);
  }
  return { getAll, isFav, toggle };
})();

/* ---------- UI helpers ---------- */
MCBE.ui = (function () {

  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function fmtDownloads(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
    return String(n);
  }

  function categoryLabel(id) {
    const found = MCBE.filters.CATEGORIES.find(c => c.id === id);
    return found ? found.label : id;
  }

  function placeholderImage(addon) {
    // SVG inline leve, sem depender de imagens externas quando o addon não fornece uma.
    const letter = (addon.title || '?').trim().charAt(0).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
      <rect width="400" height="250" fill="#E2DEC8"/>
      <rect x="150" y="75" width="100" height="100" fill="#4C8B3C"/>
      <text x="200" y="140" font-family="sans-serif" font-size="54" fill="#FBFAF2" text-anchor="middle" font-weight="bold">${letter}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function cardNode(addon) {
    const tpl = document.getElementById('tpl-card');
    const node = tpl.content.cloneNode(true);
    const article = node.querySelector('.addon-card');
    const thumbLink = node.querySelector('.card-thumb');
    const img = node.querySelector('.card-thumb img');
    const cat = node.querySelector('.card-category');
    const titleLink = node.querySelector('.card-top h3 a');
    const favBtn = node.querySelector('.fav-btn');
    const desc = node.querySelector('.card-desc');
    const author = node.querySelector('.card-author');
    const version = node.querySelector('.card-version');
    const downloads = node.querySelector('.card-downloads');
    const cta = node.querySelector('.card-cta');

    const href = '#/addon/' + encodeURIComponent(addon.id);
    thumbLink.href = href;
    titleLink.href = href;
    cta.href = href;

    img.src = addon.image ? MCBE.loader.basePath() + addon.image : placeholderImage(addon);
    img.alt = addon.title;
    cat.textContent = categoryLabel(addon.category);
    titleLink.textContent = addon.title;
    desc.textContent = addon.description;
    author.textContent = '@' + addon.author;
    version.textContent = 'v' + addon.version;
    downloads.textContent = fmtDownloads(addon.downloads) + ' downloads';

    favBtn.classList.toggle('active', MCBE.favorites.isFav(addon.id));
    favBtn.addEventListener('click', () => {
      const nowFav = MCBE.favorites.toggle(addon.id);
      favBtn.classList.toggle('active', nowFav);
      toast(nowFav ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
    });

    article.dataset.id = addon.id;
    return node;
  }

  function renderGrid(container, list, emptyMsg) {
    container.innerHTML = '';
    if (!list.length) {
      container.innerHTML = `<div class="empty-state">
        <h3>Nada por aqui ainda</h3>
        <p>${emptyMsg || 'Nenhum addon encontrado com esses filtros.'}</p>
      </div>`;
      return;
    }
    const frag = document.createDocumentFragment();
    list.forEach(addon => frag.appendChild(cardNode(addon)));
    container.appendChild(frag);
  }

  function renderSkeleton(container, count) {
    container.innerHTML = Array.from({ length: count }).map(() => `
      <div class="skeleton-card">
        <div class="sk-thumb"></div>
        <div class="sk-line"></div>
        <div class="sk-line short"></div>
      </div>
    `).join('');
  }

  function blockDivider(cells) {
    return `<div class="block-divider">${'<span></span>'.repeat(cells || 24)}</div>`;
  }

  return { toast, fmtDownloads, categoryLabel, placeholderImage, cardNode, renderGrid, renderSkeleton, blockDivider };
})();

/* ---------- Views ---------- */
MCBE.views = (function () {

  function setActiveNav(name) {
    document.querySelectorAll('.main-nav a').forEach(a => {
      a.classList.toggle('active', a.dataset.nav === name);
    });
  }

  async function renderHome(root) {
    setActiveNav('home');
    root.innerHTML = `
      <section class="hero">
        <div class="hero-inner">
          <span class="hero-eyebrow">Catálogo da comunidade</span>
          <h1>Addons de <span class="accent">Minecraft Bedrock</span></h1>
          <p class="lead">Encontre addons, mapas, texturas e conteúdos para Minecraft Bedrock, feitos e organizados pela comunidade.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#/catalogo/addons">Ver addons</a>
            <button class="btn btn-ghost" id="btnSurpriseHero" type="button">🎲 Surpreenda-me</button>
          </div>
          <form class="hero-search" id="heroSearchForm" role="search">
            <input type="search" id="heroSearchInput" placeholder="Pesquisar por nome, autor, categoria…" aria-label="Pesquisar addons">
            <button type="submit">Pesquisar</button>
          </form>
        </div>
      </section>
      ${MCBE.ui.blockDivider()}

      <section class="section">
        <div class="section-head">
          <div><span class="eyebrow">Selecionados</span><h2>Destaques</h2></div>
          <a class="see-all" href="#/catalogo/todos?sort=destaques">Ver todos →</a>
        </div>
        <div class="grid" id="gridFeatured"></div>
      </section>

      <section class="section alt">
        <div class="section-head">
          <div><span class="eyebrow">Ranking</span><h2>Mais baixados</h2></div>
          <a class="see-all" href="#/catalogo/todos?sort=baixados">Ver todos →</a>
        </div>
        <div class="grid" id="gridTop"></div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><span class="eyebrow">Novidades</span><h2>Adicionados recentemente</h2></div>
          <a class="see-all" href="#/catalogo/todos?sort=recentes">Ver todos →</a>
        </div>
        <div class="grid" id="gridRecent"></div>
      </section>
    `;

    ['gridFeatured', 'gridTop', 'gridRecent'].forEach(id =>
      MCBE.ui.renderSkeleton(document.getElementById(id), 4)
    );

    const form = document.getElementById('heroSearchForm');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const q = document.getElementById('heroSearchInput').value.trim();
      window.location.hash = '#/catalogo/todos' + (q ? '?q=' + encodeURIComponent(q) : '');
    });

    document.getElementById('btnSurpriseHero').addEventListener('click', async () => {
      const all = await MCBE.loader.loadAll();
      const pick = MCBE.filters.surpriseMe(all);
      if (pick) window.location.hash = '#/addon/' + encodeURIComponent(pick.id);
    });

    const all = await MCBE.loader.loadAll();
    const featured = MCBE.filters.sort(all.filter(a => a.featured), 'recentes').slice(0, 8);
    const top = MCBE.filters.sort(all, 'baixados').slice(0, 8);
    const recent = MCBE.filters.sort(all, 'recentes').slice(0, 8);

    MCBE.ui.renderGrid(document.getElementById('gridFeatured'), featured, 'Nenhum addon em destaque ainda — marque featured: true no ADDON_DATA.');
    MCBE.ui.renderGrid(document.getElementById('gridTop'), top, 'Ainda não há addons cadastrados.');
    MCBE.ui.renderGrid(document.getElementById('gridRecent'), recent, 'Ainda não há addons cadastrados.');
  }

  async function renderCatalog(root, categoryParam, initialQuery, initialSort) {
    setActiveNav(categoryParam === 'todos' ? 'addons' : categoryParam);
    root.innerHTML = `
      <section class="section" style="padding-top:32px;">
        <div class="section-head">
          <div><span class="eyebrow">Catálogo</span><h2 id="catalogTitle">Todos os conteúdos</h2></div>
        </div>
        <div class="toolbar">
          <div class="chip-group" id="categoryChips"></div>
          <button class="surprise-btn" id="btnSurprise" type="button">🎲 Surpreenda-me</button>
          <select class="select-sort" id="sortSelect"></select>
        </div>
        <div class="grid" id="catalogGrid"></div>
      </section>
    `;

    const chipsWrap = document.getElementById('categoryChips');
    MCBE.filters.CATEGORIES.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'chip' + (c.id === categoryParam ? ' active' : '');
      btn.textContent = c.label;
      btn.dataset.cat = c.id;
      chipsWrap.appendChild(btn);
    });

    const sortSelect = document.getElementById('sortSelect');
    MCBE.filters.SORTS.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id; opt.textContent = s.label;
      sortSelect.appendChild(opt);
    });
    sortSelect.value = initialSort || 'recentes';

    MCBE.ui.renderSkeleton(document.getElementById('catalogGrid'), 8);
    const all = await MCBE.loader.loadAll();

    let state = { category: categoryParam, sort: sortSelect.value, query: initialQuery || '' };

    function apply() {
      let list = MCBE.filters.byCategory(all, state.category);
      list = MCBE.search.run(list, state.query);
      list = MCBE.filters.sort(list, state.sort);
      const catLabel = MCBE.filters.CATEGORIES.find(c => c.id === state.category)?.label || 'Todos';
      document.getElementById('catalogTitle').textContent =
        state.query ? `Resultados para "${state.query}"` : catLabel;
      MCBE.ui.renderGrid(document.getElementById('catalogGrid'), list);
    }

    chipsWrap.addEventListener('click', e => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      chipsWrap.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      state.category = btn.dataset.cat;
      apply();
    });

    sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; apply(); });

    document.getElementById('btnSurprise').addEventListener('click', () => {
      let list = MCBE.filters.byCategory(all, state.category);
      list = MCBE.search.run(list, state.query);
      const pick = MCBE.filters.surpriseMe(list);
      if (pick) window.location.hash = '#/addon/' + encodeURIComponent(pick.id);
    });

    // liga a busca do header a esta tela também
    const headerInput = document.getElementById('headerSearchInput');
    if (headerInput && state.query) headerInput.value = state.query;

    apply();

    return {
      setQuery(q) { state.query = q; apply(); }
    };
  }

  async function renderAddonPage(root, id) {
    root.innerHTML = `<div class="addon-page"><p style="padding:60px 0;text-align:center;color:var(--ink-faint);">Carregando addon…</p></div>`;

    const addon = await MCBE.loader.getById(id);
    if (!addon) {
      root.innerHTML = `<div class="addon-page"><div class="empty-state">
        <h3>Addon não encontrado</h3>
        <p>O addon "${id}" não existe ou foi removido do índice.</p>
        <p style="margin-top:16px;"><a class="btn btn-primary" href="#/catalogo/todos">Voltar ao catálogo</a></p>
      </div></div>`;
      return;
    }
    setActiveNav(addon.category);
    document.title = addon.title + ' — MCBE';

    let innerHtml = '';
    try { innerHtml = await MCBE.loader.fetchAddonHtml(addon); }
    catch (err) {
      innerHtml = `<section class="addon-content"><p>Não foi possível carregar o conteúdo deste addon.</p></section>`;
    }

    const isFav = MCBE.favorites.isFav(addon.id);
    const img = addon.image ? MCBE.loader.basePath() + addon.image : MCBE.ui.placeholderImage(addon);

    root.innerHTML = `
      <div class="addon-page">
        <nav class="breadcrumb">
          <a href="#/">Início</a> / <a href="#/catalogo/${addon.category}">${MCBE.ui.categoryLabel(addon.category)}</a> / <span>${addon.title}</span>
        </nav>

        <div class="addon-hero">
          <div class="addon-hero-media"><img src="${img}" alt="${addon.title}"></div>
          <div class="addon-hero-info">
            <span class="addon-category">${MCBE.ui.categoryLabel(addon.category)}</span>
            <h1>${addon.title}</h1>
            <p class="addon-desc">${addon.description}</p>
            <div class="addon-stats">
              <div class="stat"><b>${MCBE.ui.fmtDownloads(addon.downloads)}</b><span>downloads</span></div>
              <div class="stat"><b>v${addon.version}</b><span>versão</span></div>
              <div class="stat"><b>${addon.minecraft.join(', ') || '—'}</b><span>compatibilidade</span></div>
              <div class="stat"><b>@${addon.author}</b><span>autor</span></div>
            </div>
            <div class="addon-actions">
              ${addon.downloadUrl
                ? `<a class="btn btn-primary" href="${addon.downloadUrl}" target="_blank" rel="noopener">Baixar addon</a>`
                : `<button class="btn btn-ghost" type="button" disabled>Link de download indisponível</button>`}
              <button class="btn btn-ghost" id="favToggle" type="button">${isFav ? '♥ Favoritado' : '♡ Favoritar'}</button>
            </div>
            <div class="addon-tags">${addon.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
          </div>
        </div>

        <div class="addon-body">
          <div id="addonContentSlot">${innerHtml}</div>
          <aside class="addon-sidebar">
            <h3 style="margin-bottom:6px;">Detalhes</h3>
            <div class="row"><span>Categoria</span><span>${MCBE.ui.categoryLabel(addon.category)}</span></div>
            <div class="row"><span>Autor</span><span>@${addon.author}</span></div>
            <div class="row"><span>Versão</span><span>${addon.version}</span></div>
            <div class="row"><span>Minecraft</span><span>${addon.minecraft.join(', ') || '—'}</span></div>
            <div class="row"><span>Downloads</span><span>${MCBE.ui.fmtDownloads(addon.downloads)}</span></div>
            <div class="row"><span>Publicado</span><span>${addon.date || '—'}</span></div>
          </aside>
        </div>

        ${addon.screenshots.length ? `
        <section class="section" style="padding-left:0;padding-right:0;">
          <div class="section-head"><h2>Screenshots</h2></div>
          <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr));">
            ${addon.screenshots.map(src => `<img loading="lazy" src="${src}" alt="Screenshot de ${addon.title}" style="border-radius:var(--radius-md);border:1px solid var(--border);">`).join('')}
          </div>
        </section>` : ''}

        <section class="related-strip" id="relatedStrip">
          <div class="section-head"><h2>Você também pode gostar</h2></div>
          <div class="grid" id="relatedGrid"></div>
        </section>
      </div>
    `;

    document.getElementById('favToggle').addEventListener('click', (e) => {
      const nowFav = MCBE.favorites.toggle(addon.id);
      e.target.textContent = nowFav ? '♥ Favoritado' : '♡ Favoritar';
      MCBE.ui.toast(nowFav ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
    });

    // Carrega o JS específico do addon (comportamento interativo da página).
    MCBE.loader.loadAddonScriptTag(addon);

    // Relacionados: mesma categoria, excluindo o atual.
    const all = await MCBE.loader.loadAll();
    const related = all.filter(a => a.id !== addon.id && a.category === addon.category).slice(0, 4);
    MCBE.ui.renderGrid(document.getElementById('relatedGrid'), related, 'Sem outros conteúdos nesta categoria por enquanto.');
  }

  async function renderFavorites(root) {
    setActiveNav('');
    root.innerHTML = `
      <section class="section" style="padding-top:32px;">
        <div class="section-head"><div><span class="eyebrow">Sua lista</span><h2>Favoritos</h2></div></div>
        <div class="grid" id="favGrid"></div>
      </section>`;
    MCBE.ui.renderSkeleton(document.getElementById('favGrid'), 4);
    const all = await MCBE.loader.loadAll();
    const favIds = MCBE.favorites.getAll();
    const list = all.filter(a => favIds.includes(a.id));
    MCBE.ui.renderGrid(document.getElementById('favGrid'), list, 'Você ainda não favoritou nenhum addon. Clique no ♡ em qualquer card para salvar aqui.');
  }

  function renderCategorias(root) {
    setActiveNav('categorias');
    root.innerHTML = `
      <section class="section" style="padding-top:32px;">
        <div class="section-head"><div><span class="eyebrow">Explorar</span><h2>Categorias</h2></div></div>
        <div class="grid">
          ${MCBE.filters.CATEGORIES.filter(c => c.id !== 'todos').map(c => `
            <a class="addon-card" href="#/catalogo/${c.id}" style="padding:26px;display:flex;align-items:center;justify-content:center;text-align:center;">
              <h3 style="font-size:1.3rem;">${c.label}</h3>
            </a>
          `).join('')}
        </div>
      </section>`;
  }

  function renderSobre(root) {
    setActiveNav('sobre');
    root.innerHTML = `
      <section class="section" style="padding-top:32px;max-width:760px;margin:0 auto;">
        <div class="section-head"><div><span class="eyebrow">O projeto</span><h2>Sobre o MCBE</h2></div></div>
        <p style="color:var(--ink-soft);margin-bottom:14px;">O MCBE é um catálogo aberto de addons, texturas e mapas para Minecraft Bedrock, construído com HTML, CSS e JavaScript puro — sem backend, sem banco de dados.</p>
        <p style="color:var(--ink-soft);margin-bottom:14px;">Cada conteúdo do catálogo é independente: basta criar uma pasta em <code>addons/</code> com um arquivo HTML e um JS de mesmo nome para que ele apareça automaticamente no site.</p>
        <p style="color:var(--ink-soft);">MCBE não é afiliado à Mojang Studios ou à Microsoft.</p>
      </section>`;
  }

  return { renderHome, renderCatalog, renderAddonPage, renderFavorites, renderCategorias, renderSobre };
})();
