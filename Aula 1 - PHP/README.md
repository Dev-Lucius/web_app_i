# Purchases — CRUD em PHP (aula de Desenvolvimento Web)

Este repositório reúne três entregas a partir do trabalho original (`trab2-master`):

| Arquivo/pasta        | O que é                                                            |
|-----------------------|---------------------------------------------------------------------|
| `main.php`             | "Cola" comentada com um resumo completo da linguagem PHP           |
| `crud-refatorado/`     | O mesmo sistema de pedidos, reorganizado e com falhas corrigidas   |
| `README.md` (este)     | Documentação de tudo que foi abordado                              |

---

## 1. O que o sistema original fazia

Um cadastro de clientes com login, onde cada cliente pode **criar, listar,
editar e excluir** os próprios "pedidos" (descrição + valor), e um usuário
especial (`admin`) que enxerga todos os clientes e seus pedidos.

Ou seja: é um **CRUD** completo —

- **C**reate — `insert_order.php`
- **R**ead — `home.php` / `admin.php`
- **U**pdate — `update_order.php`
- **D**elete — trecho dentro do próprio `home.php`

com autenticação (`login.php`, `customersession.php`), cadastro
(`register.html`, `insert_data.php`) e sessão (`logout.php`).

---

## 2. Conceitos de PHP abordados nesta aula

Todos estes tópicos aparecem comentados, com exemplos, em **`main.php`**.
Aqui vai um resumo de cada um e **onde** ele aparece no sistema:

| Conceito | Onde aparece no projeto |
|---|---|
| Mistura de PHP com HTML (`<?php ... ?>` dentro do HTML) | Em todas as páginas de visualização |
| Superglobais `$_GET`, `$_POST`, `$_SESSION`, `$_SERVER` | Formulários de login/cadastro/pedido, mensagens via `?msg=` |
| Sessões (`session_start`, `$_SESSION`, `session_destroy`) | Login, controle de acesso, logout |
| Formulários HTML + `method="post"` | Login, cadastro, criar/editar pedido, excluir |
| `isset()` / `empty()` | Validação de campos antes de gravar no banco |
| Conexão com banco de dados (`mysqli` → `PDO`) | `customersession.php`, `insert_order.php`, `update_order.php`, `admin.php` |
| Consultas SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) | Em praticamente todo arquivo `.php` do projeto |
| `header('Location: ...')` para redirecionar | Fim de quase todo processamento de formulário |
| Hash de senha (`md5` → `password_hash`/`password_verify`) | Cadastro e login |
| `include`/`require` para reaproveitar HTML | Ausente no original; adicionado na refatoração |
| Relacionamento entre tabelas (chave estrangeira `customer_id`) | `orders` → `customers`, em `PurchasesDB.sql` |

---

## 3. Estrutura de arquivos

### 3.1 Projeto original (`trab2-master`)

```
trab2-master/
├── index.php            → redireciona para login.php
├── login.php             → formulário de login (HTML + PHP misturados)
├── customersession.php   → processa o login (mysqli + query concatenada)
├── register.html          → formulário de cadastro (HTML puro)
├── insert_data.php        → processa o cadastro (senha em md5)
├── home.php               → lista + EXCLUI pedidos do cliente (tudo junto)
├── insert_order.php       → formulário + processamento de novo pedido
├── update_order.php       → formulário + processamento de edição de pedido
├── admin.php               → lista clientes e pedidos (somente leitura)
├── logout.php              → encerra a sessão
└── PurchasesDB.sql          → schema do banco (2 tabelas)
```

**Problemas identificados nesse formato** (a razão de existir a refatoração):

1. **HTML, SQL e regra de negócio misturados no mesmo arquivo.** Cada página
   repete `<head>`, `<nav>` e os scripts do Bootstrap inteiros.
2. **SQL Injection.** As queries eram montadas concatenando texto:
   `"SELECT * FROM customers WHERE email='$email'"`. Um valor malicioso no
   campo de e-mail pode alterar o significado da consulta.
3. **Senha em MD5.** Rápido de quebrar com as ferramentas atuais.
4. **Sem checagem de dono do recurso.** `update_order.php` buscava o
   pedido só pelo `id` — nada impedia um cliente de editar/ver o pedido de
   outro cliente trocando o número na requisição.
5. **Conexão com banco repetida** em quase todo arquivo, com usuário/senha
   escritos várias vezes.
6. **Sem `htmlspecialchars()`** ao exibir dados vindos do banco — abre
   espaço para XSS se um usuário cadastrar um pedido com HTML/JS na
   descrição.

### 3.2 Projeto refatorado (`crud-refatorado/`)

```
crud-refatorado/
├── config.php                 → configurações centrais (host, usuário, senha do banco)
├── index.php                   → redireciona para login.php
├── login.php                    → SÓ exibe o formulário de login
├── login_processar.php          → SÓ processa o login
├── register.php                  → SÓ exibe o formulário de cadastro
├── register_processar.php        → SÓ processa o cadastro
├── logout.php                     → encerra a sessão
├── home.php                        → SÓ lista os pedidos do cliente (leitura)
├── order_form.php                  → formulário único (criar OU editar pedido)
├── order_salvar.php                 → decide entre INSERT ou UPDATE
├── order_excluir.php                 → SÓ exclui um pedido
├── admin.php                          → painel do administrador
├── includes/
│   ├── db.php                          → conexão única com PDO
│   ├── funcoes.php                      → funções auxiliares (sessão, escape, redirecionamento)
│   ├── header.php                        → <head> + navbar compartilhados
│   └── footer.php                         → scripts finais compartilhados
├── css/
│   └── estilo.css                          → identidade visual própria (ver seção 6)
└── sql/
    └── schema.sql                           → schema atualizado
```

**Ideia geral da reorganização: separar por responsabilidade.**
Cada arquivo faz **uma coisa só**, e o nome do arquivo já diz o quê:

- Arquivos **sem** "processar"/"salvar"/"excluir" no nome só **mostram** HTML.
- Arquivos **com** esses sufixos só **processam dados** (leem `$_POST`,
  falam com o banco, redirecionam) — não têm HTML nenhum.
- `includes/` guarda tudo que é **repetido** em várias páginas.

Essa separação também facilita estudar o código: se você quer entender
"como funciona o login", vai direto em `login.php` (a tela) e
`login_processar.php` (a lógica) — sem precisar vasculhar um arquivo de
150 linhas misturando as duas coisas.

---

## 4. Como executar o projeto refatorado

### 4.1 Pré-requisitos

- PHP 8.x com a extensão `pdo_mysql` habilitada
- MySQL ou MariaDB
- (Opcional) um servidor como Apache/XAMPP/Laragon — ou apenas o servidor
  embutido do PHP, que já é suficiente para desenvolvimento

### 4.2 Passo a passo

1. **Crie o banco de dados** e importe o schema:
   ```sql
   CREATE DATABASE PurchasesDB;
   ```
   ```bash
   mysql -u root PurchasesDB < crud-refatorado/sql/schema.sql
   ```

2. **Confira as credenciais** em `crud-refatorado/config.php` (por padrão,
   usuário `root` e senha em branco — o mesmo padrão do projeto original,
   ajuste conforme o seu ambiente):
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'PurchasesDB');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   ```

3. **Suba o servidor** (a partir da pasta `crud-refatorado/`):
   ```bash
   php -S localhost:8000
   ```

4. **Acesse** `http://localhost:8000` no navegador. Você será redirecionado
   para a tela de login.

5. **Crie uma conta** pelo link "Criar conta". Para ter acesso ao painel
   de administrador, cadastre um usuário com o **nome exatamente `admin`**
   (é assim que o sistema reconhece o administrador — veja a seção 7,
   "Possíveis melhorias", sobre por que isso não é o ideal).

> Este fluxo foi testado de ponta a ponta (cadastro, login, criar/editar/
> excluir pedido, isolamento entre clientes diferentes e acesso ao painel
> admin) durante o desenvolvimento desta refatoração.

---

## 5. Fluxo geral da aplicação

```
                       ┌──────────────┐
                       │  index.php    │
                       └──────┬───────┘
                              │ redireciona
                              ▼
                       ┌──────────────┐        cadastro       ┌────────────────┐
                       │  login.php    │◄───────────────────►│  register.php    │
                       └──────┬───────┘                       └────────┬────────┘
                              │ POST                                     │ POST
                              ▼                                          ▼
                   ┌────────────────────┐                     ┌───────────────────────┐
                   │ login_processar.php │                    │ register_processar.php │
                   └─────────┬──────────┘                     └───────────┬───────────┘
                              │ cria sessão                                │ grava no banco
                              ▼                                            ▼
              ┌───────────────────────────┐                        volta para login.php
              │  nome == 'admin' ?          │
              └──────────┬────────┬────────┘
                    não   │        │  sim
                          ▼        ▼
                  ┌─────────────┐ ┌────────────┐
                  │  home.php    │ │ admin.php   │
                  └──────┬──────┘ └────────────┘
                         │
             ┌───────────┼────────────┐
             ▼           ▼            ▼
     order_form.php  order_salvar.php  order_excluir.php
     (criar/editar)   (INSERT/UPDATE)   (DELETE)
```

---

## 6. Guia de CSS: como foi pensado

O enunciado pedia um CSS "se necessário" e um guia de como ele foi feito.
A decisão foi: **manter o Bootstrap** (via CDN, como no original) para
resolver o trabalho pesado de layout — grid responsivo, estilo de botões,
formulários e tabelas — e criar **um arquivo próprio, `css/estilo.css`**,
carregado *depois* do Bootstrap, para cobrir só o que falta:

1. **Variáveis de cor no `:root`** (`--cor-primaria`, `--cor-fundo`), para
   não espalhar códigos hexadecimais soltos pelo arquivo — trocar a cor
   do sistema inteiro vira uma alteração em um único lugar.
2. **Identidade visual da navbar** — o Bootstrap já dá a estrutura
   (`navbar`, `navbar-expand-lg`...), nós só definimos a cor de fundo.
3. **Respiro no conteúdo** (`.app-container`) — por padrão o conteúdo fica
   colado na navbar; adicionamos `padding-top`/`padding-bottom`.
4. **Cards de formulário** (`.card-formulario`) — sombra leve, cantos
   arredondados e largura máxima, para os formulários de login/cadastro/
   pedido não ficarem esticados a tela inteira.
5. **Detalhes de tabela** (hover nas linhas) e o botão primário usando a
   cor do projeto em vez do azul padrão do Bootstrap.

Ou seja, o "guia" é: **framework para estrutura, CSS próprio só para
identidade visual** — evita reescrever grid/responsividade do zero (o que
seria trabalho redundante e sujeito a bugs) e ainda assim deixa o sistema
com uma cara própria.

---

## 7. Segurança: o que foi corrigido e por quê

| Problema no original | Correção na refatoração |
|---|---|
| Query montada por concatenação (SQL Injection) | `PDO::prepare()` + `execute([...])` em toda consulta |
| Senha em `md5()` | `password_hash()` / `password_verify()` |
| Saída sem `htmlspecialchars()` (XSS) | Função `h()` usada em toda exibição de dado do usuário |
| Sem checar dono do pedido ao editar/excluir | `WHERE id = ? AND customer_id = ?` em toda operação |
| Erros do banco expostos direto na tela | Centralizados em `includes/db.php`, com comentário sobre o cuidado em produção |
| `admin.php` acessível por qualquer cliente logado (sem checagem) | `exigirAdmin()` verificado no topo do arquivo |

Esses pontos também estão explicados, com exemplo de código, na
**seção 15 do `main.php`**.

---

## 8. Possíveis melhorias (para ir além desta aula)

- **Papel de usuário (`role`) na tabela `customers`**, em vez de usar o
  nome `"admin"` como identificador mágico do administrador.
- **Token CSRF** nos formulários que alteram dados (criar/editar/excluir
  pedido), para impedir que outro site force o navegador do usuário a
  enviar essas requisições sem ele perceber.
- **Paginação** na listagem de pedidos/clientes, quando a tabela crescer.
- **`JOIN` em vez de N+1 queries** em `admin.php` (hoje ele roda uma
  consulta por cliente para buscar os pedidos dele — funciona bem para
  poucos clientes, mas não escala).
- **Testes automatizados** (ex: com PHPUnit) para validar as regras
  (ex: "cliente não pode editar pedido de outro").
- **Migrar de `DOUBLE` para `DECIMAL`** na coluna `amount` — `DOUBLE` pode
  ter pequenas imprecisões de arredondamento, indesejadas para valores
  monetários.

---

## 9. Créditos

Refatoração e material de estudo (`main.php`) desenvolvidos a partir do
trabalho acadêmico original `trab2-master` (CRUD de pedidos em PHP +
MySQL), mantendo o mesmo domínio (clientes/pedidos) e o mesmo conjunto de
funcionalidades, com foco em organização de código, segurança e didática.