# Frontend: Painel da Biblioteca

Aplicação React que consome a API do backend e oferece o painel administrativo. Veja o [README da raiz](../README.md) para a visão geral do sistema.

## Stack

| Tecnologia | Uso |
|---|---|
| React 19 | Interface baseada em componentes e hooks |
| Vite | Servidor de desenvolvimento e build |
| React Router 7 | Navegação entre telas |
| Axios | Cliente HTTP |
| lucide-react | Ícones |
| CSS puro | Um arquivo por tela/componente, com variáveis globais |
| Oxlint | Lint (`npm run lint`) |

## Estrutura

```
frontend/src/
├── main.jsx                  Ponto de entrada (importa o CSS global e monta <App />)
├── App.jsx                   Definição das rotas
├── layouts/
│   └── DashboardLayout.jsx   Moldura do painel: sidebar + cabeçalho + <Outlet />
├── pages/                    Uma página por rota (estado e orquestração)
├── components/
│   ├── Sidebar.jsx           Menu lateral
│   ├── dashboard/            StatCard e blocos do dashboard
│   ├── livros/               Filtros, Tabela, Formulario, Detalhes
│   ├── autores/              Tabela, Formulario
│   ├── categoria/            Tabela, Formulario
│   ├── emprestimo/           Tabela, Formulario, Detalhes
│   └── usuario/              Tabela, Formulario, Detalhes
├── services/                 Chamadas à API, um arquivo por recurso
│   ├── api.js                Instância do Axios (baseURL + token)
│   └── livros.service.js, autores.service.js, categorias.service.js,
│       emprestimo.service.js, usuarios.service.js, dashboard.service.js
└── styles/                   variables.css, index.css e um CSS por tela/componente
```

## Arquitetura em camadas

```
Página (pages/)             Guarda o estado (lista, filtros, carregando, erro, modais)
   │                        Decide quando buscar dados e o que renderizar
   ├── Componentes          Recebem dados e callbacks por props e só desenham
   │   (components/)        (Tabela, Formulario, Detalhes, Filtros, StatCard)
   ▼
Serviço (services/)         Funções simples: listarLivros(), cadastrarEmprestimo()...
   ▼
api.js (Axios)              baseURL = VITE_API_URL + "/api"; injeta o JWT do localStorage
   ▼
Backend
```

Regra prática: **a página sabe o que fazer, o componente sabe como mostrar e o serviço sabe onde pedir**. Os componentes de tela não chamam o Axios diretamente; só os serviços falam com a API. (Alguns formulários buscam listas de apoio, como autores e categorias, mas sempre pelos serviços.)

## Roteamento

Todas as rotas ficam dentro do `DashboardLayout`, que renderiza a sidebar, o cabeçalho (título e descrição conforme a rota) e, no meio, a página atual:

| Rota | Página | O que faz |
|---|---|---|
| `/` | | Redireciona para `/dashboard` |
| `/dashboard` | `Dashboard` | Indicadores, empréstimos recentes e livros mais emprestados |
| `/livros` | `Catalogo` | Gestão do acervo |
| `/autores` | `Autores` | Gestão de autores |
| `/categorias` | `Categorias` | Gestão de categorias |
| `/emprestimos` | `Emprestimo` | Empréstimos e devoluções |
| `/usuarios` | `Usuarios` | Gestão de leitores |

No mobile, a sidebar vira um menu que abre e fecha por um botão no cabeçalho.

## Padrão de uma tela de CRUD

As telas de Livros, Autores, Categorias, Usuários e Empréstimos seguem o mesmo roteiro:

1. **Estado local** com `useState`: a lista, os campos de busca/filtro, `carregando`, `erro` e os controles dos modais (formulário aberto, item selecionado, detalhes abertos).
2. **Carga de dados** em um `useEffect`. Um contador `recarregar` está nas dependências: depois de salvar ou excluir, a página faz `setRecarregar(n => n + 1)` e a lista é buscada de novo, sem precisar atualizar o estado manualmente.
3. **Filtros no cliente** com `useMemo`: a API devolve a lista completa e a página filtra por texto e por situação sem nova requisição.
4. **Formulário em modal** reutilizado para criar e editar. Quando recebe um item, entra em modo de edição e preenche os campos.
5. **Três estados de tela** tratados explicitamente: carregando, erro (mostra a mensagem do campo `erro` da API) e vazio.

## Lógica por tela

- **Dashboard:** uma única requisição (`GET /dashboard`) alimenta os cartões de estatística (`StatCard`), a lista de empréstimos recentes e o ranking de livros populares.
- **Livros:** busca por título ou ISBN e filtro de disponibilidade (todos, disponíveis, emprestados), mais indicadores no topo. O formulário carrega autores e categorias da API e permite marcar vários de cada. Ao salvar, envia `autorIds` e `categoriaIds`.
- **Empréstimos:**
  - O formulário lista os leitores e **somente os livros disponíveis**.
  - A data escolhida é enviada às 12h (`T12:00:00`) em formato ISO, para que a data de hoje ou de amanhã não vire "passado" por causa de fuso horário.
  - A tela calcula localmente se um empréstimo está atrasado (`ATIVO` com data prevista anterior a agora) para o filtro "Em atraso" e os indicadores. O backend aplica a mesma regra no dashboard.
  - O botão de devolução chama `PATCH /emprestimos/:id/devolucao` e recarrega a lista.
- **Usuários:** gerencia leitores (nome e e-mail). Exibe a quantidade de empréstimos e, nos detalhes, o histórico completo. Se o leitor tiver empréstimos, a exclusão é recusada pela API e a mensagem aparece na tela.

## Camada HTTP

`src/services/api.js` cria a instância do Axios:

- `baseURL`: `${VITE_API_URL}/api`, então os serviços usam caminhos curtos como `/livros`.
- `timeout`: 10 segundos.
- Interceptor de requisição: se existir `token` no `localStorage`, adiciona `Authorization: Bearer <token>`.

Cada serviço expõe funções `async` que retornam `resposta.data`. Os erros sobem para a página, que lê `error.response?.data?.erro`.

## Estilos

- `styles/variables.css` guarda as variáveis globais (cores, espaçamentos, etc.) e `styles/index.css` os estilos base.
- Cada tela ou componente grande importa o próprio CSS, com classes no padrão BEM (`bloco__elemento--modificador`), por exemplo `sidebar__link--ativo`.

## Configuração e execução

Crie `frontend/.env`:

```env
VITE_API_URL="http://localhost:3000"
```

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera a pasta dist/
npm run lint     # Oxlint
```

O backend precisa estar rodando e o `FRONTEND_URL` dele deve apontar para a origem do Vite, senão o navegador bloqueia as chamadas por CORS.

## Estado atual e próximos passos

**A autenticação ainda não está ligada no frontend.** O `api.js` já envia o token se ele existir no `localStorage`, mas ainda não há tela que o grave. Enquanto isso, as rotas protegidas da API respondem 401. Falta:

1. Implementar `pages/Login.jsx` (`POST /auth/login`, gravar `token` e `usuario` no `localStorage`).
2. Criar um contexto de autenticação e uma rota protegida que redirecione para `/login`.
3. Ligar o botão "Sair" da sidebar (limpar `localStorage` e redirecionar) e mostrar o nome real do administrador, que hoje aparece fixo como "Administrador".
4. Adicionar no `api.js` um interceptor de resposta que, em caso de 401 (token expirado, validade padrão de 1h), limpe a sessão e leve ao login.

Outros pontos:
- Os arquivos `LivroDetalhes.jsx` e `MeusEmprestimos.jsx` (páginas), `AutorDetalhes.jsx`, `LivroCard.jsx`, `EmprestimosRecentes.jsx` e `LivrosPopulares.jsx` estão vazios, reservados para evolução.
- Existe um `frontend/services/api.js` fora de `src/` que é uma versão antiga e não é usada; pode ser removido. O arquivo em uso é `src/services/api.js`.
- O botão de pesquisa e o sino de notificações do cabeçalho são apenas visuais.
