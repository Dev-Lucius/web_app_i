<?php
/**
 * index.php
 * ---------------------------------------------------------------------
 * Ponto de entrada do sistema. Igual ao projeto original: quem acessar
 * a raiz do site é mandado direto para a tela de login.
 * ---------------------------------------------------------------------
 */
require_once __DIR__ . '/includes/funcoes.php';
redirecionarPara('login.php');
