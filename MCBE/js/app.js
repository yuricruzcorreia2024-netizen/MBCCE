/* =========================================================
   MCBE.app — roteador (hash routing, compatível com GitHub
   Pages) e interações globais do cabeçalho.
   ========================================================= */
window.MCBE = window.MCBE || {};

(function () {
  const root = document.getElementById('view-root');

  function parseRoute() {
    const raw = window.location.hash.replace(/^#/, '') || '/';
    const [pathPart, queryPart] = raw.split('?');
    const parts = pathPart.split('/').filter(Boolean);
    const query = {};
    if (queryPart) {
      queryPart.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }
    return { parts, query };
  }

  async function render() {
    const { parts, query } = parseRoute();
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

    if (parts.length === 0) {
      document.title = 'MCBE — Addons, texturas e mapas para Minecraft Bedrock';
      return MCBE.views.renderHome(root);
    }

    if (parts[0] === 'catalogo') {
      const categoria = parts[1] || 'todos';
      document.title = 'Catálogo — MCBE';
      return MCBE.views.renderCatalog(root, categoria, query.q, query.sort);
    }

    if (parts[0] === 'addon' && parts[1]) {
      return MCBE.views.renderAddonPage(root, decodeURIComponent(parts[1]));
    }

    if (parts[0] === 'favoritos') {
      document.title = 'Favoritos — MCBE';
      return MCBE.views.renderFavorites(root);
    }

    if (parts[0] === 'categorias') {
      document.title = 'Categorias — MCBE';
      return MCBE.views.renderCategorias(root);
    }

    if (parts[0] === 'sobre') {
      document.title = 'Sobre — MCBE';
      return MCBE.views.renderSobre(root);
    }

    root.innerHTML = `<div class="empty-state" style="padding:80px 20px;">
      <h3>Página não encontrada</h3>
      <p><a href="#/" style="color:var(--grass-dark);font-weight:700;">Voltar ao início</a></p>
    </div>`;
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', () => {
    render();

    // Menu responsivo
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', e => {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Busca do cabeçalho, disponível em qualquer página
    document.getElementById('headerSearchForm').addEventListener('submit', e => {
      e.preventDefault();
      const q = document.getElementById('headerSearchInput').value.trim();
      window.location.hash = '#/catalogo/todos' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  });
})();
