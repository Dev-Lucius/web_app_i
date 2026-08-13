<?php
/**
 * logout.php
 * ---------------------------------------------------------------------
 * Encerra a sessão do usuário e volta para o login.
 * ---------------------------------------------------------------------
 */
require_once __DIR__ . '/includes/funcoes.php';
iniciarSessaoSeNecessario();

$_SESSION = [];
session_destroy();

redirecionarPara('login.php?msg=LOGOUT');
