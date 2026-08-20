<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF6B6B,50:4ECDC4,100:45B7D1&height=220&section=header&text=Desenvolvimento%20de%20Aplicativos%20WEB%20I&fontSize=42&fontColor=fff&animation=fadeIn&fontAlignY=35&desc=Arquitetura%20Web%20%7C%20HTTP%20%7C%20Backend%20%7C%20Banco%20de%20Dados&descSize=16&descAlignY=55"/>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTTP-Protocol-FF6B6B?style=flat-square&logo=google-chrome&logoColor=white"/>
  <img src="https://img.shields.io/badge/REST-API-4ECDC4?style=flat-square&logo=postman&logoColor=white"/>
  <img src="https://img.shields.io/badge/Sessions-Cookies-45B7D1?style=flat-square&logo=redis&logoColor=white"/>
</p>

---

## 📋 Índice da Disciplina

- [Sobre a Disciplina](#-sobre-a-disciplina)
- [Arquitetura da Web](#-arquitetura-da-web)
- [Protocolo HTTP & Servidor Web](#-protocolo-http--servidor-web)
- [Linguagem de Script no Servidor](#-linguagem-de-script-no-servidor)
- [Dados de Sessão](#-dados-de-sessão)
- [Integração com SGBDs](#-integração-com-sgbds)
- [Web Frameworks](#-web-frameworks)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Projetos & Exercícios](#-projetos--exercícios)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Recursos Complementares](#-recursos-complementares)

---

## 📖 Sobre a Disciplina

Este repositório reúne o conteúdo prático da disciplina **Desenvolvimento de Aplicativos WEB I**, focada nos fundamentos do desenvolvimento web server-side e na compreensão da arquitetura que sustenta a internet moderna.

> 🎯 **Objetivo:** Compreender como a web funciona desde o protocolo HTTP até a persistência de dados em bancos relacionais, desenvolvendo aplicações completas com linguagens de script no servidor.

---

## 🏗️ Arquitetura da Web

Entendendo como a web funciona por baixo dos panos.

### Modelo Cliente-Servidor
```
┌─────────────┐         HTTP          ┌─────────────┐
│   CLIENTE   │  ◄────────────────►  │   SERVIDOR  │
│  (Browser)  │    Requisição/Resposta│  (Apache/   │
│             │                       │   Nginx)    │
└─────────────┘                       └──────┬──────┘
                                           │
                                    ┌──────┴──────┐
                                    │   SGBD      │
                                    │  (MySQL)    │
                                    └─────────────┘
```

### Conceitos Fundamentais
| Conceito | Descrição |
|----------|-----------|
| **Cliente** | Navegador que envia requisições HTTP |
| **Servidor** | Máquina que processa requisições e retorna respostas |
| **DNS** | Sistema que traduz domínios em endereços IP |
| **Porta** | Canal de comunicação (HTTP: 80, HTTPS: 443) |
| **Estática vs Dinâmica** | Conteúdo fixo (HTML/CSS) vs. gerado pelo servidor (PHP/Node) |

---

## 🌐 Protocolo HTTP & Servidor Web

### Estrutura da Requisição HTTP
```http
GET /index.php HTTP/1.1
Host: www.exemplo.com
User-Agent: Mozilla/5.0
Accept: text/html
Connection: keep-alive
```

### Estrutura da Resposta HTTP
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 138

<html>
  <body>
    <h1>Hello, World!</h1>
  </body>
</html>
```

### Principais Métodos HTTP
| Método | Função | Uso típico |
|--------|--------|-------------|
| `GET` | Ler dados | Carregar páginas, listar registros |
| `POST` | Criar dados | Enviar formulários, cadastrar usuários |
| `PUT` | Atualizar dados | Editar registros completos |
| `DELETE` | Remover dados | Excluir registros |
| `PATCH` | Atualização parcial | Modificar campos específicos |

### Códigos de Status HTTP
```
1xx → Informativo
2xx → Sucesso (200 OK, 201 Created, 204 No Content)
3xx → Redirecionamento (301 Moved, 302 Found)
4xx → Erro do Cliente (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found)
5xx → Erro do Servidor (500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable)
```

### Configuração de Servidor Web (Apache)
```apache
# Virtual Host básico
<VirtualHost *:80>
    ServerName meusite.local
    DocumentRoot /var/www/html/meusite

    <Directory /var/www/html/meusite>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

---

## 🖥️ Linguagem de Script no Servidor

### PHP — Hypertext Preprocessor
```php
<?php
// Variáveis e tipos
$nome = "Lucas";
$idade = 22;
$ativo = true;

// Arrays
$frutas = ["maçã", "banana", "laranja"];

// Funções
function saudacao($nome) {
    return "Olá, " . $nome . "!";
}

// Recebendo dados de formulário
$usuario = $_POST['usuario'] ?? '';
$senha = $_POST['senha'] ?? '';

// Conexão com banco (PDO)
try {
    $pdo = new PDO("mysql:host=localhost;dbname=meubanco", "root", "senha");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo "Erro: " . $e->getMessage();
}
?>
```

### Node.js com Express
```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Rota GET
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Rota POST
app.post('/usuarios', (req, res) => {
    const { nome, email } = req.body;
    res.status(201).json({ id: 1, nome, email });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
```

### Inclusão de Arquivos
```php
<?php
// include → continua mesmo com erro
include 'header.php';

// require → gera erro fatal se não encontrar
require 'config/database.php';

// include_once / require_once → evita dupla inclusão
require_once 'funcoes/validacao.php';
?>
```

---

## 🍪 Dados de Sessão

### Sessões em PHP
```php
<?php
session_start();

// Criar variáveis de sessão
$_SESSION['usuario_id'] = 42;
$_SESSION['usuario_nome'] = 'Lucas Oliveira';
$_SESSION['logado'] = true;

// Verificar se usuário está logado
if (!isset($_SESSION['logado']) || $_SESSION['logado'] !== true) {
    header('Location: login.php');
    exit();
}

// Destruir sessão (logout)
session_unset();      // Limpa variáveis
session_destroy();    // Destroi a sessão
?>
```

### Cookies
```php
<?php
// Criar cookie (nome, valor, expiração em segundos)
setcookie("tema", "dark", time() + (86400 * 30), "/"); // 30 dias

// Ler cookie
$tema = $_COOKIE['tema'] ?? 'light';

// Remover cookie
setcookie("tema", "", time() - 3600, "/");
?>
```

### Diferença: Sessão vs Cookie
| Característica | Sessão | Cookie |
|---------------|--------|--------|
| Armazenamento | Servidor | Navegador (cliente) |
| Segurança | Mais seguro | Menos seguro (visível) |
| Capacidade | Ilimitada (servidor) | Limitado (~4KB) |
| Persistência | Até fechar navegador* | Até expirar |
| Uso ideal | Dados sensíveis (login) | Preferências do usuário |

> *Sessões podem persistir com `session.gc_maxlifetime` configurado no `php.ini`

---

## 🗄️ Integração com SGBDs

### Conexão MySQL com PDO (PHP)
```php
<?php
$host = 'localhost';
$db   = 'universidade';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    throw new PDOException($e->getMessage(), (int)$e->getCode());
}

// Consulta segura com Prepared Statements
$stmt = $pdo->prepare('SELECT * FROM alunos WHERE curso_id = ?');
$stmt->execute([$cursoId]);
$alunos = $stmt->fetchAll();
?>
```

### CRUD Completo
```php
<?php
// CREATE
$stmt = $pdo->prepare("INSERT INTO alunos (nome, email, matricula) VALUES (?, ?, ?)");
$stmt->execute(['Lucas Oliveira', 'lucas@email.com', '2024001']);

// READ
$stmt = $pdo->query("SELECT * FROM alunos");
$alunos = $stmt->fetchAll();

// UPDATE
$stmt = $pdo->prepare("UPDATE alunos SET email = ? WHERE id = ?");
$stmt->execute(['novo@email.com', 1]);

// DELETE
$stmt = $pdo->prepare("DELETE FROM alunos WHERE id = ?");
$stmt->execute([1]);
?>
```

### Node.js com MySQL2
```javascript
const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'universidade'
});

// Prepared Statement
const [rows] = await connection.execute(
    'SELECT * FROM alunos WHERE curso_id = ?',
    [cursoId]
);
```

---

## 🧩 Web Frameworks

### Conceitos de Frameworks
Frameworks fornecem estrutura, convenções e ferramentas para acelerar o desenvolvimento web, promovendo:
- **MVC** (Model-View-Controller)
- **Roteamento** simplificado
- **ORM** (Object-Relational Mapping)
- **Validação** e segurança embutidas

### Exemplo com Laravel (PHP)
```php
<?php
// routes/web.php
Route::get('/alunos', [AlunoController::class, 'index']);
Route::post('/alunos', [AlunoController::class, 'store']);

// app/Models/Aluno.php
class Aluno extends Model {
    protected $fillable = ['nome', 'email', 'matricula'];

    public function curso() {
        return $this->belongsTo(Curso::class);
    }
}

// app/Http/Controllers/AlunoController.php
class AlunoController extends Controller {
    public function index() {
        $alunos = Aluno::with('curso')->paginate(10);
        return view('alunos.index', compact('alunos'));
    }
}
?>
```

### Exemplo com Express (Node.js)
```javascript
// Estrutura MVC simples
const express = require('express');
const app = express();

// Model (simulado)
const Aluno = {
    findAll: () => db.query('SELECT * FROM alunos'),
    create: (data) => db.query('INSERT INTO alunos SET ?', data)
};

// Controller
const alunoController = {
    index: async (req, res) => {
        const alunos = await Aluno.findAll();
        res.render('alunos/index', { alunos });
    },
    store: async (req, res) => {
        await Aluno.create(req.body);
        res.redirect('/alunos');
    }
};

// Routes
app.get('/alunos', alunoController.index);
app.post('/alunos', alunoController.store);
```

---

## 📁 Estrutura do Repositório

```
dev-web-I/
├── 📁 01-arquitetura-web/
│   ├── modelo-cliente-servidor.md
│   └── dns-e-requisicoes.md
│
├── 📁 02-protocolo-http/
│   ├── metodos-http.php
│   ├── status-codes.md
│   └── headers-e-corpo.md
│
├── 📁 03-php-servidor/
│   ├── sintaxe-basica/
│   ├── formularios/
│   └── includes-e-requires/
│
├── 📁 04-sessoes-e-cookies/
│   ├── login-com-sessao/
│   ├── carrinho-de-compras/
│   └── preferencias-cookies/
│
├── 📁 05-banco-de-dados/
│   ├── conexao-pdo/
│   ├── crud-basico/
│   ├── prepared-statements/
│   └── relatorios-sql/
│
├── 📁 06-web-frameworks/
│   ├── mini-mvc-php/
│   └── api-rest-node/
│
├── 📁 projetos/
│   ├── sistema-academico/
│   └── blog-simples/
│
└── README.md
```

---

## 🚀 Projetos & Exercícios

| Projeto | Descrição | Tecnologias |
|---------|-----------|-------------|
| **Sistema de Login** | Autenticação com sessões e hash de senha | PHP, MySQL, Sessions |
| **Cadastro de Alunos** | CRUD completo com validação de formulários | PHP, PDO, MySQL |
| **API de Cursos** | Endpoints REST para gerenciamento de cursos | Node.js, Express, MySQL |
| **Mini Blog** | Posts com categorias, comentários e painel admin | PHP, MVC, MySQL |
| **Carrinho de Compras** | Sessões para persistir itens entre páginas | PHP, Cookies, Sessions |

---

## 🛠️ Tecnologias Utilizadas

<div align="center">

| **Frontend** | **Backend** | **Banco de Dados** | **Servidor** |
|:---:|:---:|:---:|:---:|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) | ![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white) | ![MySQL](https://img.shields.io/badge/MySQL-00758F?style=flat-square&logo=mysql&logoColor=white) | ![Apache](https://img.shields.io/badge/Apache-D22128?style=flat-square&logo=apache&logoColor=white) |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) | | ![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white) |
| ![JavaScript](https://img.shields.io/badge/JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | | | |

</div>

---

## 📚 Recursos Complementares

- [MDN Web Docs - HTTP](https://developer.mozilla.org/pt-BR/docs/Web/HTTP)
- [PHP: The Right Way](https://phptherightway.com/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Express.js Guide](https://expressjs.com/pt-br/guide/routing.html)
- [Laravel Documentation](https://laravel.com/docs)

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF6B6B,50:4ECDC4,100:45B7D1&height=100&section=footer" />
</div>
