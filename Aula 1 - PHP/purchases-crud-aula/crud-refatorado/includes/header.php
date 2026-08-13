<?php
/**
 * includes/header.php
 * ---------------------------------------------------------------------
 * HTML de abertura (doctype + head + navbar) compartilhado por todas
 * as páginas internas do sistema.
 *
 * Antes, o mesmo bloco de <head> e <nav> estava copiado e colado em
 * home.php, insert_order.php, update_order.php e admin.php. Se
 * quiséssemos trocar o Bootstrap de versão, seria preciso editar
 * quatro arquivos. Agora é só um.
 *
 * Este arquivo espera (opcionalmente) duas variáveis definidas ANTES
 * de ser incluído:
 *   $tituloPagina  (string) título exibido na aba do navegador
 *   $paginaAtiva   (string) nome da página atual, para destacar o
 *                  item correspondente no menu ('home' | 'admin')
 * ---------------------------------------------------------------------
 */

$tituloPagina = $tituloPagina ?? 'Purchases';
$paginaAtiva  = $paginaAtiva ?? '';
?>
<!doctype html>
<html lang="pt-br">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><?= h($tituloPagina) ?></title>

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
          integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <!-- Nosso CSS próprio, carregado DEPOIS do Bootstrap para poder
         sobrescrever pequenos detalhes (veja css/estilo.css). -->
    <link rel="stylesheet" href="css/estilo.css">
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark app-navbar">
    <a class="navbar-brand" href="home.php">🛒 Purchases</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav mr-auto">
            <?php if (!empty($_SESSION['id'])): ?>
                <?php if (souAdmin()): ?>
                    <li class="nav-item <?= $paginaAtiva === 'admin' ? 'active' : '' ?>">
                        <a class="nav-link" href="admin.php">Administração</a>
                    </li>
                <?php else: ?>
                    <li class="nav-item <?= $paginaAtiva === 'home' ? 'active' : '' ?>">
                        <a class="nav-link" href="home.php">Meus pedidos</a>
                    </li>
                <?php endif; ?>
                <li class="nav-item">
                    <a class="nav-link" href="logout.php">Sair</a>
                </li>
            <?php endif; ?>
        </ul>

        <?php if (!empty($_SESSION['name'])): ?>
            <span class="navbar-text text-light">
                Olá, <strong><?= h($_SESSION['name']) ?></strong>
            </span>
        <?php endif; ?>
    </div>
</nav>

<main class="container app-container">
