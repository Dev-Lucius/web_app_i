<?php
/**
 * register_processar.php  (antigo insert_data.php)
 * ---------------------------------------------------------------------
 * Recebe o POST do formulário de cadastro e insere o cliente no banco.
 *
 * Mudança mais importante em relação ao original: a senha era guardada
 * com md5(). MD5 é um algoritmo RÁPIDO e hoje é considerado inseguro
 * para senhas — existem tabelas prontas ("rainbow tables") com bilhões
 * de senhas comuns já convertidas em md5, então descobrir a senha
 * original a partir do hash é trivial em muitos casos.
 *
 * password_hash() usa um algoritmo (bcrypt, por padrão) feito
 * DE PROPÓSITO para ser lento e usar "salt" aleatório automaticamente,
 * o que torna ataques de força bruta muito mais caros. É o padrão
 * recomendado hoje em dia para senhas em PHP.
 * ---------------------------------------------------------------------
 */
require_once __DIR__ . '/includes/funcoes.php';
require_once __DIR__ . '/includes/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirecionarPara('register.php');
}

$nome  = postTrim('name');
$email = postTrim('email');
$senha = $_POST['passwd'] ?? '';

if ($nome === '' || $email === '' || $senha === '') {
    redirecionarPara('register.php');
}

$pdo = obterConexao();

// Confere se o e-mail já existe antes de tentar inserir, para dar uma
// mensagem amigável (a tabela também poderia ter uma UNIQUE KEY em
// email para garantir isso no nível do banco — veja sql/schema.sql).
$verifica = $pdo->prepare('SELECT id FROM customers WHERE email = ?');
$verifica->execute([$email]);
if ($verifica->fetch()) {
    redirecionarPara('register.php?msg=EMAIL_EM_USO');
}

$senhaHash = password_hash($senha, PASSWORD_DEFAULT);

$insere = $pdo->prepare('INSERT INTO customers (name, email, passwd) VALUES (?, ?, ?)');
$insere->execute([$nome, $email, $senhaHash]);

redirecionarPara('login.php?msg=OK');
