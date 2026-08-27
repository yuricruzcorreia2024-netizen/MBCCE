/* =========================================================
   MCBE.search — pesquisa por título, autor, categoria,
   descrição e tags entre os addons já carregados.
   ========================================================= */
window.MCBE = window.MCBE || {};

MCBE.search = (function () {

  function normalize(str) {
    return (str || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // remove acentos
  }

  function matches(addon, query) {
    const q = normalize(query).trim();
    if (!q) return true;
    const haystack = normalize([
      addon.title,
      addon.author,
      addon.category,
      addon.description,
      (addon.tags || []).join(' ')
    ].join(' '));
    return q.split(/\s+/).every(term => haystack.includes(term));
  }

  function run(list, query) {
    if (!query) return list;
    return list.filter(a => matches(a, query));
  }

  return { run, matches };
})();
