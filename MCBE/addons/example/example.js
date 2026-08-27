/* Metadados lidos pelo loader.js para montar o card e a página deste addon. */
window.ADDON_DATA = {
  id: "example",
  title: "Example Addon",
  description: "Addon de demonstração do sistema MCBE — use como modelo para criar os seus.",
  category: "addons",
  author: "MCBE",
  version: "1.0.0",
  minecraft: ["1.21"],
  downloads: 0,
  featured: false,
  image: null,
  tags: ["example", "modelo"],
  date: "2026-08-26",
  downloadUrl: "https://example.com/example-addon.mcaddon",
  screenshots: []
};

/*
  A partir daqui, este código só é executado quando o usuário abre
  a PÁGINA do addon (não na home nem no catálogo). Use este espaço
  para qualquer comportamento interativo específico deste addon,
  como um seletor de versão, uma calculadora, uma prévia, etc.
  O loader injeta este script depois de montar o HTML de example.html,
  então já é seguro usar document.querySelector aqui.
*/
(function () {
  console.log('[MCBE] JS interativo do addon "example" carregado.');
})();
