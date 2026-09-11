<?php
/**
 * login_processar.php
 * ---------------------------------------------------------------------
 * Recebe o POST do formulário de login (login.php), confere as
 * credenciais no banco e cria a sessão do usuário.
 *
 * Este arquivo não tem HTML nenhum: ele só processa dados e redireciona.
 * Isso deixa claro, só pelo nome do arquivo, "o que ele faz".
 *
 * Mudanças em relação ao customersession.php original:
 *  - PDO com prepared statement em vez de concatenar a query (evita
 *    SQL Injection).
 *  - password_verify() em vez de comparar md5() diretamente (veja
 *    a explicação em register_processar.php).
 * ---------------------------------------------------------------------
 */
require_once __DIR__ . '/includes/funcoes.php';
require_once __DIR__ . '/includes/db.php';
iniciarSessaoSeNecessario();

// Só aceita requisições vindas de um POST (evita acessar essa URL
// diretamente pelo navegador sem enviar um formulário).
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirecionarPara('login.php');
}

$email = postTrim('email');
$senha = $_POST['password'] ?? '';

if ($email === '' || $senha === '') {
    redirecionarPara('login.php?msg=LOGIN_ERROR');
}

$pdo = obterConexao();

// O "?" é um placeholder: o PDO envia o valor separadamente da query,
// então não existe como um valor digitado "escapar" e virar SQL.
$stmt = $pdo->prepare('SELECT id, name, email, passwd FROM customers WHERE email = ?');
$stmt->execute([$email]);
$cliente = $stmt->fetch();

if ($cliente && password_verify($senha, $cliente['passwd'])) {
    // Regenerar o ID de sessão após o login é uma boa prática de
    // segurança: evita "session fixation" (alguém forçar você a usar
    // um ID de sessão que ele já conhece).
    session_regenerate_id(true);

    $_SESSION['id']    = $cliente['id'];
    $_SESSION['name']  = $cliente['name'];
    $_SESSION['email'] = $cliente['email'];

    redirecionarPara($cliente['name'] === ADMIN_NAME ? 'admin.php' : 'home.php');
}

// Credenciais inválidas: limpa qualquer resquício de sessão e avisa.
unset($_SESSION['id'], $_SESSION['name'], $_SESSION['email']);
redirecionarPara('login.php?msg=LOGIN_ERROR');
