# MCBE

Catálogo de addons, texturas e mapas para Minecraft Bedrock. Feito **exclusivamente** com HTML, CSS e JavaScript puro (sem frameworks, sem backend, sem banco de dados) — pronto para o GitHub Pages.

## ✨ Ideia principal

Para adicionar um addon novo ao site, **não é preciso editar nenhum arquivo do sistema principal** (`index.html`, `app.js`, `loader.js`, `home.js`, `search.js`, `filters.js`). Basta:

1. Criar uma pasta dentro de `addons/`
2. Colocar dentro dela um `.html` e um `.js` **com o mesmo nome da pasta**
3. Atualizar `addons/index.json` (manual ou com o gerador)
4. Fazer commit/push

O site reconhece o addon automaticamente.

## 📁 Estrutura do projeto

```text
MCBE/
├── index.html
├── css/
│   ├── style.css        → design system (cores, tipografia, componentes)
│   ├── addon.css        → estilos da página individual do addon
│   └── responsive.css   → ajustes de tela (mobile-first)
├── js/
│   ├── loader.js         → lê addons/index.json e carrega os metadados
│   ├── filters.js        → categorias, ordenação, "surpreenda-me"
│   ├── search.js         → busca por título/autor/categoria/descrição/tags
│   ├── home.js            → renderização de todas as telas (home, catálogo, addon, favoritos…)
│   └── app.js             → roteador (hash routing) e interações do cabeçalho
├── addons/
│   ├── index.json         → lista das pastas de addons disponíveis
│   ├── veinminer/
│   │   ├── veinminer.html
│   │   └── veinminer.js
│   └── example/
│       ├── example.html
│       └── example.js
├── assets/
│   ├── images/, icons/, logo/
├── tools/
│   └── generate-index.js  → gera addons/index.json automaticamente
└── README.md
```

## ▶️ Como rodar localmente

Como o site usa `fetch()` para ler `addons/index.json` e os arquivos dos addons, ele **precisa** ser servido por um servidor local (abrir o `index.html` direto com duplo clique não funciona, por causa das regras de segurança do navegador para `file://`).

Qualquer servidor estático simples resolve. Exemplos:

```bash
# Opção 1 — Python (já vem instalado na maioria dos sistemas)
cd MCBE
python3 -m http.server 8080
# depois acesse http://localhost:8080

# Opção 2 — Node
npx serve MCBE
```

## ➕ Como adicionar um novo addon (passo a passo)

Exemplo: criando um addon chamado `lucky-block`.

**1. Crie a pasta:**

```text
addons/lucky-block/
```

**2. Crie o HTML da página do addon** (`addons/lucky-block/lucky-block.html`):

```html
<div class="addon-page">
  <section class="addon-content">
    <h2>Sobre este addon</h2>
    <p>Descrição livre em HTML. Este bloco é injetado dentro da página de detalhe.</p>
  </section>
</div>
```

> Você pode usar qualquer HTML aqui — parágrafos, listas, imagens, tabelas. Ele entra dentro do layout do MCBE automaticamente.

**3. Crie o JS do addon** (`addons/lucky-block/lucky-block.js`) — ele **precisa** definir `window.ADDON_DATA`:

```javascript
window.ADDON_DATA = {
  id: "lucky-block",           // deve bater com o nome da pasta
  title: "Lucky Block",
  description: "Blocos de sorte com recompensas aleatórias.",
  category: "addons",          // addons | texturas | mapas | skins | shaders | resource-packs
  author: "SeuNome",
  version: "1.0.0",
  minecraft: ["1.21"],
  downloads: 0,
  featured: false,
  image: "assets/images/lucky-block-thumb.png", // opcional — sem imagem, um ícone é gerado automaticamente
  tags: ["sorte", "diversão"],
  date: "2026-08-26",          // AAAA-MM-DD, usado na ordenação "Mais recentes"
  downloadUrl: "https://link-para-o-arquivo.mcaddon",
  screenshots: []              // opcional — array de URLs de imagens
};

// A partir daqui, qualquer JavaScript interativo específico deste
// addon. Só é carregado quando alguém abre a página do addon —
// nunca na home nem no catálogo.
```

**4. Atualize o índice.** Duas formas:

- **Automática (recomendada):**
  ```bash
  node tools/generate-index.js
  ```
  O script varre `addons/`, encontra toda pasta com `nome.html` + `nome.js` e reescreve `addons/index.json`.

- **Manual:** edite `addons/index.json` e adicione o nome da pasta na lista:
  ```json
  [
    "veinminer",
    "example",
    "lucky-block"
  ]
  ```

**5. Commit e push.** Pronto — o addon aparece no catálogo, na busca, nos filtros e pode virar destaque/mais baixado, sem tocar em mais nenhum arquivo.

### Regra de nomenclatura

O nome da pasta e dos dois arquivos dentro dela **precisa ser idêntico**:

```text
✅ addons/lucky-block/lucky-block.html + lucky-block.js
❌ addons/lucky-block/addon.html + script.js
```

## 🗂️ Campos de `ADDON_DATA`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | string | recomendado | identificador único; se omitido, usa o nome da pasta |
| `title` | string | sim | nome exibido |
| `description` | string | sim | resumo curto (aparece no card) |
| `category` | string | sim | `addons`, `texturas`, `mapas`, `skins`, `shaders` ou `resource-packs` |
| `author` | string | sim | criador do conteúdo |
| `version` | string | sim | versão exibida como `v1.0.0` |
| `minecraft` | string[] | não | versões compatíveis do jogo |
| `downloads` | number | não | contador exibido — definido manualmente, sem backend |
| `featured` | boolean | não | `true` para aparecer em "Destaques" |
| `image` | string \| null | não | caminho relativo da thumbnail; sem imagem, gera um ícone automático |
| `tags` | string[] | não | usadas na busca e exibidas como badges |
| `date` | string | não | `AAAA-MM-DD`, usado em "Mais recentes" |
| `downloadUrl` | string | não | link externo do botão "Baixar addon" |
| `screenshots` | string[] | não | imagens extras exibidas na página do addon |

## 🌐 Publicando no GitHub Pages

1. Suba a pasta `MCBE/` (com todo o conteúdo) para um repositório no GitHub.
2. No repositório, vá em **Settings → Pages**.
3. Em **Source**, selecione a branch (ex.: `main`) e a pasta (`/root` ou `/docs`, dependendo de onde você colocou os arquivos).
4. Salve. O GitHub gera uma URL como `https://usuario.github.io/repositorio/`.

O site já foi construído para funcionar em qualquer subpasta (não assume que está na raiz `/`), então funciona normalmente nesse formato de URL.

## 🔍 Funcionalidades incluídas

- Catálogo dinâmico (destaques, mais baixados, recentes) montado a partir de `addons/index.json`
- Busca por título, autor, categoria, descrição e tags
- Filtros por categoria e ordenação (recentes, mais baixados, populares, destaques, aleatório)
- Botão "Surpreenda-me" (sorteia um addon)
- Favoritos salvos em `localStorage`
- Roteamento por hash (`#/`, `#/catalogo/:categoria`, `#/addon/:id`, `#/favoritos`, `#/categorias`, `#/sobre`) — compatível com GitHub Pages, sem depender de configuração de servidor
- JS de cada addon carregado somente quando a página do addon é aberta (nada de carregar tudo na home)
- Layout responsivo, mobile-first

## 🚫 Sem backend

Não há Node, PHP, MySQL, MongoDB, Supabase ou Firebase nas funcionalidades básicas — tudo roda no navegador. O contador de `downloads` é apenas um número definido manualmente no `ADDON_DATA` de cada addon; se um dia for necessário um contador real, a arquitetura já está isolada (`loader.js`) para plugar uma API externa sem mexer no resto do site.
