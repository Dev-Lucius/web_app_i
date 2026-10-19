# Super Guia Definitivo de Git — do Modelo Mental aos Fluxos de Equipe

> Guia técnico e prático, organizado em **8 módulos**, que cobre desde como o Git armazena os dados por dentro
> até estratégias de *branching*, reescrita de histórico, recuperação de desastres, automação com *hooks* e
> segurança. A ideia é **entender o modelo** (para nunca mais decorar comandos às cegas) e ter, ao mesmo tempo,
> receitas prontas para o dia a dia.

Cada módulo segue a mesma estrutura:

1. **Conceito Teórico** — o modelo mental por trás dos comandos.
2. **Exemplos Práticos** — comandos e cenários completos, passo a passo.
3. **Dicas de Ouro / Anti-patterns** — o que fazer e o que **nunca** fazer.

---

## Panorama (outubro de 2026)

| Tema | Situação |
|------|----------|
| **Git 2.x** | Série atual, com *releases* a cada ~3 meses. Recursos usados neste guia (`switch`/`restore`, `rebase --update-refs`, `push.autoSetupRemote`, `zdiff3`, assinatura por SSH) existem há anos e estão estáveis |
| **Git 3.0** | **Planejado**, sem data firme (possivelmente fim de 2026 ou depois). Muda os *defaults* de **novos** repositórios: **SHA-256** no lugar de SHA-1, armazenamento de referências **reftable**, branch inicial **`main`**; Rust passa a ser dependência de *build* |
| **Repositórios existentes** | **Continuam funcionando** (SHA-1 não é convertido automaticamente) |
| **Hospedagens** | O suporte a repositórios SHA-256 nos grandes provedores ainda é o principal gargalo — confirme com o seu provedor antes de adotar (veja o Apêndice C) |

> Os cenários de *merge com conflito*, *reflog*, *reset*, *rebase interativo*, *bisect*, *worktree* e *stash*
> deste guia foram executados em um repositório de teste (Git 2.43); as saídas exibidas são reais (apenas os
> *hashes* mudam na sua máquina). Confirme `git --version` e a documentação em
> [git-scm.com/docs](https://git-scm.com/docs) para recursos recentes.

### Convenções do guia

- `$` indica comando no terminal; linhas sem `$` são saída. Hashes são ilustrativos.
- `# ❌` e `# ✅` marcam o que evitar e o que fazer.
- Os comandos funcionam em Bash/Zsh. No Zsh, coloque entre aspas expressões com `^`, `{}` e `@{}`
  (ex.: `'HEAD^{tree}'`, `'HEAD@{1}'`). No Windows, use o **Git Bash** ou **WSL**.

---

## Sumário

- [Módulo 1: Fundamentos e o Modelo Mental do Git](#módulo-1-fundamentos-e-o-modelo-mental-do-git)
- [Módulo 2: O Fluxo Diário — Stage, Commit e Histórico](#módulo-2-o-fluxo-diário--stage-commit-e-histórico)
- [Módulo 3: Branches, Merge e Resolução de Conflitos](#módulo-3-branches-merge-e-resolução-de-conflitos)
- [Módulo 4: Reescrevendo e Desfazendo — Reset, Revert, Rebase, Cherry-pick e Stash](#módulo-4-reescrevendo-e-desfazendo--reset-revert-rebase-cherry-pick-e-stash)
- [Módulo 5: Repositórios Remotos e Colaboração](#módulo-5-repositórios-remotos-e-colaboração)
- [Módulo 6: Estratégias de Branching e Fluxos de Equipe](#módulo-6-estratégias-de-branching-e-fluxos-de-equipe)
- [Módulo 7: Investigação e Recuperação de Desastres](#módulo-7-investigação-e-recuperação-de-desastres)
- [Módulo 8: Automação, Hooks, Segurança e Performance](#módulo-8-automação-hooks-segurança-e-performance)
- [Apêndice A: "Quero fazer X" — tabela de receitas](#apêndice-a-quero-fazer-x--tabela-de-receitas)
- [Apêndice B: `~/.gitconfig` recomendado](#apêndice-b-gitconfig-recomendado)
- [Apêndice C: Git 3.0, SHA-256 e reftable](#apêndice-c-git-30-sha-256-e-reftable)
- [Apêndice D: Erros comuns e referências](#apêndice-d-erros-comuns-e-referências)

---

# Módulo 1: Fundamentos e o Modelo Mental do Git

## 1.1 Conceito Teórico

### O que é Git e por que ele venceu

Git é um **sistema de controle de versão distribuído** (DVCS). Ele registra o histórico de um conjunto de
arquivos para que você possa voltar no tempo, trabalhar em paralelo (*branches*), colaborar e auditar quem mudou o quê.

| Geração | Modelo | Exemplos | Limitação |
|---------|--------|----------|-----------|
| 1ª | **Local** (um arquivo de versões) | RCS | Sem colaboração |
| 2ª | **Centralizado** (um servidor guarda tudo) | CVS, Subversion | Sem servidor = sem histórico; *branches* caros; ponto único de falha |
| 3ª | **Distribuído** (cada clone é um repositório completo) | **Git**, Mercurial | Curva de aprendizado maior |

Por que o Git domina: **velocidade** (quase tudo é local), **branches baratos**, **integridade** garantida por
*hash*, trabalho **offline** e um modelo de dados simples e poderoso.

> **Git ≠ GitHub.** Git é a ferramenta (open source, roda na sua máquina). GitHub, GitLab, Bitbucket e Azure
> DevOps são **serviços de hospedagem** que adicionam *pull requests*, CI, *issues* e controle de acesso.

### *Snapshots*, não diferenças

Muitos sistemas guardam uma lista de **mudanças** (*deltas*) por arquivo. O Git pensa diferente: cada *commit* é
um **retrato completo** (*snapshot*) do projeto naquele momento. Arquivos que não mudaram **não são copiados de
novo** — o commit apenas aponta para o mesmo conteúdo já armazenado. (Por baixo, o Git ainda comprime
armazenamento com *packfiles* e deltas, mas isso é detalhe de otimização, invisível no modelo.)

### As três áreas e os quatro estados

```text
┌────────────────────┐  git add   ┌────────────────────┐  git commit  ┌────────────────────┐
│  Diretório de      │ ─────────▶ │  Área de preparação│ ───────────▶ │   Repositório      │
│  trabalho          │            │  (staging / index) │              │   (.git)           │
│  (seus arquivos)   │ ◀───────── │                    │              │   histórico        │
└────────────────────┘  git restore └──────────────────┘              └────────────────────┘
         ▲                  --staged                                           │
         └──────────────────────  git switch / git restore  ◀─────────────────┘
```

| Área | O que é | Comandos relacionados |
|------|---------|-----------------------|
| **Diretório de trabalho** (*working tree*) | Os arquivos que você vê e edita | editar, `git restore <arq>` |
| **Staging / Index** | O "rascunho" do **próximo commit** | `git add`, `git restore --staged` |
| **Repositório** (`.git`) | O histórico imutável de commits | `git commit`, `git log` |

Estados de um arquivo: **não rastreado** (*untracked*) → **não modificado** → **modificado** → **preparado**
(*staged*). A área de *staging* existe para que você **componha** commits limpos, escolhendo exatamente o que entra.

### O banco de dados de objetos

O Git é, no fundo, um **armazenamento endereçado por conteúdo**: cada objeto é guardado sob o **hash** do seu
conteúdo. Existem **quatro tipos** de objeto:

| Objeto | Representa | Contém |
|--------|-----------|--------|
| **blob** | O **conteúdo** de um arquivo (sem nome!) | Bytes |
| **tree** | Um **diretório** | Lista de (modo, nome, hash de blob/tree) |
| **commit** | Um **retrato** + metadados | Hash da *tree* raiz, **pais**, autor, committer, mensagem |
| **tag** (anotada) | Um rótulo permanente com mensagem | Hash do objeto marcado, tagger, mensagem |

```text
        commit C3 ──pai──▶ commit C2 ──pai──▶ commit C1
           │                  │                  │
         tree               tree               tree
        ┌──┴──┐            ┌──┴──┐            ┌──┴──┐
   README.md  src/    README.md  src/     README.md
     (blob)  (tree)     (blob)  (tree)      (blob)   ← blobs idênticos são COMPARTILHADOS
```

Consequências importantes:

1. **Imutabilidade.** O hash de um commit depende do **conteúdo, dos pais, do autor e da data**. Mudar *qualquer*
   coisa gera um **novo** commit com outro hash. Por isso "editar" histórico (*amend*, *rebase*) na verdade
   **cria commits novos** e abandona os antigos.
2. **Histórico = grafo acíclico dirigido (DAG).** Cada commit aponta para seu(s) pai(s); *merges* têm **dois**
   pais.
3. **Integridade.** Qualquer corrupção ou adulteração muda o hash e é detectada.

> O algoritmo de hash padrão é **SHA-1** (40 caracteres hexadecimais). O Git também suporta **SHA-256** (64
> caracteres) e passará a usá-lo por padrão em repositórios novos no Git 3.0 (Apêndice C).

### Referências: *branches*, tags, `HEAD`

Hashes são difíceis de lembrar, então o Git usa **referências** (*refs*) — nomes que apontam para commits:

| Ref | Onde fica | O que é |
|-----|-----------|---------|
| **Branch** | `refs/heads/<nome>` | Um **ponteiro móvel** para um commit (arquivo de texto com um hash!) |
| **Tag** | `refs/tags/<nome>` | Ponteiro **fixo** (marca uma versão) |
| **Remote-tracking** | `refs/remotes/<remoto>/<nome>` | Cópia local do estado de um branch remoto (`origin/main`) |
| **`HEAD`** | `.git/HEAD` | "**Onde estou agora**": normalmente aponta para um branch; em *detached HEAD*, aponta direto para um commit |

**Um branch não é uma cópia de arquivos** — é só um ponteiro de 41 bytes. Por isso criar branches é
instantâneo e barato.

```text
 main:  C1 ◀── C2 ◀── C3                 HEAD ──▶ main ──▶ C3
                       ▲
 feature:              └── C4 ◀── C5     feature ──▶ C5
```

**Navegando no grafo:**

| Notação | Significa |
|---------|-----------|
| `HEAD` ou `@` | Commit atual |
| `HEAD~1` / `HEAD~3` | O **pai** / o 3º ancestral em linha reta |
| `HEAD^` / `HEAD^2` | O **1º pai** / o **2º pai** (em merges) |
| `main..feature` | Commits que estão em `feature` e **não** em `main` |
| `main...feature` | Commits que estão em **um ou outro**, mas não em ambos (diferença simétrica) |
| `HEAD@{2}` | Onde o `HEAD` estava **2 movimentos atrás** (reflog, Módulo 7) |
| `abc1234` | Hash abreviado (basta ser único) |

### Anatomia da pasta `.git`

```text
.git/
├── HEAD          # "ref: refs/heads/main"
├── config        # configuração LOCAL do repositório
├── index         # a área de staging (arquivo binário)
├── objects/      # o banco de dados de objetos (blobs, trees, commits, tags, packs)
├── refs/         # heads/ (branches), tags/, remotes/
├── logs/         # reflog: diário dos movimentos de HEAD e branches
└── hooks/        # scripts de exemplo (Módulo 8)
```

> **Nunca edite `.git` à mão.** Use os comandos. A pasta serve para você **entender** o modelo.

### Configuração em três níveis

| Nível | Arquivo | Escopo | Flag |
|-------|---------|--------|------|
| **system** | `/etc/gitconfig` | Todos os usuários da máquina | `--system` |
| **global** | `~/.gitconfig` | Seu usuário | `--global` |
| **local** | `.git/config` | Apenas este repositório | `--local` (padrão) |

O nível **mais específico vence** (local > global > system). `git config --list --show-origin` mostra de onde cada
valor vem.

## 1.2 Exemplos Práticos

### Configuração inicial (faça uma vez)

```bash
git --version

git config --global user.name  "Seu Nome"
git config --global user.email "voce@exemplo.com"      # use o mesmo e-mail da sua conta no GitHub/GitLab
git config --global init.defaultBranch main            # branch inicial dos novos repositórios
git config --global core.editor "code --wait"          # ou: nano, vim, "nvim"

git config --list --show-origin                        # confira tudo e de onde vem
```

**Identidade diferente para trabalho e pessoal** (configuração condicional por pasta):

```ini
# ~/.gitconfig
[user]
    name  = Seu Nome
    email = pessoal@exemplo.com

[includeIf "gitdir:~/trabalho/"]
    path = ~/.gitconfig-trabalho
```

```ini
# ~/.gitconfig-trabalho
[user]
    email = voce@empresa.com
```

### Primeiro repositório e primeiro commit

```bash
mkdir demo && cd demo
git init -b main                                 # cria o repositório com o branch "main"
echo "# Demo" > README.md
git status                                       # README.md aparece como "untracked"
git add README.md                                # → staging
git commit -m "docs: adiciona README"            # → repositório
git log --oneline --graph --decorate
```

```text
* 3f2a1bc (HEAD -> main) docs: adiciona README
```

### Espiando por dentro (inspeção de objetos)

```bash
git cat-file -t HEAD            # tipo do objeto:   commit
git cat-file -p HEAD            # conteúdo do commit
```

```text
tree 9ad3c1e...                 ← a "foto" do projeto
author Ana <ana@ex.com> 1760000000 -0300
committer Ana <ana@ex.com> 1760000000 -0300

docs: adiciona README
```

```bash
git cat-file -p 'HEAD^{tree}'   # a tree: lista de arquivos e seus blobs
# 100644 blob 8d0e41... README.md

git cat-file -p HEAD:README.md  # o conteúdo do blob

cat .git/HEAD                   # ref: refs/heads/main
cat .git/refs/heads/main        # o hash do commit para onde "main" aponta
git rev-parse HEAD              # resolve qualquer nome para um hash completo

echo "olá" | git hash-object --stdin    # o hash que o Git daria a este conteúdo (sem gravar)
```

### Comandos de visualização essenciais

```bash
git status                  # estado detalhado
git status -sb              # versão curta, com o branch
git log                     # histórico completo
git log --oneline           # um commit por linha
git log --oneline --graph --decorate --all     # o grafo com todos os branches
git diff                    # working tree  vs  staging
git diff --staged           # staging       vs  último commit
git show HEAD               # o último commit (mensagem + mudanças)
```

## 1.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- **Entenda as 3 áreas e o grafo**: quase todo comando do Git é "mover um ponteiro" e/ou "copiar entre áreas".
- Use **`git status`** compulsivamente: ele sempre diz o que você pode fazer em seguida.
- Configure **identidade** e **`init.defaultBranch`** antes do primeiro commit.
- Use `git log --oneline --graph --decorate --all` (ou um alias) para **visualizar** antes de operações arriscadas.
- Explore um repositório de teste: brincar sem risco é a melhor forma de aprender
  (veja também [learngitbranching.js.org](https://learngitbranching.js.org/)).

**❌ Nunca faça**

- **Editar arquivos dentro de `.git`** manualmente.
- Achar que um *branch* "contém" commits: ele só **aponta** para um; o commit existe independentemente.
- Decorar comandos sem entender o modelo — a primeira situação fora do roteiro vira pânico.
- Usar e-mail/nome errados nos commits e "corrigir depois" em histórico já publicado (reescrever histórico
  compartilhado tem custo alto — Módulos 4 e 5).
- Confundir **Git** com **GitHub**: muitos problemas "do Git" são, na verdade, de autenticação/permissão do serviço.

---

# Módulo 2: O Fluxo Diário — Stage, Commit e Histórico

## 2.1 Conceito Teórico

### O ciclo básico

```text
 editar arquivos  →  git add (escolher o que entra)  →  git commit (gravar o snapshot)  →  git push
```

A **área de staging** permite commits **atômicos**: se você mexeu em três coisas não relacionadas, pode gerar
**três commits** separados, cada um com um propósito.

### Desfazendo no nível de arquivos: `restore`

Desde o Git 2.23, `git checkout` foi dividido em comandos com **uma responsabilidade**:

| Comando | Faz | Substitui o uso antigo de |
|---------|-----|---------------------------|
| `git switch <branch>` | Troca de *branch* | `git checkout <branch>` |
| `git switch -c <novo>` | Cria e troca | `git checkout -b <novo>` |
| `git restore <arq>` | **Descarta** mudanças do working tree | `git checkout -- <arq>` |
| `git restore --staged <arq>` | **Tira do staging** (mantém a edição) | `git reset HEAD <arq>` |
| `git restore --source=<commit> <arq>` | Traz o arquivo **de outro commit** | `git checkout <commit> -- <arq>` |

> ⚠️ `git restore <arq>` **descarta edições não commitadas**, e isso **não tem volta** (o Git nunca as registrou).

### `.gitignore` e `.gitattributes`

**`.gitignore`** diz ao Git quais arquivos **não rastreados** ignorar (dependências, builds, segredos locais).

| Padrão | Significa |
|--------|-----------|
| `node_modules/` | Pasta inteira (barra final) |
| `*.log` | Qualquer arquivo `.log` |
| `/build` | `build` **apenas** na raiz |
| `!importante.log` | **Exceção** (negação) |
| `**/temp` | `temp` em qualquer nível |

Pontos críticos:

- `.gitignore` só afeta arquivos **ainda não rastreados**. Se o arquivo já foi commitado, é preciso
  `git rm --cached <arq>` para que o Git pare de rastreá-lo.
- Há três "lugares" de ignore: `.gitignore` (versionado, do projeto), `.git/info/exclude` (local, não
  versionado) e o **global** (`core.excludesFile`, para lixo do seu editor/SO — `.DS_Store`, `.idea/`).

**`.gitattributes`** define **como o Git trata arquivos**: normalização de quebras de linha (LF × CRLF), arquivos
binários, estratégias de *merge*, *diff drivers*, LFS.

### Mensagens de commit que contam uma história

Um bom histórico é **documentação**. Estrutura recomendada:

```text
<tipo>(<escopo opcional>): <resumo no imperativo, até ~50 caracteres>
                                       ← linha em branco
<corpo: POR QUE a mudança foi feita (não repita o que o diff já mostra),
 quebrado em linhas de ~72 caracteres>
                                       ← linha em branco
<rodapé: Closes #123 · BREAKING CHANGE: ...>
```

**Conventional Commits** padroniza o prefixo, o que permite **gerar changelog e versionamento semântico
automaticamente**:

| Tipo | Uso | Efeito no SemVer |
|------|-----|------------------|
| `feat` | Nova funcionalidade | **MINOR** |
| `fix` | Correção de bug | **PATCH** |
| `docs` | Só documentação | — |
| `style` | Formatação (sem mudar lógica) | — |
| `refactor` | Refatoração sem mudar comportamento | — |
| `perf` | Melhoria de desempenho | PATCH |
| `test` | Testes | — |
| `build` / `ci` | Sistema de build / pipeline | — |
| `chore` | Manutenção diversa | — |
| `revert` | Reverte um commit anterior | — |
| `!` ou `BREAKING CHANGE:` | Quebra de compatibilidade | **MAJOR** |

### Como ler o histórico

| Comando | Para que serve |
|---------|----------------|
| `git log` e suas opções (`--oneline`, `--graph`, `--stat`, `-p`) | Navegar no histórico |
| `git diff` | Ver **diferenças** entre áreas/commits |
| `git show <commit>` | Ver **um** commit (mensagem + mudanças) |
| `git blame <arq>` | Quem mudou cada linha por último (Módulo 7) |

`git diff` em variações: sem argumentos = *working tree* × *staging*; `--staged` = *staging* × `HEAD`;
`A B` = entre dois commits; **`A..B`** = de A até B; **`A...B`** = de onde **B divergiu** de A até B (o que o
*pull request* de B mostra).

## 2.2 Exemplos Práticos

### O ciclo completo

```bash
echo "console.log('olá')" > app.js
echo "# Projeto" > README.md

git status -sb                       # ?? app.js   ?? README.md
git add app.js                       # só o app.js entra
git commit -m "feat: adiciona script inicial"
git add README.md
git commit -m "docs: adiciona README"
```

### Commits atômicos com `git add -p` (patch interativo)

Você alterou, no **mesmo arquivo**, uma correção de bug **e** uma refatoração. Separe em dois commits:

```bash
git add -p app.js
```

```text
@@ -10,7 +10,7 @@ function calcular(...)
Stage this hunk [y,n,q,a,d,s,e,?]?
```

| Tecla | Ação |
|-------|------|
| `y` / `n` | Incluir / pular este trecho |
| `s` | **Dividir** o trecho em pedaços menores |
| `e` | **Editar** o trecho manualmente |
| `q` | Sair |

```bash
git diff --staged                    # CONFIRA o que vai no commit
git commit -m "fix: corrige divisão por zero em calcular()"
git add -p && git commit -m "refactor: extrai validação de entrada"
```

### Desfazendo e corrigindo

```bash
# Tirar um arquivo do staging (mantém a edição no disco)
git restore --staged app.js

# Descartar edições de um arquivo (⚠ sem volta)
git restore app.js

# Recuperar um arquivo de um commit anterior
git restore --source=HEAD~2 -- src/config.js

# Corrigir o ÚLTIMO commit (mensagem e/ou arquivos) — só se ainda NÃO foi publicado
git add arquivo-esquecido.js
git commit --amend --no-edit         # mantém a mensagem
git commit --amend -m "feat: nova mensagem"

# Mover/renomear e remover (e já deixar no staging)
git mv src/velho.js src/novo.js
git rm arquivo-obsoleto.js
git rm --cached segredo.env          # para de rastrear, MAS mantém o arquivo no disco
```

### Limpeza de arquivos não rastreados

```bash
git clean -n         # DRY-RUN: mostra o que seria removido
git clean -fd        # remove arquivos e pastas não rastreados (⚠ sem volta)
git clean -fdx       # inclui os ignorados (builds, node_modules)
```

### `.gitignore` típico (Node/TypeScript)

```gitignore
# dependências e builds
node_modules/
dist/
coverage/
*.tsbuildinfo

# segredos e configuração local
.env
.env.*
!.env.example

# logs e temporários
*.log
npm-debug.log*
.cache/

# editores / SO (prefira colocar no ignore GLOBAL)
.vscode/*
!.vscode/extensions.json
.idea/
.DS_Store
```

```bash
# ignore global (para lixo do seu ambiente, sem poluir os projetos)
git config --global core.excludesFile ~/.gitignore_global
printf '.DS_Store\n.idea/\n*.swp\n' >> ~/.gitignore_global
```

### `.gitattributes` recomendado

```gitattributes
# Normaliza quebras de linha: o repositório guarda LF; o checkout respeita o SO (ou force LF)
* text=auto eol=lf

# Arquivos que NUNCA devem ser convertidos
*.png  binary
*.jpg  binary
*.pdf  binary

# Scripts de shell sempre com LF (mesmo no Windows)
*.sh text eol=lf

# Lockfiles: não vale a pena resolver conflitos manualmente; marque como gerados
package-lock.json -diff
pnpm-lock.yaml    -diff
```

### Mensagem de commit completa

```bash
git commit
```

```text
feat(auth): permite login com e-mail ou nome de usuário

O formulário aceitava apenas e-mail, o que gerava muitos chamados de
suporte de usuários que só lembravam do username. A busca agora tenta
primeiro o e-mail e, se não houver "@", procura por username.

Closes #482
```

```text
feat(api)!: remove o campo `legacyId` das respostas

BREAKING CHANGE: clientes que liam `legacyId` devem migrar para `id`.
```

```bash
# Template de mensagem (lembra o formato a cada commit)
git config --global commit.template ~/.gitmessage
git config --global commit.verbose true      # mostra o diff dentro do editor da mensagem
```

### Visualizando o histórico

```bash
git log --oneline -10                            # últimos 10, uma linha cada
git log --stat                                   # arquivos alterados por commit
git log -p -- src/auth.js                        # histórico (com diffs) de UM arquivo
git log --author="Ana" --since="2 weeks ago"
git log --grep="login"                           # filtra pela mensagem
git log --format="%h %an %ar %s" -5              # formato customizado

git diff                                         # working tree × staging
git diff --staged                                # staging × HEAD
git diff main..feature                           # de main até feature
git diff main...feature                          # mudanças DA feature desde que divergiu de main
git diff --stat main                             # resumo (arquivos e linhas)
git diff --name-only HEAD~3                      # só os nomes dos arquivos
git diff --word-diff                             # diferença por palavra (ótimo para textos)

git show HEAD~2                                  # o antepenúltimo commit
git show abc1234:src/app.js                      # o arquivo como estava naquele commit
```

## 2.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- **Commits pequenos e atômicos**: uma ideia por commit, o projeto **compilando e testado** em cada um.
- **Revise antes de commitar**: `git status` + `git diff --staged`.
- Escreva a mensagem **no imperativo** ("adiciona", "corrige") e explique o **porquê** no corpo.
- Adote **Conventional Commits** se o time quiser changelog/versionamento automáticos (Módulo 6).
- Mantenha um **`.gitignore`** desde o primeiro commit e um **`.env.example`** versionado.
- Use `.gitattributes` com `* text=auto eol=lf` para evitar guerras de CRLF × LF entre Windows e Linux/macOS.
- Use **`--amend`** só em commits **locais** (ainda não publicados).

**❌ Nunca faça**

- **`git add .` sem olhar** o que entra: é assim que `.env`, chaves privadas e `node_modules` vão parar no histórico.
- **Commitar segredos** (tokens, senhas, chaves). Remover depois do histórico dá muito trabalho e o segredo já
  deve ser considerado **vazado** (Módulo 7).
- Mensagens como `fix`, `wip`, `asdf`, `ajustes`, `agora vai` — elas não ajudam ninguém (inclusive você, em 6 meses).
- **Commits gigantes** misturando refatoração, formatação e funcionalidade: dificultam revisão, *revert* e `bisect`.
- Versionar **artefatos gerados** (`dist/`, `coverage/`, binários) e **arquivos grandes** (use Git LFS — Módulo 8).
- Achar que `.gitignore` remove arquivos **já rastreados** (use `git rm --cached`).
- Usar `git clean -fdx` sem fazer `git clean -n` antes.

---

# Módulo 3: Branches, Merge e Resolução de Conflitos

## 3.1 Conceito Teórico

### *Branches* na prática

Como vimos, um *branch* é um **ponteiro móvel** para um commit. Ao fazer um novo commit estando em um branch,
**o ponteiro avança** automaticamente. Trocar de branch muda o `HEAD` e **reescreve o diretório de trabalho**
para refletir o snapshot daquele commit.

```text
Antes de `git switch -c feature` e dois commits:         Depois:

 C1 ◀── C2 ◀── C3   ← main  ← HEAD                       C1 ◀── C2 ◀── C3   ← main
                                                                         ▲
                                                                         └── C4 ◀── C5  ← feature ← HEAD
```

**Convenções de nomes** (consistência vale mais que a convenção em si): `feature/login-oauth`, `fix/erro-cpf`,
`hotfix/1.4.1`, `release/1.5.0`, `chore/atualiza-deps`; minúsculas, hífens, **sem espaços**, de preferência
com o **número da *issue*** (`feature/482-login-por-username`).

**`HEAD` destacado (*detached HEAD*)**: ocorre quando você faz *checkout* de um **commit** (ou tag) em vez de um
branch. Você pode olhar e até commitar, mas **novos commits não pertencem a nenhum branch** e podem ser perdidos
ao trocar de lugar. Se quiser manter o trabalho: `git switch -c novo-branch`.

### *Merge*: juntando históricos

`git merge <branch>` incorpora, no **branch atual**, as mudanças do outro. Existem **dois comportamentos**
principais, dependendo do formato do grafo:

**1. *Fast-forward*** — se o branch atual **não avançou** desde que o outro nasceu, o Git apenas **move o
ponteiro**. Nenhum commit novo é criado; o histórico fica linear.

```text
 main:    C1 ◀── C2                       main (fast-forward):  C1 ◀── C2 ◀── C3 ◀── C4
 feature:         └── C3 ◀── C4                                                         ↑ main e feature
```

**2. *Merge de três vias* (*three-way merge*)** — se **ambos** os branches avançaram, o Git encontra o
**ancestral comum** (*merge base*), compara as **duas pontas** contra ele e cria um **commit de merge** com
**dois pais**.

```text
 C1 ◀── C2 ◀── C4 ◀────────── M   ← main (commit de merge: 2 pais)
         └──── C3 ◀── C5 ◀───┘
                       ← feature
```

| Opção | Efeito | Quando usar |
|-------|--------|-------------|
| (padrão) | Fast-forward se possível; senão, merge commit | Dia a dia |
| `--no-ff` | **Sempre** cria um merge commit (preserva a "bolha" da feature) | Quando quer registrar que existiu uma feature |
| `--ff-only` | **Só** faz fast-forward; falha se não for possível | Atualizar branch local sem criar merges acidentais |
| `--squash` | Junta todas as mudanças em **um único commit** (sem relação de merge) | Limpar o histórico de uma feature "suja" |
| `--abort` | Cancela um merge em andamento e volta ao estado anterior | Conflito complicado demais |

> **Atenção com `--squash`**: o branch original **não** fica marcado como "mergeado" (não há relação de
> ancestralidade). `git branch -d` recusará apagá-lo; será preciso `git branch -D`.

### Conflitos: por que acontecem e como ler

Conflito acontece quando **as duas pontas alteraram o mesmo trecho** (ou um lado apagou o arquivo que o outro
editou) e o Git **não consegue decidir sozinho**. Ele para o merge, marca os arquivos como **"unmerged"** e
escreve **marcadores** dentro do arquivo:

```text
<<<<<<< HEAD              ← versão do branch ATUAL (onde você está)
linha 2 (main)
||||||| 9adf228           ← (só com zdiff3/diff3) como era no ANCESTRAL COMUM
linha 2
=======                   ← separador
linha 2 (feature)         ← versão do branch sendo incorporado
>>>>>>> feature/a
```

O estilo `zdiff3` (`git config --global merge.conflictStyle zdiff3`) **mostra o ancestral**, o que torna muito mais
fácil decidir o que fazer. **Recomendado.**

**Resolver um conflito = editar o arquivo para o resultado final desejado**, remover os marcadores,
`git add` e concluir (`git commit` ou `git merge --continue`).

**`ours` e `theirs` — o maior motivo de confusão:**

| Situação | `--ours` | `--theirs` |
|----------|----------|------------|
| **`git merge feature`** (você está em `main`) | `main` (o branch **atual**) | `feature` |
| **`git rebase main`** (você está em `feature`) | `main` (a **base** sobre a qual reaplica) | **seus commits** de `feature` sendo reaplicados |

> No *rebase*, os papéis parecem **invertidos** porque o Git está reaplicando **seus** commits sobre a base. Na
> dúvida, abra o arquivo e leia os marcadores.

**Estratégias avançadas (use com cautela):**

| Opção | Efeito |
|-------|--------|
| `git merge -X ours <b>` | Em **conflitos**, prefere o lado atual; o resto é mesclado normalmente |
| `git merge -X theirs <b>` | Em conflitos, prefere o lado incorporado |
| `git merge -s ours <b>` | Registra o merge, mas **descarta por completo** as mudanças do outro branch |

**`git rerere`** (*reuse recorded resolution*): o Git **memoriza** como você resolveu um conflito e **reaplica
automaticamente** quando o mesmo conflito reaparece (muito útil em rebases repetidos de branches longos).

## 3.2 Exemplos Práticos

### Gerenciando branches

```bash
git branch                          # lista os locais (* = atual)
git branch -vv                      # com último commit e upstream
git branch -a                       # inclui remotos
git branch --merged main            # já incorporados à main (candidatos a apagar)
git branch --no-merged main         # ainda NÃO incorporados

git switch -c feature/login         # cria E troca
git switch main                     # troca
git switch -                        # volta ao branch anterior
git switch --detach a1b2c3d         # inspeciona um commit (detached HEAD)

git branch -m nome-antigo nome-novo # renomeia
git branch -d feature/login         # apaga (só se já estiver mergeado)
git branch -D feature/login         # força (⚠ pode perder commits não incorporados)
git push origin --delete feature/login   # apaga no remoto
```

### Merge sem conflito (*fast-forward* × `--no-ff`)

```bash
git switch main
git merge feature/login             # fast-forward, se main não avançou
git merge --no-ff feature/login     # força um commit de merge
git merge --ff-only feature/login   # falha se não for possível fast-forward
```

### Um conflito do começo ao fim (cenário real executado)

```bash
git init -b main conflito && cd conflito
printf 'linha 1\nlinha 2\nlinha 3\n' > arq.txt
git add . && git commit -m "feat: arquivo inicial"

git switch -c feature/a
printf 'linha 1\nlinha 2 (feature)\nlinha 3\n' > arq.txt
git commit -am "feat: altera linha 2 na feature"

git switch main
printf 'linha 1\nlinha 2 (main)\nlinha 3\n' > arq.txt
git commit -am "fix: altera linha 2 na main"

git merge feature/a
```

```text
Auto-merging arq.txt
CONFLICT (content): Merge conflict in arq.txt
Automatic merge failed; fix conflicts and then commit the result.
```

```bash
git status -sb
```

```text
## main
UU arq.txt                 ← "UU" = both modified (não mesclado)
```

```bash
cat arq.txt                # (com merge.conflictStyle = zdiff3)
```

```text
linha 1
<<<<<<< HEAD
linha 2 (main)
||||||| 9adf228
linha 2
=======
linha 2 (feature)
>>>>>>> feature/a
linha 3
```

Resolva **editando o arquivo** para o resultado desejado (aqui, combinando as duas ideias):

```bash
printf 'linha 1\nlinha 2 (resolvida)\nlinha 3\n' > arq.txt
git add arq.txt                              # marca como resolvido
git commit -m "merge: resolve conflito da linha 2"     # (ou: git merge --continue)

git log --oneline --graph --decorate --all
```

```text
*   c75d5eb (HEAD -> main) merge: resolve conflito da linha 2
|\
| * cc68375 (feature/a) feat: altera linha 2 na feature
* | c87ea95 fix: altera linha 2 na main
|/
* 9adf228 feat: arquivo inicial
```

### Ferramentas úteis durante o conflito

```bash
git status                              # lista "Unmerged paths"
git diff --name-only --diff-filter=U    # só os arquivos em conflito
git diff                                # mostra o conflito de forma combinada
git log --merge --oneline               # commits dos dois lados que tocam os arquivos em conflito
git merge-base main feature/a           # qual é o ancestral comum?

# Escolher UM lado inteiro para um arquivo específico
git restore --ours   -- arq.txt         # fica com a versão do branch ATUAL
git restore --theirs -- arq.txt         # fica com a versão do outro branch
git add arq.txt

git mergetool                           # abre sua ferramenta visual (configure: merge.tool)
git merge --abort                       # desiste: volta ao estado antes do merge
```

### Configurações que reduzem a dor

```bash
git config --global merge.conflictStyle zdiff3     # mostra o ancestral comum
git config --global rerere.enabled true            # memoriza resoluções
git config --global diff.algorithm histogram       # diffs mais legíveis
```

### Descartando um branch "squash-mergeado"

```bash
git switch main
git merge --squash feature/grande      # prepara as mudanças no staging (sem commitar)
git commit -m "feat: adiciona módulo de relatórios (#512)"
git branch -D feature/grande           # -d recusaria: o Git não vê relação de merge
```

## 3.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- **Branches curtos e focados**: quanto mais tempo uma branch vive, mais ela diverge e mais conflitos gera.
- **Atualize seu branch com frequência** a partir da `main` (via `rebase` ou `merge`) para resolver conflitos
  **em pequenas doses**.
- Use **`zdiff3`** e **`rerere`**.
- **Rode os testes depois de resolver** um conflito: o Git garante que *mesclou*, **não que funciona**.
- Faça `git status` e `git diff` antes de concluir o merge.
- Prefira **`--ff-only`** ao atualizar um branch local para evitar merges acidentais.
- Apague branches já incorporados (local e remoto) para manter o repositório organizado.
- Combine **formatadores** (Prettier, Black) e *lint* automatizados para evitar conflitos de estilo.

**❌ Nunca faça**

- **Resolver conflitos "no escuro"**, escolhendo `--ours`/`--theirs` em massa sem entender o que cada lado fez.
- **Commitar marcadores de conflito** (`<<<<<<<`) por esquecimento — use `git diff --check` e um *hook* de
  *pre-commit* (Módulo 8).
- Deixar branches de feature vivendo por semanas sem sincronizar com a `main`.
- Usar `-s ours` achando que é "resolver conflito" — ele **descarta** o trabalho do outro branch.
- Apagar um branch com `-D` sem ter certeza de que o conteúdo está em outro lugar (a recuperação é possível pelo
  *reflog*, Módulo 7, mas dá trabalho).
- Fazer commits **no `HEAD` destacado** e depois trocar de lugar sem criar um branch.

---

# Módulo 4: Reescrevendo e Desfazendo — Reset, Revert, Rebase, Cherry-pick e Stash

## 4.1 Conceito Teórico

### A regra de ouro

> **Reescrever histórico é seguro enquanto ele é só seu (local). Depois de publicado/compartilhado, não reescreva
> — use `revert`.**

Reescrever (`amend`, `reset`, `rebase`, `filter-repo`) **cria commits novos com hashes novos**. Se alguém já
baseou trabalho nos commits antigos, os históricos divergem e o time sofre. Por isso:

| Situação | Ferramenta correta |
|----------|---------------------|
| Commit **só local**, quer ajustar | `commit --amend`, `reset`, `rebase -i` |
| Commit **já publicado** em branch compartilhada, quer desfazer | **`git revert`** (cria um commit inverso) |
| Branch de feature **só sua** já publicada | Pode reescrever + `push --force-with-lease` (avise o time) |

### `git reset`: movendo o ponteiro do branch

`git reset <commit>` move o **branch atual** para `<commit>` e, conforme o **modo**, também mexe nas outras áreas:

| Modo | Move o branch (`HEAD`) | Altera o **staging** | Altera o **working tree** | Uso típico |
|------|:----------------------:|:--------------------:|:-------------------------:|------------|
| `--soft` | ✔ | ✘ (mudanças **ficam staged**) | ✘ | "Desfazer o commit, **manter tudo preparado**" (refazer/juntar commits) |
| `--mixed` (**padrão**) | ✔ | ✔ (mudanças **ficam unstaged**) | ✘ | "Desfazer o commit **e** o `add`, manter as edições" |
| `--hard` | ✔ | ✔ | ✔ (**descarta edições**) | "Jogar fora tudo e voltar a este commit" |

> ⚠️ `reset --hard` **destrói edições não commitadas — e essas não têm recuperação** (o Git nunca as registrou).
> Já os **commits** descartados continuam acessíveis pelo *reflog* por um tempo (Módulo 7).

### `git revert`: desfazer **sem reescrever**

`git revert <commit>` cria um **novo commit** que aplica o **inverso** das mudanças do commit indicado. O
histórico original permanece intacto — **seguro para branches compartilhadas**. Para reverter um **commit de
merge**, é preciso dizer qual pai considerar a "linha principal": `git revert -m 1 <merge>`.

### `git rebase`: reaplicando commits sobre outra base

`git rebase main` (estando em `feature`) **pega os commits exclusivos de `feature`, "levanta" e os reaplica um a
um** sobre a ponta atual de `main`, criando **commits novos** (hashes diferentes):

```text
Antes:                              Depois de `git rebase main` (em feature):

 C1 ◀── C2 ◀── C4   ← main           C1 ◀── C2 ◀── C4 ◀── C3' ◀── C5'  ← feature
         └── C3 ◀── C5 ← feature                          ↑ main
                                        (C3 e C5 originais ficam órfãos; C3' e C5' são cópias)
```

**Merge × Rebase:**

| | **Merge** | **Rebase** |
|---|-----------|------------|
| Histórico | Preserva a **história real** (com merge commits) | **Linear** e "limpa" |
| Reescreve commits? | **Não** | **Sim** (novos hashes) |
| Seguro em branch pública? | **Sim** | **Não** |
| Conflitos | Resolve **uma vez** | Pode resolver **commit a commit** |
| Rastreabilidade ("quando integrou?") | Alta (commit de merge) | Menor |

**Boa prática comum:** *rebase* da **sua** branch de feature sobre a `main` (para atualizar/limpar) e *merge*
(ou *squash merge*) na `main` via *pull request*.

### Rebase interativo (`git rebase -i`)

Abre uma **lista de tarefas** com os commits do intervalo; você muda o verbo de cada linha:

| Comando | Efeito |
|---------|--------|
| `pick` | Mantém o commit como está |
| `reword` | Mantém o conteúdo, **edita a mensagem** |
| `edit` | **Para** no commit para você alterá-lo (arquivos, divisão em dois...) |
| `squash` | **Funde** no commit anterior, **combinando as mensagens** |
| `fixup` | Funde no anterior **descartando a mensagem** deste |
| `drop` | **Remove** o commit |
| `exec <cmd>` | Roda um comando (ex.: testes) após o commit |
| (reordenar linhas) | **Reordena** os commits |

**`--autosquash` + `commit --fixup`**: ao perceber que uma correção pertence a um commit antigo, você faz
`git commit --fixup=<hash>`; depois `git rebase -i --autosquash` **posiciona e marca automaticamente** a correção
como `fixup`.

**`--onto`**: move um **trecho** de commits para outra base (ex.: sua branch nasceu de `feature-a` por engano e
deveria ter nascido de `main`).

**`--update-refs`** (Git 2.38+): ao reescrever uma pilha de branches encadeados (*stacked branches*), atualiza os
ponteiros dos branches intermediários automaticamente.

### `git cherry-pick`

Copia **um ou mais commits** específicos para o branch atual (criando commits **novos** com o mesmo conteúdo).
Ideal para **levar um *hotfix*** a uma branch de release, ou resgatar um commit de uma branch descartada.
Evite abusar: cópias de um mesmo commit em vários branches criam **duplicatas** no histórico.

### `git stash`: a gaveta temporária

O *stash* guarda suas **mudanças não commitadas** numa pilha local e deixa o diretório **limpo**, para você trocar
de branch rapidamente. É **local** (não vai para o remoto) e **não substitui** commits de trabalho em andamento
que você quer proteger.

## 4.2 Exemplos Práticos

### `reset`: os três modos (executados)

```bash
# Estado: ... c1 ◀ c2 (HEAD)
git reset --soft HEAD~1
git status -sb
```

```text
## main
A  b.txt                   ← o commit sumiu, mas a mudança continua STAGED
```

```bash
git commit -m "c2 de novo"
git reset HEAD~1           # --mixed (padrão)
git status -sb
```

```text
## main
?? b.txt                   ← mudança preservada no disco, mas FORA do staging
```

```bash
git reset --hard HEAD~1    # ⚠ apaga o commit E as edições do working tree
git reset --hard origin/main   # alinha o branch local ao remoto, descartando o que for local
```

### `revert`: desfazer algo já publicado

```bash
git revert a1b2c3d                     # cria um commit que desfaz a1b2c3d
git revert --no-commit HEAD~3..HEAD    # reverte os 3 últimos, preparando tudo para UM commit
git revert -m 1 7f8e9d0                # reverte um commit de MERGE (mantendo o 1º pai como linha principal)
```

> Reverter um merge diz ao Git "essas mudanças não existem mais". Se você tentar **fazer o merge da mesma branch
> de novo** depois, o Git achará que já foi incorporada. Reverta o *revert* (`git revert <hash-do-revert>`) antes
> de reintegrar.

### Rebase simples (atualizar sua feature)

```bash
git switch feature/login
git fetch origin
git rebase origin/main               # reaplica seus commits sobre a main mais recente
```

**Se houver conflito durante o rebase:**

```bash
# 1. edite os arquivos e resolva
git add arquivo-resolvido.js
git rebase --continue                # ⚠ NÃO use "git commit" no meio de um rebase
# ou:
git rebase --skip                    # descarta o commit atual (cuidado)
git rebase --abort                   # volta ao estado anterior ao rebase
```

### Rebase interativo: juntar commits "sujos" (executado)

```bash
git log --oneline -3
```

```text
0b93c7f wip 3
1cc4e74 wip 2
4f2fb2d wip 1
```

```bash
git rebase -i HEAD~3
```

```text
pick 4f2fb2d wip 1          ← mantém
fixup 1cc4e74 wip 2         ← funde no anterior (descarta a mensagem)
fixup 0b93c7f wip 3         ← funde no anterior (descarta a mensagem)
```

```text
Successfully rebased and updated refs/heads/main.
```

```bash
git log --oneline -2
```

```text
19d8409 wip 1               ← os três viraram UM commit (renomeie com `reword` ou `commit --amend`)
9ef5320 c2 de novo 2
```

### `fixup` + `autosquash`

```bash
# Você percebeu um erro em um commit ANTIGO (hash 3a4b5c6) enquanto trabalhava
git add src/validacao.js
git commit --fixup=3a4b5c6

git rebase -i --autosquash origin/main     # o Git já organiza a lista; basta salvar e fechar
git config --global rebase.autoSquash true # torna --autosquash o padrão
```

### Outras operações do `rebase`

```bash
# --onto: mover um trecho. A branch "feature-b" nasceu de "feature-a", mas deveria nascer da main:
git rebase --onto main feature-a feature-b
#                  └ nova base   └ base antiga   └ branch a mover

# Branches empilhados: atualize todos de uma vez
git rebase --update-refs main
git config --global rebase.updateRefs true

# Reescrever mensagens de uma série
git rebase -i HEAD~5      # troque "pick" por "reword" nos commits desejados
```

### `cherry-pick`

```bash
git switch release/1.4
git cherry-pick a1b2c3d                 # copia UM commit
git cherry-pick -x a1b2c3d              # idem, anotando "(cherry picked from commit ...)" na mensagem
git cherry-pick a1b2c3d^..f4e5d6c       # um INTERVALO (inclui os dois extremos)
git cherry-pick -n a1b2c3d              # aplica as mudanças sem criar o commit
git cherry-pick -m 1 <merge-commit>     # cherry-pick de um merge (indica o pai)

# Em caso de conflito: resolva, git add, e:
git cherry-pick --continue              # ou --abort
```

### `stash`

```bash
git stash push -m "wip: formulário de login"     # guarda (apenas arquivos RASTREADOS)
git stash push -u -m "wip com arquivos novos"    # -u inclui arquivos NÃO rastreados
git stash push -p                                # escolhe trechos interativamente
git stash push -- src/auth.js                    # só este arquivo

git stash list
```

```text
stash@{0}: On main: wip: formulário de login
```

```bash
git stash show -p stash@{0}      # ver o conteúdo (com diff)
git stash pop                    # reaplica o mais recente E remove da pilha
git stash apply stash@{1}        # reaplica SEM remover (útil para aplicar em vários branches)
git stash branch nova-branch stash@{0}   # cria um branch a partir do stash
git stash drop stash@{0}         # remove um
git stash clear                  # remove todos (⚠)
```

### Rede de segurança: `ORIG_HEAD` e backup

```bash
# Antes de qualquer operação arriscada, crie um "marcador"
git branch backup/antes-do-rebase

# Operações como merge, rebase e reset gravam o ponto anterior em ORIG_HEAD:
git reset --hard ORIG_HEAD           # desfaz o último merge/rebase/reset (se ainda não houve outro)
```

## 4.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- **Reescreva só o que é local.** Antes de publicar, limpe: junte `wip`, reordene, melhore mensagens.
- Use **`revert`** para desfazer em branches compartilhadas (`main`, `develop`, `release/*`).
- Crie um **branch de backup** (`git branch backup/x`) antes de rebases/resets complexos.
- Use **`commit --fixup` + `--autosquash`** para manter o histórico limpo sem esforço.
- Use **`stash -u`** (ou commits temporários) antes de operações que mexem no working tree.
- Depois de reescrever e precisar publicar, use **`--force-with-lease`** (Módulo 5), **nunca** `--force` puro.
- Se um rebase virar um pesadelo, **`git rebase --abort`** e reconsidere (talvez um `merge` seja mais simples).

**❌ Nunca faça**

- **`git rebase` ou `git commit --amend` em commits já publicados e usados por outras pessoas.**
- **`git push --force`** em `main`/branches compartilhadas.
- **`git reset --hard`** com edições não commitadas que você quer manter (guarde com `stash` antes).
- Usar **`git commit`** no meio de um rebase com conflito (o correto é `git add` + `git rebase --continue`).
- Fazer cherry-pick do mesmo commit em muitos branches como estratégia de integração (gera duplicatas e conflitos).
- Tratar o **stash como depósito de longo prazo**: ele é local, sem nome de branch, e se perde com facilidade.
- Confundir `reset` (move o branch) com `restore` (restaura arquivos) e `revert` (cria commit inverso).

---

# Módulo 5: Repositórios Remotos e Colaboração

## 5.1 Conceito Teórico

### O que é um remoto

Um **remoto** (*remote*) é apenas um **apelido para uma URL** de outro repositório Git (em um servidor, no
GitHub, em outra pasta...). O nome padrão do remoto de onde você clonou é **`origin`**. Um repositório pode ter
vários remotos (`origin`, `upstream`, `colega`...).

### Branches remotos e *tracking*

Para cada branch do remoto, o Git mantém **localmente** uma referência `origin/<branch>` (*remote-tracking
branch*). Ela é uma **fotografia** do remoto **na última vez que você conversou com ele** — só é atualizada por
`fetch`, `pull` e `push`. Ela **não** se move sozinha.

```text
 Remoto (origin):       C1 ◀ C2 ◀ C3 ◀ C4          (alguém empurrou C3 e C4)
 Seu repositório:
    origin/main  ───▶ C2          ← foto antiga (até você fazer fetch)
    main (local) ───▶ C2 ◀ C5     ← você commitou C5 por conta própria

 Depois do `git fetch`:  origin/main ──▶ C4     (divergiu de main: main tem C5; origin/main tem C3, C4)
```

Um **branch local pode "rastrear" (*track*) um branch remoto** (*upstream*), o que dá sentido a `git pull`,
`git push` e ao indicador `ahead/behind` do `git status`.

### `fetch` × `pull` × `push`

| Comando | O que faz | Altera seus branches locais? |
|---------|-----------|:---------------------------:|
| `git fetch` | **Baixa** commits/refs novos e atualiza `origin/*` | ❌ **Não** (seguro, sempre pode rodar) |
| `git pull` | `fetch` **+** integra no branch atual (`merge` ou `rebase`) | ✔ |
| `git push` | **Envia** seus commits e move o branch remoto | (altera o remoto) |

> `git pull` = `git fetch` + (`git merge` **ou** `git rebase`). Entender isso evita surpresas: muitos "pulls
> bagunçados" são merges automáticos indesejados. Configure o comportamento (`pull.rebase` ou `pull.ff only`).

**O `push` só avança em *fast-forward*.** Se o remoto tem commits que você não tem, o push é **rejeitado**
(*non-fast-forward*): faça `fetch` e integre antes. Para **forçar**, existem duas formas **muito diferentes**:

| Flag | Comportamento | Segurança |
|------|----------------|-----------|
| `--force` | **Sobrescreve** o remoto incondicionalmente | ⚠ Pode apagar o trabalho dos colegas |
| `--force-with-lease` | Só sobrescreve **se o remoto ainda estiver como você o viu** (ninguém empurrou nada novo) | ✔ Muito mais seguro |
| `--force-if-includes` | Complementa o *lease*: confere que você **integrou** o que viu | ✔ Ainda mais seguro (combine com o *lease*) |

### Fork, *upstream* e *pull request*

Em projetos open source (ou quando você não tem permissão de escrita), o fluxo é:

```text
  [repositório original]  ◀── Pull Request ──  [seu fork no GitHub]  ◀── push ──  [seu clone local]
        upstream                                    origin
```

1. **Fork** (cópia sua no servidor) → 2. **clone** do fork → 3. adiciona o original como **`upstream`** →
4. cria um **branch de feature** → 5. `push` para o seu fork → 6. abre o **Pull Request (PR)**/*Merge Request (MR)*.

O **Pull Request** não é um recurso do Git, e sim da plataforma: um pedido para incorporar um branch em outro,
com **revisão de código**, discussão e verificações automáticas (CI).

### Tags e versionamento

| Tipo | Comando | Característica |
|------|---------|----------------|
| **Leve** (*lightweight*) | `git tag v1.0.0` | Só um ponteiro (sem metadados) |
| **Anotada** (*annotated*) | `git tag -a v1.0.0 -m "..."` | Objeto completo: autor, data, mensagem (e pode ser **assinada**). **Recomendada para releases** |

Tags **não são enviadas** por padrão: é preciso `git push origin <tag>` (ou `--follow-tags`).
Use **Versionamento Semântico (SemVer)**: `MAJOR.MINOR.PATCH` — **MAJOR** quebra compatibilidade, **MINOR**
adiciona funcionalidade compatível, **PATCH** corrige bugs; sufixos para pré-lançamento (`1.2.0-rc.1`).

### Autenticação

| Método | Como funciona | Observação |
|--------|---------------|------------|
| **SSH** | Par de chaves (privada fica com você, pública no servidor) | Recomendado: sem senha a cada operação; prefira `ed25519` |
| **HTTPS + token** | URL `https://...` com **Personal Access Token** (PAT) ou OAuth | Use um *credential helper*; dê **escopos mínimos** ao token |
| **GitHub CLI** | `gh auth login` configura credenciais | Prático para quem usa `gh` |

### Assinatura de commits e tags

Autor e e-mail em um commit são **apenas texto** — qualquer um pode se passar por você localmente. **Assinar**
commits/tags (GPG **ou chave SSH**, desde o Git 2.34) prova **autoria** e aparece como **"Verified"** em
plataformas como GitHub/GitLab.

### Repositórios grandes: clones parciais

| Técnica | O que faz | Quando usar |
|---------|-----------|-------------|
| **Clone raso** (`--depth N`) | Baixa só os N últimos commits | **CI** que só precisa do código atual |
| **Clone parcial** (`--filter=blob:none`) | Baixa histórico **sem os arquivos**; busca blobs sob demanda | Monorepos enormes |
| **Sparse checkout** | Materializa só **algumas pastas** no disco | Trabalhar em uma parte de um monorepo |
| **Submódulos** | Repositório dentro de repositório, **fixado em um commit** | Dependências versionadas separadamente |
| **Git LFS** | Guarda arquivos grandes fora do repositório (ponteiros no Git) | Binários grandes (imagens, vídeo, modelos) |

## 5.2 Exemplos Práticos

### Conectando e sincronizando

```bash
git clone git@github.com:org/projeto.git          # clona (já cria o remoto "origin")
cd projeto

git remote -v                                      # lista os remotos e URLs
git remote add origin git@github.com:org/projeto.git   # (se você começou com `git init`)
git remote set-url origin git@github.com:org/novo.git   # troca a URL
git remote rename origin github
git remote remove upstream
```

```bash
# Criar um branch e publicá-lo pela primeira vez
git switch -c feature/relatorios
git push -u origin feature/relatorios              # -u: configura o upstream (próximos push/pull sem argumentos)

git status -sb                                     # ## feature/relatorios...origin/feature/relatorios [ahead 1]
git branch -vv                                     # mostra upstream e ahead/behind de cada branch
```

```bash
# Rotina de sincronização segura
git fetch --prune                                  # baixa novidades e remove refs de branches apagados no remoto
git log --oneline HEAD..origin/main                # o que o remoto tem e eu não?
git log --oneline origin/main..HEAD                # o que eu tenho e o remoto não?

git pull --ff-only                                 # atualiza SÓ se for fast-forward (nunca cria merge acidental)
git pull --rebase                                  # ou: reaplica seus commits locais sobre o remoto
```

### Configurações que evitam dor de cabeça

```bash
git config --global pull.rebase true               # (ou: pull.ff only) — escolha explícita, sem surpresa
git config --global fetch.prune true               # limpa branches remotos obsoletos
git config --global push.autoSetupRemote true      # `git push` já cria o upstream do branch novo (Git 2.37+)
git config --global push.followTags true           # envia tags anotadas junto com os commits
git config --global push.default simple
```

### Forçando com segurança

```bash
# Depois de reescrever (rebase/amend) um branch SEU já publicado:
git push --force-with-lease --force-if-includes

# ❌ Evite:
git push --force
```

### Fork + upstream (open source)

```bash
git clone git@github.com:SEU-USUARIO/projeto.git && cd projeto
git remote add upstream git@github.com:ORIGINAL/projeto.git
git remote -v

# Manter o fork atualizado
git fetch upstream
git switch main
git merge --ff-only upstream/main       # ou: git rebase upstream/main
git push origin main

# Trabalhar em uma feature
git switch -c fix/typo-na-documentacao
# ... edita, commita ...
git push -u origin fix/typo-na-documentacao
# abra o Pull Request na interface web ou com a GitHub CLI:
gh pr create --fill
```

### Tags e releases

```bash
git tag -a v1.0.0 -m "Release 1.0.0"             # anotada no commit atual
git tag -a v0.9.0 a1b2c3d -m "Beta 0.9.0"        # em um commit antigo
git tag -l "v1.*"                                # lista com filtro
git show v1.0.0                                  # detalhes
git describe --tags                              # "v1.0.0-5-g1a2b3c4" = 5 commits após a tag

git push origin v1.0.0                           # publica UMA tag
git push --follow-tags                           # publica commits + tags anotadas alcançáveis

git tag -d v1.0.0                                # apaga local
git push origin --delete v1.0.0                  # apaga no remoto
```

### SSH: gerar chave e testar

```bash
ssh-keygen -t ed25519 -C "voce@exemplo.com"      # aceite o caminho padrão; use uma passphrase
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519                        # (macOS: ssh-add --apple-use-keychain ...)
cat ~/.ssh/id_ed25519.pub                        # cole em: GitHub → Settings → SSH and GPG keys
ssh -T git@github.com                            # "Hi usuario! You've successfully authenticated..."
```

```sshconfig
# ~/.ssh/config — duas contas (pessoal e trabalho) no mesmo computador
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes

Host github-trabalho
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_trabalho
  IdentitiesOnly yes
```

```bash
git clone git@github-trabalho:empresa/repo.git   # usa a chave do trabalho
```

### HTTPS com *credential helper*

```bash
git config --global credential.helper manager    # Git Credential Manager (Windows/macOS e Linux, se instalado)
# ou o GitHub CLI:  gh auth login   (configura as credenciais automaticamente)

# ❌ `credential.helper store` guarda a senha/token em TEXTO PURO no disco
# ❌ nunca coloque o token na URL do remoto: https://TOKEN@github.com/...
```

### Assinando commits com chave SSH

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true          # assina todo commit
git config --global tag.gpgsign true             # assina toda tag anotada

# No GitHub: Settings → SSH and GPG keys → New SSH key → tipo "Signing Key" (cole a mesma chave pública)

# Verificação LOCAL (opcional): registre quem é confiável
mkdir -p ~/.config/git
echo "voce@exemplo.com $(cat ~/.ssh/id_ed25519.pub)" >> ~/.config/git/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
git log --show-signature -1
```

### Clones para repositórios grandes

```bash
git clone --depth 1 --branch main git@github.com:org/repo.git     # raso: só o último commit (CI)
git fetch --unshallow                                              # baixa o histórico completo depois

# Monorepo: clone parcial + só as pastas necessárias
git clone --filter=blob:none --sparse git@github.com:org/monorepo.git
cd monorepo
git sparse-checkout set --cone apps/api packages/shared
git sparse-checkout list
```

### Submódulos

```bash
git submodule add git@github.com:org/lib-comum.git libs/comum     # registra em .gitmodules e fixa um commit
git clone --recurse-submodules git@github.com:org/projeto.git     # clona já com submódulos
git submodule update --init --recursive                           # (se esqueceu o --recurse-submodules)
git submodule update --remote libs/comum                          # avança para o commit mais novo do remoto
# Depois de atualizar, o repositório PRINCIPAL registra o novo ponteiro: commite essa mudança.
```

## 5.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- **`git fetch` com frequência** e **olhe antes de integrar** (`git log HEAD..origin/main`).
- Defina **explicitamente** a política de pull (`pull.rebase true` ou `pull.ff only`).
- Use **`--force-with-lease`** (+ `--force-if-includes`) ao republicar branches reescritos.
- Prefira **SSH** (ou *credential manager*) e **chaves/tokens com escopo mínimo**; use 2FA na plataforma.
- **Assine** commits/tags em projetos que exigem rastreabilidade.
- Crie **tags anotadas** para cada release e publique-as; use **SemVer**.
- Use **`--depth 1`** no CI e **clone parcial/sparse** em monorepos gigantes.
- Verifique o remoto antes de empurrar (`git remote -v`, `git status -sb`), principalmente com várias contas.

**❌ Nunca faça**

- **`git push --force`** em branches compartilhadas (principalmente `main`).
- **Commitar** tokens/senhas ou colocá-los na **URL** do remoto.
- **`git pull` "no automático"** em um branch com trabalho local sem saber se vai gerar merge ou rebase.
- Reescrever histórico **já publicado e usado por outros** (leia o Módulo 4).
- Usar `credential.helper store` em máquina compartilhada.
- Esquecer de **publicar tags** e depois se perguntar por que o *release* não aparece.
- Usar **submódulos** por conveniência quando um gerenciador de pacotes (npm, pip, Maven) resolveria melhor.
- Trabalhar **direto na `main`** em projetos com revisão: abra branches e PRs.

---

# Módulo 6: Estratégias de Branching e Fluxos de Equipe

## 6.1 Conceito Teórico

### Não existe "o" fluxo certo — existe o que combina com o seu contexto

O Git não impõe fluxo de trabalho. Equipes adotam **convenções**. As principais:

| Estratégia | Ideia | Branches principais | Cadência de release | Complexidade | Combina com |
|------------|-------|---------------------|---------------------|:------------:|-------------|
| **GitHub Flow** | `main` sempre implantável; toda mudança vem de um branch curto + PR | `main` + branches de feature | **Contínua** (deploy após o merge) | Baixa | Web apps, SaaS, times pequenos/médios |
| **Trunk-Based Development** | Todos integram **em `main`** (tronco) com muita frequência; branches vivem **horas/poucos dias**; *feature flags* escondem o inacabado | `main` (+ branches muito curtos) | Contínua / várias vezes ao dia | Baixa no Git, **alta exigência de CI/testes** | Times maduros em CI/CD |
| **Git Flow** | Modelo clássico com branches de longa duração e de release | `main`, `develop`, `feature/*`, `release/*`, `hotfix/*` | **Em lotes versionados** | **Alta** | Software versionado/instalável, múltiplas versões em suporte |
| **GitLab Flow** | GitHub Flow + branches por **ambiente** (`staging`, `production`) ou de **release** | `main` + `pre-production`/`production` | Controlada por ambiente | Média | Quando há ambientes que precisam de promoção controlada |

```text
GITHUB FLOW                       GIT FLOW
                                   main      ──●────────────────●── (tags: releases)
 main    ──●────●────●────●──                      ↑ release/1.4  ↑ hotfix/1.4.1
          \   /  \   /                    develop ──●──●──●──●──●──●──
           ●─●    ●─●                            ↑ feature/*  ↑ feature/*
        feature  feature
```

> **Orientação atual:** a maioria das equipes de produtos web se dá melhor com **GitHub Flow** ou **Trunk-Based**:
> menos *branches* longos = menos conflitos e integração contínua de verdade. O Git Flow completo costuma ser
> exagero, exceto quando você mantém **várias versões** em produção.

### Como integrar o PR: estratégias de *merge*

| Estratégia | Resultado na `main` | Prós | Contras |
|------------|---------------------|------|---------|
| **Merge commit** | Mantém todos os commits da branch + 1 commit de merge | Preserva o histórico real; rastreia "quando integrou" | Histórico mais "ramificado" |
| **Squash and merge** | **1 único commit** por PR | `main` limpa; 1 PR = 1 commit = fácil de reverter | Perde o histórico granular da feature; branch parece "não mergeada" |
| **Rebase and merge** | Os commits da branch, **reaplicados linearmente** | Histórico linear **com** commits granulares | Reescreve hashes; exige commits bem escritos |

**Combinação popular:** *squash and merge* com **título do PR no formato Conventional Commits** — gera um
histórico limpo e permite **changelog e versão automáticos**.

### Pull requests de qualidade

| Prática | Por quê |
|---------|---------|
| **PRs pequenos** (idealmente < ~400 linhas, uma ideia) | Revisão mais rápida e profunda; menos conflitos; *revert* simples |
| **Descrição clara**: o quê, por quê, como testar, *screenshots*, *issue* vinculada | Reduz perguntas e retrabalho |
| **Auto-revisão** antes de pedir revisão | Pega erros óbvios |
| **CI verde** antes do pedido de revisão | Respeita o tempo do revisor |
| **PR em rascunho (*draft*)** para feedback precoce | Alinhamento sem a pressão do merge |
| **Revisão de código construtiva** (perguntas, sugestões, foco no código) | Qualidade e cultura de time |

### Proteções de branch (a rede de segurança do time)

Configure na plataforma (GitHub: *Branch protection* / *Rulesets*; GitLab: *Protected branches*):

- **Exigir Pull Request** para integrar na `main` (sem *push* direto).
- **Aprovações obrigatórias** (1–2) e **descartar aprovações antigas** quando houver novos commits.
- **Status checks obrigatórios** (testes, lint, build) e branch **atualizado** com a base.
- **Resolver todas as conversas** antes do merge.
- **Histórico linear** (se usar squash/rebase) e **commits assinados** (se necessário).
- **Bloquear *force push* e deleção** da `main`.
- **`CODEOWNERS`**: revisão obrigatória de quem é dono de cada parte do código.
- **Merge queue** (fila de merge): testa cada PR sobre o estado mais recente da `main`.

### Versionamento e releases automatizados

Com **Conventional Commits**, ferramentas calculam a próxima versão **e** geram o *changelog* a partir do
histórico: **release-please**, **semantic-release**, **changesets**. O fluxo: commits `feat`/`fix` na `main` →
a ferramenta propõe/abre um PR de release → ao mergear, cria a **tag**, o *release notes* e (opcionalmente)
publica o pacote.

## 6.2 Exemplos Práticos

### GitHub Flow, passo a passo

```bash
git switch main && git pull --ff-only
git switch -c feature/482-login-por-username

# ... trabalha, commita em passos pequenos ...
git add -p && git commit -m "feat(auth): aceita username no login"

git fetch origin
git rebase origin/main                         # atualiza a feature (opcional, conforme o time)
git push -u origin feature/482-login-por-username

gh pr create --fill --draft                    # abre o PR (rascunho)
# ... revisão, ajustes, CI verde ...
gh pr ready                                    # sai do rascunho
# Merge (squash) pela interface; depois, limpe localmente:
git switch main && git pull --ff-only
git branch -d feature/482-login-por-username   # (-D se foi squash)
git fetch --prune
```

### Git Flow (manual, sem extensões)

```bash
# Feature
git switch develop && git switch -c feature/login
#   ... commits ...
git switch develop && git merge --no-ff feature/login && git branch -d feature/login

# Release
git switch -c release/1.4.0 develop
#   ... ajustes finais, bump de versão ...
git switch main    && git merge --no-ff release/1.4.0
git tag -a v1.4.0 -m "Release 1.4.0"
git switch develop && git merge --no-ff release/1.4.0
git branch -d release/1.4.0

# Hotfix (produção quebrada)
git switch -c hotfix/1.4.1 main
#   ... correção ...
git switch main    && git merge --no-ff hotfix/1.4.1 && git tag -a v1.4.1 -m "Hotfix 1.4.1"
git switch develop && git merge --no-ff hotfix/1.4.1
git branch -d hotfix/1.4.1

git push origin main develop --follow-tags
```

### Trunk-Based: *feature flags* em vez de branches longos

```ts
// A funcionalidade inacabada é integrada na main, mas fica DESLIGADA em produção
if (flags.isEnabled("novo-checkout", { usuarioId })) {
  return renderNovoCheckout();
}
return renderCheckoutAtual();
```

```bash
# Rotina típica: branch de vida curta (horas), rebase, PR pequeno, merge, deploy
git switch -c fix/arredonda-total && git commit -am "fix: arredonda total em centavos"
git fetch && git rebase origin/main && git push -u origin HEAD
```

### Template de PR

```markdown
<!-- .github/pull_request_template.md -->
## O quê
<!-- Resumo da mudança em 1–3 frases -->

## Por quê
<!-- Problema/necessidade. Link para a issue: Closes #123 -->

## Como testar
1. ...
2. ...

## Checklist
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Sem segredos no diff
- [ ] Mudança incompatível? Descrita com `BREAKING CHANGE:`
```

### `CODEOWNERS`

```text
# .github/CODEOWNERS — o último padrão que casa vence
*                    @org/devs
/apps/api/           @org/backend
/apps/web/           @org/frontend
/infra/              @org/devops
/docs/               @org/tech-writers
*.sql                @org/dba
```

### Lançando uma versão

```bash
git switch main && git pull --ff-only
git tag -a v1.5.0 -m "Release 1.5.0"
git push origin v1.5.0
gh release create v1.5.0 --generate-notes      # cria o release com notas geradas a partir dos PRs/commits
```

### Monorepo: trabalhando só no que importa

```bash
git log --oneline -- apps/api/                 # histórico apenas de uma pasta
git diff --name-only origin/main...HEAD        # quais pastas esta branch tocou (útil para CI seletivo)
git sparse-checkout set --cone apps/api        # materializa só uma parte
```

## 6.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- **Escolha um fluxo, documente-o** (um `CONTRIBUTING.md`) e **automatize a aplicação** (proteções de branch, CI).
- Prefira **branches curtos** e **integração frequente** (conflitos pequenos, feedback rápido).
- Mantenha a **`main` sempre estável/implantável**; quebrou? **Reverta primeiro, investigue depois.**
- Padronize o **título do PR** (Conventional Commits) e use **squash merge** se quiser histórico limpo.
- Use **`CODEOWNERS`**, **templates de PR** e **status checks obrigatórios**.
- Automatize **versão, changelog e tags** (release-please/semantic-release/changesets).
- Em **hotfix**, corrija na `main` (ou no branch de release) e **propague** para os demais (cherry-pick/merge).

**❌ Nunca faça**

- **Push direto na `main`** em projetos com revisão (bloqueie por regra).
- **PRs gigantes** que ninguém consegue revisar de verdade ("LGTM" automático).
- Branches de feature que **vivem meses**: o *merge hell* é certo.
- Adotar **Git Flow completo** por moda, sem versões múltiplas para sustentar.
- **Force-push** em um PR depois da revisão começar sem avisar (os comentários perdem o contexto) — prefira novos
  commits `fixup`/correções e **squash no merge**.
- Deixar a `main` **quebrada** "para arrumar depois".
- Misturar, no mesmo PR, **refatoração grande** e **mudança funcional**.

---

# Módulo 7: Investigação e Recuperação de Desastres

## 7.1 Conceito Teórico

### O histórico é um banco de dados consultável

O Git guarda **quem mudou o quê, quando e por quê**. Dominar as ferramentas de investigação transforma "alguém
quebrou algo" em uma busca de minutos:

| Pergunta | Ferramenta |
|----------|-----------|
| "**Quando** este bug foi introduzido?" | **`git bisect`** (busca binária) |
| "**Quem** escreveu esta linha e por quê?" | **`git blame`** / `git log -L` |
| "**Quando** este texto/função apareceu ou sumiu?" | **`git log -S`** / **`-G`** (*pickaxe*) |
| "Onde, **em todo o código**, aparece X?" | **`git grep`** (também em commits antigos) |
| "O que **eu** fiz, para onde meu `HEAD` foi?" | **`git reflog`** |
| "Como recupero algo que sumiu?" | `reflog` + `git fsck` |

### O *reflog*: seu diário local

O Git registra **cada movimento** de `HEAD` e dos branches (commits, checkouts, resets, rebases, merges...) no
**reflog**. Ele é **local** (não vai para o remoto), e é a principal rede de segurança: mesmo depois de um
`reset --hard`, de apagar um branch ou de um rebase desastroso, **os commits antigos ainda existem** — você só
perdeu a *referência* para eles.

| Característica | Valor padrão |
|----------------|--------------|
| Entradas alcançáveis expiram em | **90 dias** (`gc.reflogExpire`) |
| Entradas de commits inalcançáveis expiram em | **30 dias** (`gc.reflogExpireUnreachable`) |
| Objetos órfãos são apagados pelo `gc` após | ~**2 semanas** (`gc.pruneExpire`) |

> **O que o reflog NÃO salva:** mudanças que **nunca foram commitadas** (descartadas por `restore`, `checkout --`,
> `reset --hard`, `clean`). Esses dados nunca entraram no banco de objetos. (Arquivos que você chegou a
> `git add`ar podem, às vezes, ser achados com `git fsck --lost-found`, como blobs soltos.)

### `git bisect`: achando o commit culpado

Dado um commit **bom** (sem o bug) e um **ruim** (com o bug), o `bisect` faz uma **busca binária** no histórico:
a cada passo ele faz *checkout* do commit do meio e pergunta "está bom ou ruim?". Em um intervalo de 1000
commits, encontra o culpado em **~10 passos**. Com um script de teste, **tudo é automático**.

### `blame`, `log -S` e `log -L`

- **`git blame`** mostra, por linha, o commit e o autor da última alteração. Pegadinha: ele aponta o commit que
  **mexeu por último** (talvez só uma reformatação). Use `-w` (ignora espaços), `-C` (detecta código movido) e
  `--ignore-revs-file` (pula commits de formatação em massa).
- **`git log -S"texto"`** (*pickaxe*) lista commits que **alteraram o número de ocorrências** de uma string — ótimo
  para "quando esta constante/função foi adicionada ou removida?".
- **`git log -L`** mostra o **histórico de um trecho** (linhas ou função) com diffs.

## 7.2 Exemplos Práticos

### Filtros do `git log`

```bash
git log --oneline --author="Ana" --since="2026-01-01" --until="2026-06-30"
git log --oneline --grep="login" -i              # na mensagem (sem diferenciar caixa)
git log -S"MAX_TENTATIVAS" --oneline             # quem adicionou/removeu essa string
git log -G"timeout\s*=\s*\d+" --oneline          # quem alterou linhas que casam com a regex
git log -p -S"senhaPadrao" -- src/                # mostra o diff em que ela mudou
git log --follow -p -- src/auth/login.js         # acompanha o arquivo através de renomeações
git log -L :calcularTotal:src/pedido.js          # histórico de UMA função
git log -L 40,60:src/app.js                      # histórico de um intervalo de linhas
git log --first-parent --oneline main            # só a "linha principal" (ignora commits dentro de merges)
git log --merges --oneline                       # só merges
git log --diff-filter=D --name-only --oneline    # arquivos que foram DELETADOS (e em qual commit)
git shortlog -sn --no-merges                     # ranking de commits por autor
git grep -n "TODO" $(git rev-list --all | head -50)   # busca em commits antigos
```

### `git blame` bem usado

```bash
git blame -L 40,60 src/app.js                    # só as linhas 40–60
git blame -w -C -C src/app.js                    # ignora espaços; detecta código movido/copiado entre arquivos

# Ignorar commits de reformatação em massa:
echo "a1b2c3d4e5f6...  # Aplica Prettier em todo o projeto" >> .git-blame-ignore-revs
git config blame.ignoreRevsFile .git-blame-ignore-revs     # (o GitHub também respeita esse arquivo)
```

### `git bisect` manual

```bash
git bisect start
git bisect bad                         # o commit ATUAL tem o bug
git bisect good v1.2.0                 # esta versão funcionava
# O Git faz checkout de um commit do meio. Rode a aplicação/testes e responda:
git bisect good                        # (ou)  git bisect bad   (ou)  git bisect skip
# ...repete até: "<hash> is the first bad commit"
git bisect log                         # relatório do processo
git bisect reset                       # volta ao branch em que você estava
```

### `git bisect run` — automático (executado)

```bash
git bisect start HEAD HEAD~5                       # ruim = HEAD; bom = HEAD~5
git bisect run sh -c '! test -f bug.txt'           # código 0 = bom; 1–127 (exceto 125) = ruim; 125 = pular
```

```text
...
<hash> is the first bad commit
commit <hash>
Author: Ana <ana@ex.com>

    commit 4
...
bisect found first bad commit
```

```bash
git bisect reset
# Caso real:   git bisect run npm test      (ou um script que roda o teste que reproduz o bug)
```

### Recuperando com o `reflog` (executado)

Você apagou um branch com trabalho não mergeado:

```bash
git branch -D temp
```

```text
Deleted branch temp (was 54e25f0).      ← o próprio Git já mostra o hash!
```

```bash
git reflog -n 4
```

```text
c75d5eb HEAD@{0}: checkout: moving from temp to main
54e25f0 HEAD@{1}: commit: feat: trabalho em temp
c75d5eb HEAD@{2}: checkout: moving from main to temp
c75d5eb HEAD@{3}: commit (merge): merge: resolve conflito da linha 2
```

```bash
git branch recuperada 54e25f0           # recria um branch apontando para o commit "perdido"
git log --oneline -1 recuperada
# 54e25f0 feat: trabalho em temp
```

### O que fazer quando algo dá errado ("Oops!")

| Situação | Solução |
|----------|---------|
| Errei a **mensagem** do último commit (não publicado) | `git commit --amend -m "mensagem certa"` |
| Esqueci um arquivo no **último commit** (não publicado) | `git add arq && git commit --amend --no-edit` |
| Quero **desfazer o último commit mantendo as mudanças** | `git reset --soft HEAD~1` (continuam *staged*) ou `git reset HEAD~1` (*unstaged*) |
| Quero **jogar fora** o último commit e as mudanças | `git reset --hard HEAD~1` (⚠) |
| Commit **já publicado** com problema | `git revert <hash>` e `git push` |
| Commitei na **branch errada** (ex.: na `main`) | `git switch -c feature/certa` (leva o commit) → `git switch main` → `git reset --hard origin/main` |
| **Apaguei um branch** | `git reflog` → achar o hash → `git branch <nome> <hash>` |
| Fiz **`reset --hard` e perdi commits** | `git reflog` → `git reset --hard HEAD@{1}` (ou o hash anterior) |
| **Merge errado**, ainda não publicado | `git reset --hard ORIG_HEAD` (se o merge está em andamento: `git merge --abort`) |
| **Rebase deu errado** | Em andamento: `git rebase --abort`. Já concluído: `git reset --hard ORIG_HEAD` ou pelo `reflog` |
| **HEAD destacado** com commits novos que quero manter | `git switch -c salvar-trabalho` (antes de trocar de lugar) |
| **Apaguei um arquivo** e quero de volta | `git restore --source=HEAD -- arq` (ou `--source=<commit>`) |
| **Descartar edições** de um arquivo | `git restore arq` (⚠ sem volta) |
| Fiz **`git add` errado** | `git restore --staged arq` |
| Quero **remover arquivos não rastreados** | `git clean -n` (simula) → `git clean -fd` |
| **Dropei um stash** sem querer | `git fsck --no-reflog \| awk '/dangling commit/ {print $3}'` → `git show <hash>` → `git stash apply <hash>` |
| Autor/e-mail **errado** no último commit | `git commit --amend --reset-author` (após corrigir `user.name`/`user.email`) |
| **Push rejeitado** (non-fast-forward) | `git fetch` → `git rebase origin/<branch>` (ou `merge`) → `git push` |

### Recuperando objetos "soltos" com `fsck`

```bash
git fsck --lost-found                      # lista objetos inalcançáveis (commits/blobs "dangling")
git fsck --no-reflog | grep "dangling commit"
git show <hash>                            # inspeciona
git branch rescue <hash>                   # salva em um branch
```

### Vazou um segredo? Siga esta ordem

1. **REVOGUE/ROTACIONE O SEGREDO IMEDIATAMENTE** (token, senha, chave). Considere-o **comprometido**: mesmo que
   você reescreva o histórico, cópias, *forks*, caches e *clones* podem tê-lo.
2. Avalie o **impacto** (logs de uso do segredo).
3. Só então, **remova do histórico** (opcional, mas recomendado) com **`git filter-repo`** (ferramenta oficial
   recomendada, **instalada à parte**; evite o antigo `filter-branch`):

```bash
pip install git-filter-repo                          # ou pelo gerenciador de pacotes do seu SO
git clone --mirror git@github.com:org/repo.git && cd repo.git

git filter-repo --invert-paths --path config/secrets.env      # remove o ARQUIVO de TODO o histórico
# ou, para trocar um TEXTO específico em qualquer arquivo:
printf 'AKIAXXXXXXXXXXXX==>***REMOVIDO***\n' > expressoes.txt
git filter-repo --replace-text expressoes.txt

git remote add origin git@github.com:org/repo.git    # o filter-repo remove o remoto por segurança
git push --force --mirror                            # ⚠ reescreve TUDO: avise o time; todos precisam reclonar
```

4. **Previna** (Módulo 8): `.gitignore`, *pre-commit* com **gitleaks**, *push protection* da plataforma.

> Plataformas como o GitHub podem manter **referências antigas de PRs** e *caches*. Se o segredo era crítico,
> trate-o como vazado de qualquer forma e, se necessário, peça à plataforma para **purgar** os objetos em cache.

### Manutenção básica do repositório

```bash
git gc                         # compacta objetos e limpa lixo (o Git já faz isso automaticamente de tempos em tempos)
git count-objects -vH          # tamanho e quantidade de objetos
git fsck                       # verifica a integridade do banco de objetos
```

## 7.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- **Entre em pânico depois**: quase tudo que foi **commitado** é recuperável via `reflog`. Primeiro,
  **pare** e rode `git reflog`.
- **Commite cedo e com frequência** (mesmo que "sujo", localmente): commits são recuperáveis; edições soltas, não.
- Use **`git bisect run`** com um teste automatizado para bugs de regressão.
- Escreva **mensagens e commits atômicos**: eles tornam `blame`, `bisect` e `revert` eficazes.
- Mantenha um **`.git-blame-ignore-revs`** para commits de formatação em massa.
- Para segredos vazados: **rotacione primeiro**, limpe o histórico depois.
- Crie um **branch de backup** antes de operações destrutivas.

**❌ Nunca faça**

- **`git reset --hard`/`git clean -fd`/`git restore .`** sem ter certeza do que há não commitado.
- Tentar "consertar" um repositório **apagando a pasta `.git`** ou re-clonando **sem** antes salvar o trabalho
  local (commits locais não publicados só existem ali).
- **Apenas apagar o arquivo com segredo em um novo commit** — ele continua no histórico.
- Reescrever histórico para esconder um segredo **sem rotacioná-lo**.
- Confiar no *reflog* como backup de longo prazo (expira) ou em outra máquina (é **local**).
- Interpretar `git blame` como "quem é o culpado": ele mostra quem **tocou por último**, não quem errou.

---

# Módulo 8: Automação, Hooks, Segurança e Performance

## 8.1 Conceito Teórico

### *Hooks*: scripts que o Git dispara

*Hooks* são executáveis na pasta `.git/hooks/` que o Git roda em **momentos específicos**. Se um *hook* "de
bloqueio" sair com **código ≠ 0**, a operação é **cancelada**.

| Hook | Quando roda | Uso comum |
|------|-------------|-----------|
| `pre-commit` | Antes de criar o commit | Lint, formatação, testes rápidos, bloquear segredos/arquivos grandes |
| `prepare-commit-msg` | Antes do editor da mensagem abrir | Preencher a mensagem (ex.: ID da *issue* pelo nome do branch) |
| `commit-msg` | Depois de escrita a mensagem | **Validar Conventional Commits** |
| `post-commit` | Depois do commit | Notificações |
| `pre-push` | Antes do `push` | Rodar testes mais longos, impedir push em `main` |
| `pre-rebase`, `post-merge`, `post-checkout` | Em torno dessas operações | Reinstalar dependências quando `package-lock.json` mudou |
| **Server-side:** `pre-receive`, `update`, `post-receive` | No servidor | Políticas centrais, disparar *deploys* (a plataforma costuma substituir por *rulesets*/CI) |

**Limitações importantes:**

1. A pasta `.git/hooks` **não é versionada** — cada dev teria que instalar manualmente. Soluções: apontar
   `core.hooksPath` para uma pasta **versionada** ou usar um **gerenciador de hooks**.
2. *Hooks* locais podem ser **burlados** (`git commit --no-verify`). Portanto, **a CI deve repetir** as mesmas
   verificações — o *hook* é conveniência (feedback rápido), **não** a barreira de segurança.

| Gerenciador | Perfil |
|-------------|--------|
| **Husky** | Padrão no ecossistema Node/JS (configurado via `package.json`) |
| **lefthook** | Binário único (Go), **rápido**, YAML, executa em paralelo; multilinguagem |
| **pre-commit** (framework) | Python; enorme catálogo de *hooks* prontos; multilinguagem |
| **simple-git-hooks** | Minimalista, JS |

### Segurança no fluxo Git

| Camada | Medidas |
|--------|---------|
| **Identidade/autoria** | Autenticação por **SSH/2FA**, commits e tags **assinados** |
| **Segredos** | `.gitignore`, **scanners** (gitleaks, trufflehog) em *pre-commit* **e** CI; **push protection** da plataforma; `.env.example` |
| **Controle de acesso** | Proteção de branches, **CODEOWNERS**, menor privilégio, tokens de **escopo mínimo** e com validade |
| **Cadeia de suprimentos** | Revisar mudanças em lockfiles e workflows; **fixar *actions* de terceiros pelo SHA do commit**; Dependabot/Renovate |
| **Integridade dos dados** | `transfer.fsckObjects true` valida objetos recebidos |
| **Máquina local** | `safe.directory` (proteção contra repositórios de outros donos); cuidado ao abrir repositórios não confiáveis (hooks/config podem executar código) |

### Git LFS

O **Git LFS** (*Large File Storage*) substitui arquivos grandes por **ponteiros** de texto no repositório e guarda
o conteúdo real em um armazenamento à parte, evitando que clones fiquem gigantes. Marque os padrões de arquivo em
`.gitattributes` (feito por `git lfs track`).

### *Worktrees*: vários branches abertos ao mesmo tempo

`git worktree` cria **diretórios de trabalho adicionais** ligados ao **mesmo repositório** (compartilham o banco de
objetos). Perfeito para atender um *hotfix* sem mexer no seu trabalho em andamento — sem `stash` nem clone extra.

### Performance em repositórios grandes

| Recurso | Para quê |
|---------|----------|
| `git maintenance` | Tarefas em segundo plano: *prefetch*, *commit-graph*, repack incremental |
| `core.fsmonitor` + `core.untrackedCache` | `git status` rápido em árvores enormes (o suporte do *daemon* embutido varia por sistema operacional) |
| `feature.manyFiles` | Ajustes de índice para repositórios com muitos arquivos |
| **Clone parcial / sparse checkout** | Baixar e materializar só o necessário (Módulo 5) |
| `git gc` / `git repack` | Compactação do banco de objetos |

## 8.2 Exemplos Práticos

### Hooks versionados com `core.hooksPath`

```bash
mkdir .githooks
git config core.hooksPath .githooks          # (cada dev precisa rodar isto UMA vez; automatize no setup do projeto)
```

**`.githooks/pre-commit`** — bloqueia `.env` e marcadores de conflito:

```bash
#!/usr/bin/env bash
set -euo pipefail

# 1) Não deixa commitar arquivos .env (exceto .env.example)
if git diff --cached --name-only | grep -E '(^|/)\.env($|\.)' | grep -vE '\.example$'; then
  echo "✖ Bloqueado: arquivo .env no commit (veja acima)." >&2
  exit 1
fi

# 2) Não deixa passar espaços em branco quebrados nem marcadores de conflito
git diff --cached --check || { echo "✖ git diff --check encontrou problemas." >&2; exit 1; }
```

**`.githooks/commit-msg`** — exige Conventional Commits:

```bash
#!/usr/bin/env bash
arquivo_msg="$1"
primeira_linha="$(head -n1 "$arquivo_msg")"
padrao='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9._-]+\))?(!)?: .{1,72}$'

# permite merges, reverts automáticos e fixups/squashes do rebase
if [[ "$primeira_linha" =~ ^(Merge|Revert|fixup!|squash!) ]]; then exit 0; fi

if ! [[ "$primeira_linha" =~ $padrao ]]; then
  echo "✖ Mensagem fora do padrão Conventional Commits." >&2
  echo "  Exemplo: feat(auth): permite login por username" >&2
  exit 1
fi
```

```bash
chmod +x .githooks/*                        # os hooks precisam ser executáveis
```

### Husky + lint-staged + commitlint (ecossistema Node)

```bash
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init                              # cria .husky/ e o script "prepare": "husky" no package.json
```

```bash
# .husky/pre-commit
npx lint-staged
```

```bash
# .husky/commit-msg
npx --no -- commitlint --edit "$1"
```

```json
// package.json
{
  "scripts": { "prepare": "husky" },
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}
```

```js
// commitlint.config.js
export default { extends: ["@commitlint/config-conventional"] };
```

### `lefthook` (alternativa rápida e multilinguagem)

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{js,ts,tsx}"
      run: npx eslint {staged_files}
    formato:
      glob: "*.{js,ts,tsx,json,md}"
      run: npx prettier --check {staged_files}
    segredos:
      run: gitleaks protect --staged --redact

commit-msg:
  commands:
    commitlint:
      run: npx --no -- commitlint --edit {1}

pre-push:
  commands:
    testes:
      run: npm test
```

```bash
lefthook install
```

### Verificações na CI (GitHub Actions)

```yaml
# .github/workflows/qualidade.yml
name: qualidade
on:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  mensagens-de-commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5          # use a versão atual e, de preferência, fixe pelo SHA do commit
        with:
          fetch-depth: 0                   # ferramentas que leem o histórico precisam do clone COMPLETO
      - uses: wagoid/commitlint-github-action@v6

  segredos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

> `fetch-depth: 0` baixa **todo** o histórico (necessário para `commitlint`, `gitleaks`, `git describe`,
> *changelogs*). Para builds comuns, o clone raso padrão é mais rápido.

### Git LFS

```bash
git lfs install                           # uma vez por máquina
git lfs track "*.psd" "*.mp4" "models/*.bin"
git add .gitattributes                    # o "track" escreve as regras aqui: versione!
git add design/logo.psd && git commit -m "chore: adiciona arte em LFS"

git lfs ls-files                          # o que está no LFS
git lfs migrate import --include="*.psd"  # converte arquivos JÁ commitados (reescreve histórico!)
```

### Worktrees (executado)

```bash
git worktree add ../app-hotfix -b hotfix/x origin/main      # novo diretório + novo branch
git worktree list
```

```text
/tmp/gitlab/bis     650fb68 (detached HEAD)
/tmp/gitlab/bis-wt  401809d [hotfix/x]
```

```bash
cd ../app-hotfix && # ... corrige, commita, publica ...
cd ../app && git worktree remove ../app-hotfix              # remove o diretório extra
git worktree prune                                          # limpa registros órfãos
```

### Aliases que valem a pena

```ini
# ~/.gitconfig
[alias]
    st   = status -sb
    lg   = log --oneline --graph --decorate --all
    last = log -1 HEAD --stat
    br   = branch -vv
    unstage = restore --staged
    amend   = commit --amend --no-edit
    undo    = reset --soft HEAD~1
    fixup   = commit --fixup
    pushf   = push --force-with-lease --force-if-includes
    sync    = !git fetch --prune && git rebase origin/main
    cleanup = !git branch --merged main | grep -vE '^\\*|main|develop' | xargs -r git branch -d
```

### Performance e manutenção

```bash
git maintenance start                         # agenda tarefas de manutenção em segundo plano para este repo
git maintenance run                           # roda agora

git config core.untrackedCache true
git config core.fsmonitor true                # acelera `git status` (conforme suporte da plataforma)
git config feature.manyFiles true             # repositórios com muitos arquivos

git count-objects -vH                         # diagnóstico de tamanho
```

### Outros utilitários

```bash
git bundle create repo.bundle --all           # empacota o repositório num único arquivo (transferência offline)
git clone repo.bundle meu-repo

git archive --format=zip HEAD -o release.zip  # exporta o snapshot SEM a pasta .git
git config --global --add safe.directory /caminho/do/repo   # resolve "detected dubious ownership"
```

## 8.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- Use **hooks para feedback rápido** (lint, formato, segredos, mensagem) **e repita tudo na CI** (que é a
  barreira real).
- **Versione os hooks** (`core.hooksPath` ou Husky/lefthook/pre-commit) e automatize a instalação no *setup* do projeto.
- Rode **scanner de segredos** em *pre-commit* **e** na CI; ative **push protection** na plataforma.
- **Fixe *actions*/dependências de CI por SHA**, restrinja `permissions` do workflow ao mínimo.
- Use **LFS** para binários grandes **antes** de commitá-los (migrar depois reescreve o histórico).
- Use **`git worktree`** em vez de `stash` + troca de branch para interrupções longas.
- Em monorepos grandes: **clone parcial + sparse checkout + `git maintenance`**.

**❌ Nunca faça**

- Confiar **só** em hooks locais: `--no-verify` os ignora.
- Colocar **testes demorados** no `pre-commit` (os devs vão desativá-lo); deixe-os para `pre-push`/CI.
- Fazer `pre-commit` que **reescreve** arquivos sem avisar e depois **não os re-adiciona** ao stage (use
  `lint-staged`, que cuida disso).
- Commitar **binários grandes** sem LFS; commitar **dumps de banco**, vídeos, `.zip` de build.
- Usar **tokens de longa duração e amplos** na CI; usar *actions* de terceiros por tag mutável (`@main`/`@v1`)
  em pipelines críticos.
- Abrir **repositórios de origem desconhecida** com *hooks* e configurações ativas sem inspecioná-los.
- Rodar `git gc --aggressive` rotineiramente (raramente compensa).

---

# Apêndice A: "Quero fazer X" — tabela de receitas

| Quero... | Comando |
|----------|---------|
| Ver o estado atual | `git status -sb` |
| Ver o que mudou (não staged / staged) | `git diff` / `git diff --staged` |
| Preparar tudo / só trechos | `git add -A` / `git add -p` |
| Commitar | `git commit -m "tipo: resumo"` |
| Corrigir o último commit | `git commit --amend` |
| Ver o histórico bonito | `git log --oneline --graph --decorate --all` |
| Criar e trocar de branch | `git switch -c nome` |
| Voltar ao branch anterior | `git switch -` |
| Juntar um branch no atual | `git merge nome` |
| Cancelar um merge em andamento | `git merge --abort` |
| Atualizar minha feature com a main | `git fetch && git rebase origin/main` |
| Juntar/reordenar/editar commits locais | `git rebase -i HEAD~N` |
| Desfazer o último commit mantendo mudanças | `git reset --soft HEAD~1` |
| Desfazer um commit já publicado | `git revert <hash>` |
| Descartar edições de um arquivo | `git restore arq` |
| Tirar um arquivo do staging | `git restore --staged arq` |
| Guardar trabalho temporariamente | `git stash push -u -m "msg"` |
| Reaplicar o stash | `git stash pop` |
| Copiar um commit para o branch atual | `git cherry-pick <hash>` |
| Baixar novidades sem alterar nada | `git fetch --prune` |
| Atualizar sem criar merge acidental | `git pull --ff-only` |
| Publicar um branch novo | `git push -u origin nome` |
| Publicar após reescrever (com segurança) | `git push --force-with-lease --force-if-includes` |
| Apagar branch local / remoto | `git branch -d nome` / `git push origin --delete nome` |
| Criar uma tag de release | `git tag -a v1.0.0 -m "..." && git push origin v1.0.0` |
| Descobrir quem mudou uma linha | `git blame -L 10,20 arq` |
| Achar quando uma string apareceu | `git log -S"texto" --oneline` |
| Achar o commit que quebrou algo | `git bisect start` / `git bisect run <teste>` |
| Recuperar algo "perdido" | `git reflog` |
| Trabalhar em dois branches ao mesmo tempo | `git worktree add ../pasta -b nome` |
| Ver diferença entre branches | `git diff main...feature` |
| Parar de rastrear arquivo (manter no disco) | `git rm --cached arq` |
| Limpar não rastreados (simular antes) | `git clean -n` → `git clean -fd` |
| Ver configuração e sua origem | `git config --list --show-origin` |

---

# Apêndice B: `~/.gitconfig` recomendado

```ini
[user]
    name  = Seu Nome
    email = voce@exemplo.com
    signingkey = ~/.ssh/id_ed25519.pub

[init]
    defaultBranch = main

[core]
    editor = code --wait
    excludesFile = ~/.gitignore_global
    untrackedCache = true

[commit]
    verbose = true
    gpgsign = true
    # template = ~/.gitmessage

[tag]
    gpgsign = true
    sort = version:refname

[gpg]
    format = ssh

[pull]
    rebase = true          # alternativa mais conservadora: ff = only

[fetch]
    prune = true

[push]
    default = simple
    autoSetupRemote = true
    followTags = true

[merge]
    conflictStyle = zdiff3

[rebase]
    autoSquash = true
    autoStash = true
    updateRefs = true

[rerere]
    enabled = true

[diff]
    algorithm = histogram
    colorMoved = default

[branch]
    sort = -committerdate

[column]
    ui = auto

[transfer]
    fsckObjects = true

[alias]
    st = status -sb
    lg = log --oneline --graph --decorate --all
    amend = commit --amend --no-edit
    pushf = push --force-with-lease --force-if-includes
```

> Revise cada opção antes de adotar. Por exemplo, `commit.gpgsign = true` exige uma chave de assinatura
> configurada, e `pull.rebase = true` pressupõe que você entende o rebase (Módulo 4).

---

# Apêndice C: Git 3.0, SHA-256 e reftable

O projeto Git planeja uma **versão 3.0** que muda *defaults* de **repositórios novos** (sem data firme até o
fechamento deste guia):

| Mudança | Antes | Git 3.0 (novos repositórios) |
|---------|-------|-------------------------------|
| **Função de hash** | SHA-1 | **SHA-256** |
| **Armazenamento de referências** | "files" (um arquivo por ref) | **reftable** (formato binário, mais rápido e consistente) |
| **Branch inicial** | `master` (se `init.defaultBranch` não estiver configurado) | **`main`** |
| **Build** | C | **Rust** passa a ser dependência obrigatória de compilação |

**O que isso significa para você:**

- **Repositórios existentes continuam funcionando** (SHA-1/`files`).
- Um repositório **SHA-1** e um **SHA-256** **não interoperam** entre si e **não há conversão "no lugar"**.
- O principal gargalo é a **hospedagem**: confirme se o seu provedor (GitHub, GitLab, Bitbucket...) **aceita
  repositórios SHA-256** antes de adotá-lo em projetos reais.
- Scripts/ferramentas que assumem **hashes de 40 caracteres** precisarão aceitar 64.

**Experimentando hoje (em repositórios de teste):**

```bash
git init -b main --object-format=sha256 --ref-format=reftable teste-git3
cd teste-git3
git rev-parse --show-object-format        # sha256

# Tornar padrão na sua máquina (opcional, para testes):
git config --global init.defaultObjectFormat sha256
git config --global init.defaultRefFormat reftable
```

> Para os detalhes e o estado atual, consulte a página oficial **BreakingChanges** da documentação do Git
> ([git-scm.com/docs/BreakingChanges](https://git-scm.com/docs/BreakingChanges)).

---

# Apêndice D: Erros comuns e referências

## Erros comuns e o que fazer

| Mensagem | Causa | Solução |
|----------|-------|---------|
| `fatal: not a git repository` | Você não está dentro de um repositório | `cd` para a pasta certa ou `git init` |
| `error: failed to push some refs` / `non-fast-forward` | O remoto tem commits que você não tem | `git fetch` → `git rebase origin/<branch>` (ou `merge`) → `git push` |
| `Your local changes would be overwritten by ...` | Há mudanças não commitadas em conflito com a operação | Commite, ou `git stash push -u`, ou `git restore` |
| `CONFLICT (content): Merge conflict in X` | Mesmo trecho alterado nos dois lados | Edite, `git add`, `git commit` / `--continue` (Módulo 3) |
| `fatal: refusing to merge unrelated histories` | Históricos sem ancestral comum | `git merge --allow-unrelated-histories` (só se for intencional) |
| `You are in 'detached HEAD' state` | Checkout de commit/tag | `git switch -c novo` para manter o trabalho; ou `git switch main` |
| `Permission denied (publickey)` | Chave SSH não cadastrada/carregada | `ssh-add`, conferir a chave no GitHub, `ssh -T git@github.com` |
| `remote: Support for password authentication was removed` | HTTPS com senha não é mais aceito | Use **PAT** ou SSH, ou `gh auth login` |
| `fatal: detected dubious ownership in repository` | Repositório pertence a outro usuário | `git config --global --add safe.directory <caminho>` (se confiar) |
| `LF will be replaced by CRLF` (aviso) | Conversão de fim de linha | Padronize com `.gitattributes` (`* text=auto eol=lf`) |
| `remote: error: File X is 100.00 MB; this exceeds ... limit` | Arquivo grande demais para o provedor | Use **Git LFS**; remova o arquivo do histórico se já foi commitado |
| `error: pathspec 'x' did not match any file(s)` | Branch/arquivo não existe localmente | `git fetch` e confira o nome (`git branch -a`) |
| `fatal: The current branch X has no upstream branch` | Branch nunca foi publicado | `git push -u origin X` (ou `push.autoSetupRemote true`) |
| `Updates were rejected because the tip of your current branch is behind` | Mesmo caso do *non-fast-forward* | Integre o remoto antes do push |
| `.gitignore` não funciona para um arquivo | O arquivo **já era rastreado** | `git rm --cached <arq>` e commite |

## Referências

- **Pro Git** (livro oficial e gratuito, inclusive em português): [git-scm.com/book](https://git-scm.com/book)
- **Documentação de referência**: [git-scm.com/docs](https://git-scm.com/docs)
- **Visualização interativa de branches**: [learngitbranching.js.org](https://learngitbranching.js.org/)
- **Oh My Git!** (jogo para aprender Git): [ohmygit.org](https://ohmygit.org/)
- **Conventional Commits**: [conventionalcommits.org](https://www.conventionalcommits.org/)
- **Versionamento Semântico**: [semver.org](https://semver.org/)
- **git-filter-repo**: [github.com/newren/git-filter-repo](https://github.com/newren/git-filter-repo)
- **GitHub Docs** (PRs, proteção de branches, rulesets): [docs.github.com](https://docs.github.com/)

## Próximos passos de estudo

1. Pratique em um **repositório de teste**: provoque conflitos, faça rebases interativos, apague branches e
   recupere-os pelo `reflog`.
2. Configure **hooks** (Husky/lefthook) e **CI** no seu projeto pessoal.
3. Adote **Conventional Commits** e automatize *releases* com release-please/semantic-release.
4. Leia o capítulo **Git Internals** do Pro Git para solidificar o modelo de objetos.
