/* =========================================================
   MCBE.loader
   Responsável por:
   - ler addons/index.json
   - carregar o .js de cada addon e capturar window.ADDON_DATA
   - carregar sob demanda o HTML e o JS da página de um addon
   Nenhuma edição manual é necessária ao adicionar um addon:
   basta ele aparecer em addons/index.json (gerado por
   tools/generate-index.js).
   ========================================================= */
window.MCBE = window.MCBE || {};

MCBE.loader = (function () {

  // Resolve caminhos relativos ao index.html, funciona tanto na
  // raiz quanto em subpastas (ex: GitHub Pages /usuario/repo/).
  function basePath() {
    const path = window.location.pathname;
    return path.slice(0, path.lastIndexOf('/') + 1);
  }

  let cache = null; // array de metadados já carregados
  let loadingPromise = null;

  async function fetchIndex() {
    const res = await fetch(basePath() + 'addons/index.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Não foi possível ler addons/index.json (' + res.status + ')');
    const list = await res.json();
    if (!Array.isArray(list)) throw new Error('addons/index.json deve ser uma lista de nomes de pastas');
    return list;
  }

  // Executa o addon.js de forma sequencial (evita concorrência
  // sobrescrevendo window.ADDON_DATA) e devolve os metadados.
  async function loadAddonMeta(id) {
    const jsUrl = basePath() + 'addons/' + id + '/' + id + '.js';
    const res = await fetch(jsUrl, { cache: 'no-cache' });
    if (!res.ok) {
      console.warn('[MCBE] addon "' + id + '" ignorado: não encontrei ' + id + '.js');
      return null;
    }
    const code = await res.text();

    const prevData = window.ADDON_DATA;
    window.ADDON_DATA = undefined;
    try {
      // eslint-disable-next-line no-new-func
      (new Function(code))();
    } catch (err) {
      console.warn('[MCBE] erro ao executar ' + id + '.js:', err);
    }
    const data = window.ADDON_DATA;
    window.ADDON_DATA = prevData;

    if (!data || typeof data !== 'object') {
      console.warn('[MCBE] addon "' + id + '" ignorado: ' + id + '.js não definiu window.ADDON_DATA');
      return null;
    }

    return normalize(id, data);
  }

  function normalize(folderId, data) {
    return {
      id: data.id || folderId,
      folder: folderId,
      title: data.title || folderId,
      description: data.description || '',
      category: data.category || 'addons',
      author: data.author || 'Desconhecido',
      version: data.version || '—',
      minecraft: data.minecraft || [],
      downloads: Number(data.downloads) || 0,
      featured: !!data.featured,
      image: data.image || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      date: data.date || null,
      downloadUrl: data.downloadUrl || null,
      screenshots: Array.isArray(data.screenshots) ? data.screenshots : [],
      installSteps: Array.isArray(data.installSteps) ? data.installSteps : null,
      htmlPath: 'addons/' + folderId + '/' + folderId + '.html',
      jsPath: 'addons/' + folderId + '/' + folderId + '.js'
    };
  }

  async function loadAll() {
    if (cache) return cache;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
      let ids = [];
      try {
        ids = await fetchIndex();
      } catch (err) {
        console.error('[MCBE]', err.message);
        cache = [];
        return cache;
      }
      const results = [];
      for (const id of ids) {
        const meta = await loadAddonMeta(id);
        if (meta) results.push(meta);
      }
      cache = results;
      return cache;
    })();

    return loadingPromise;
  }

  async function getById(id) {
    const all = await loadAll();
    return all.find(a => a.id === id) || null;
  }

  async function fetchAddonHtml(addon) {
    const res = await fetch(basePath() + addon.htmlPath, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Não encontrei ' + addon.htmlPath);
    return res.text();
  }

  // Carrega o JS do addon dentro da página de detalhe (comportamento
  // interativo do addon). Remove o script anterior para não acumular.
  function loadAddonScriptTag(addon) {
    document.querySelectorAll('script[data-mcbe-addon-script]').forEach(s => s.remove());
    const script = document.createElement('script');
    script.src = basePath() + addon.jsPath + '?v=' + Date.now();
    script.dataset.mcbeAddonScript = addon.id;
    document.body.appendChild(script);
  }

  return { loadAll, getById, fetchAddonHtml, loadAddonScriptTag, basePath };
})();
