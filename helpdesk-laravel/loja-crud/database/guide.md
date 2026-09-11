<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00758F,50:00d2ff,100:00758F&height=200&section=header&text=MySQL%20no%20Terminal&fontSize=50&fontColor=fff&animation=fadeIn&fontAlignY=35&desc=Guia%20Completo%20de%20Comandos%20CLI&descSize=18&descAlignY=55"/>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Terminal-4EAA25?style=for-the-badge&logo=gnu-bash&logoColor=white"/>
  <img src="https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black"/>
</p>

---

## 📋 Índice

- [Instalação](#-instalação)
- [Acessando o MySQL](#-acessando-o-mysql)
- [Comandos Básicos](#-comandos-básicos)
- [Gerenciamento de Bancos](#-gerenciamento-de-bancos)
- [Manipulação de Tabelas](#-manipulação-de-tabelas)
- [CRUD no Terminal](#-crud-no-terminal)
- [Joins](#-joins)
- [Índices](#-índices)
- [Usuários e Permissões](#-usuários-e-permissões)
- [Dicas & Atalhos](#-dicas--atalhos)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Instalação

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### macOS (Homebrew)
```bash
brew install mysql
brew services start mysql
```

### Verificar instalação
```bash
mysql --version
```

---

## 🔑 Acessando o MySQL

### Login como root
```bash
sudo mysql -u root -p
```

### Login com usuário específico
```bash
mysql -u nome_usuario -p
```

> 💡 **Dica:** O `-p` solicita a senha interativamente. Você também pode passar a senha direto (menos seguro):
> ```bash
> mysql -u root -p"sua_senha"
> ```

### Acessar um banco específico direto
```bash
mysql -u root -p nome_do_banco
```

---

## 🗄️ Gerenciamento de Bancos

```sql
-- Listar todos os bancos de dados
SHOW DATABASES;

-- Criar um novo banco
CREATE DATABASE meu_banco;

-- Selecionar um banco para usar
USE meu_banco;

-- Ver qual banco está ativo
SELECT DATABASE();

-- Excluir um banco (CUIDADO!)
DROP DATABASE meu_banco;
```

---

## 📐 Manipulação de Tabelas

```sql
-- Listar todas as tabelas do banco atual
SHOW TABLES;

-- Ver estrutura de uma tabela
DESCRIBE nome_da_tabela;
-- ou
DESC nome_da_tabela;

-- Ver comando SQL de criação da tabela
SHOW CREATE TABLE nome_da_tabela;

-- Criar uma tabela
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    idade INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Excluir uma tabela
DROP TABLE usuarios;

-- Limpar todos os dados da tabela (mantém estrutura)
TRUNCATE TABLE usuarios;
```

---

## 📝 CRUD no Terminal

### ➕ CREATE (Inserir)
```sql
-- Inserir um registro
INSERT INTO usuarios (nome, email, idade) 
VALUES ('Lucas Oliveira', 'lucas@email.com', 22);

-- Inserir múltiplos registros
INSERT INTO usuarios (nome, email, idade) 
VALUES 
    ('Ana Silva', 'ana@email.com', 25),
    ('Carlos Souza', 'carlos@email.com', 30);
```

### 🔍 READ (Consultar)
```sql
-- Selecionar tudo
SELECT * FROM usuarios;

-- Selecionar colunas específicas
SELECT nome, email FROM usuarios;

-- Com condição (WHERE)
SELECT * FROM usuarios WHERE idade > 20;

-- Com ordenação
SELECT * FROM usuarios ORDER BY nome ASC;

-- Com limite de resultados
SELECT * FROM usuarios LIMIT 5;

-- Busca com LIKE (parcial)
SELECT * FROM usuarios WHERE nome LIKE '%Silva%';
```

### ✏️ UPDATE (Atualizar)
```sql
-- Atualizar um registro específico
UPDATE usuarios 
SET idade = 23 
WHERE id = 1;

-- ⚠️ NUNCA esqueça o WHERE! Sem ele, atualiza TODOS os registros.
```

### ❌ DELETE (Excluir)
```sql
-- Excluir um registro específico
DELETE FROM usuarios WHERE id = 1;

-- ⚠️ SEMPRE use WHERE no DELETE, senão apaga a tabela inteira!
```

---

## 🔗 Joins

### Criando tabelas de exemplo
```sql
CREATE TABLE departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

CREATE TABLE funcionarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    salario DECIMAL(10,2),
    dept_id INT,
    FOREIGN KEY (dept_id) REFERENCES departamentos(id)
);
```

### INNER JOIN (apenas registros com correspondência)
```sql
SELECT f.nome, f.salario, d.nome AS departamento
FROM funcionarios f
INNER JOIN departamentos d ON f.dept_id = d.id;
```

### LEFT JOIN (todos da esquerda + correspondências)
```sql
SELECT f.nome, d.nome AS departamento
FROM funcionarios f
LEFT JOIN departamentos d ON f.dept_id = d.id;
```

### RIGHT JOIN (todos da direita + correspondências)
```sql
SELECT f.nome, d.nome AS departamento
FROM funcionarios f
RIGHT JOIN departamentos d ON f.dept_id = d.id;
```

### FULL OUTER JOIN (MySQL não suporta diretamente — use UNION)
```sql
SELECT f.nome, d.nome AS departamento
FROM funcionarios f
LEFT JOIN departamentos d ON f.dept_id = d.id
UNION
SELECT f.nome, d.nome AS departamento
FROM funcionarios f
RIGHT JOIN departamentos d ON f.dept_id = d.id;
```

### CROSS JOIN (produto cartesiano)
```sql
SELECT f.nome, d.nome AS departamento
FROM funcionarios f
CROSS JOIN departamentos d;
```

### SELF JOIN (tabela com ela mesma)
```sql
SELECT a.nome AS funcionario, b.nome AS gerente
FROM funcionarios a
JOIN funcionarios b ON a.gerente_id = b.id;
```

---

## ⚡ Índices

### O que são índices?
Índices aceleram consultas `SELECT`, mas podem deixar `INSERT`, `UPDATE` e `DELETE` mais lentos. Use com sabedoria!

### Listar índices de uma tabela
```sql
SHOW INDEX FROM usuarios;
```

### Criar um índice simples
```sql
CREATE INDEX idx_email ON usuarios(email);
```

### Criar um índice único
```sql
CREATE UNIQUE INDEX idx_email_unico ON usuarios(email);
```

### Criar um índice composto (múltiplas colunas)
```sql
CREATE INDEX idx_nome_idade ON usuarios(nome, idade);
```

### Criar índice com prefixo (para TEXT/VARCHAR longos)
```sql
CREATE INDEX idx_nome_prefixo ON usuarios(nome(10));
```

### Excluir um índice
```sql
DROP INDEX idx_email ON usuarios;
-- ou
ALTER TABLE usuarios DROP INDEX idx_email;
```

### Índice FULLTEXT (para buscas em textos)
```sql
CREATE FULLTEXT INDEX idx_descricao ON produtos(descricao);

-- Usar em consultas
SELECT * FROM produtos 
WHERE MATCH(descricao) AGAINST('notebook');
```

### Analisar performance de uma query (EXPLAIN)
```sql
EXPLAIN SELECT * FROM usuarios WHERE email = 'teste@email.com';
```

> 💡 **Dica:** Se `EXPLAIN` mostrar `ALL` na coluna `type`, significa que a query está fazendo **full table scan** — considere adicionar um índice!

---

## 👤 Usuários e Permissões

### Listar usuários existentes
```sql
SELECT user, host FROM mysql.user;
```

### Criar um novo usuário
```sql
CREATE USER 'lucas'@'localhost' IDENTIFIED BY 'senha_segura123';
```

### Criar usuário com acesso remoto
```sql
CREATE USER 'lucas'@'%' IDENTIFIED BY 'senha_segura123';
```

### Alterar senha de um usuário
```sql
ALTER USER 'lucas'@'localhost' IDENTIFIED BY 'nova_senha';
FLUSH PRIVILEGES;
```

### Conceder permissões (GRANT)

```sql
-- Todos os privilégios em um banco específico
GRANT ALL PRIVILEGES ON meu_banco.* TO 'lucas'@'localhost';

-- Apenas SELECT e INSERT
GRANT SELECT, INSERT ON meu_banco.* TO 'lucas'@'localhost';

-- Apenas em uma tabela específica
GRANT SELECT, UPDATE ON meu_banco.usuarios TO 'lucas'@'localhost';

-- Permissão para criar novos usuários
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' WITH GRANT OPTION;
```

### Revogar permissões (REVOKE)
```sql
REVOKE ALL PRIVILEGES ON meu_banco.* FROM 'lucas'@'localhost';
REVOKE INSERT ON meu_banco.usuarios FROM 'lucas'@'localhost';
```

### Ver permissões de um usuário
```sql
SHOW GRANTS FOR 'lucas'@'localhost';
```

### Excluir um usuário
```sql
DROP USER 'lucas'@'localhost';
```

### Aplicar alterações de permissões
```sql
FLUSH PRIVILEGES;
```

### Resumo de privilégios comuns

| Privilégio | Descrição |
|------------|-----------|
| `ALL PRIVILEGES` | Acesso total |
| `SELECT` | Ler dados |
| `INSERT` | Inserir dados |
| `UPDATE` | Atualizar dados |
| `DELETE` | Excluir dados |
| `CREATE` | Criar tabelas/bancos |
| `DROP` | Excluir tabelas/bancos |
| `ALTER` | Modificar estrutura |
| `INDEX` | Criar/remover índices |
| `GRANT OPTION` | Conceder privilégios a outros |

---

## 🛠️ Comandos Úteis do Terminal MySQL

| Comando | Descrição |
|---------|-----------|
| `mysql -u root -p` | Login no MySQL |
| `SHOW DATABASES;` | Lista bancos |
| `USE nome_db;` | Seleciona banco |
| `SHOW TABLES;` | Lista tabelas |
| `DESC tabela;` | Estrutura da tabela |
| `SELECT USER();` | Ver usuário atual |
| `SELECT VERSION();` | Ver versão do MySQL |
| `SHOW STATUS;` | Status do servidor |
| `EXIT` ou `QUIT` | Sair do MySQL |
| `CLEAR` ou `\c` | Limpar tela/comando atual |
| `\G` | Formatar saída vertical (útil para tabelas largas) |

---

## 💡 Dicas & Atalhos

### Formatação de saída
```sql
-- Resultado em formato vertical (melhor para muitas colunas)
SELECT * FROM usuarios WHERE id = 1 \G
```

### Executar SQL direto pelo terminal (sem entrar no prompt)
```bash
mysql -u root -p -e "SHOW DATABASES;"
```

### Importar um arquivo .sql
```bash
mysql -u root -p nome_do_banco < arquivo.sql
```

### Exportar um banco (dump)
```bash
mysqldump -u root -p nome_do_banco > backup.sql
```

### Exportar apenas a estrutura (sem dados)
```bash
mysqldump -u root -p --no-data nome_do_banco > estrutura.sql
```

### Exportar uma tabela específica
```bash
mysqldump -u root -p nome_do_banco nome_tabela > tabela_backup.sql
```

### Histórico de comandos
- Use as **setas ↑ ↓** para navegar no histórico
- Use **Tab** para autocompletar nomes de tabelas/colunas

---

## 🔧 Troubleshooting

### Erro: `ERROR 1698 (28000): Access denied for user 'root'@'localhost'`
```bash
# No Ubuntu, root usa auth_socket por padrão. Altere para mysql_native_password:
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'sua_nova_senha';
FLUSH PRIVILEGES;
EXIT;
```

### Erro: `Can't connect to local MySQL server`
```bash
# Verificar se o serviço está rodando
sudo systemctl status mysql

# Iniciar o serviço
sudo systemctl start mysql

# Habilitar início automático
sudo systemctl enable mysql
```

### Ver portas em uso
```bash
sudo netstat -tlnp | grep mysql
```

---

## 📚 Recursos Adicionais

- [Documentação Oficial MySQL](https://dev.mysql.com/doc/)
- [MySQL Cheat Sheet](https://devhints.io/mysql)

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00758F,50:00d2ff,100:00758F&height=100&section=footer" />
</div>