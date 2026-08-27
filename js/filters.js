/* =========================================================
   MCBE.filters — categoria, ordenação e sorteio
   ========================================================= */
window.MCBE = window.MCBE || {};

MCBE.filters = (function () {

  const CATEGORIES = [
    { id: 'todos', label: 'Todos' },
    { id: 'addons', label: 'Addons' },
    { id: 'texturas', label: 'Texturas' },
    { id: 'mapas', label: 'Mapas' },
    { id: 'skins', label: 'Skins' },
    { id: 'shaders', label: 'Shaders' },
    { id: 'resource-packs', label: 'Resource Packs' }
  ];

  const SORTS = [
    { id: 'recentes', label: 'Mais recentes' },
    { id: 'baixados', label: 'Mais baixados' },
    { id: 'populares', label: 'Populares' },
    { id: 'destaques', label: 'Destaques' },
    { id: 'aleatorio', label: 'Aleatório' }
  ];

  function byCategory(list, categoryId) {
    if (!categoryId || categoryId === 'todos') return list;
    return list.filter(a => a.category === categoryId);
  }

  function sort(list, sortId) {
    const arr = list.slice();
    switch (sortId) {
      case 'baixados':
        return arr.sort((a, b) => b.downloads - a.downloads);
      case 'populares':
        // popularidade = mistura de downloads e destaque
        return arr.sort((a, b) => (b.downloads + (b.featured ? 5000 : 0)) - (a.downloads + (a.featured ? 5000 : 0)));
      case 'destaques':
        return arr.sort((a, b) => (b.featured === a.featured) ? 0 : (b.featured ? 1 : -1));
      case 'aleatorio':
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      case 'recentes':
      default:
        return arr.sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        });
    }
  }

  function surpriseMe(list) {
    if (!list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  return { CATEGORIES, SORTS, byCategory, sort, surpriseMe };
})();
