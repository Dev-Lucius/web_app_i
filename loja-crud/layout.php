<?php
// layout.php — Template base
if (!isset($titulo)) $titulo = 'Loja CRUD';
if (!isset($conteudo)) $conteudo = '';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($titulo) ?> — Loja</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <style>
        :root { --sidebar-width: 250px; }
        body { background: #f8f9fa; }
        .sidebar {
            width: var(--sidebar-width);
            min-height: 100vh;
            background: #1e293b;
            position: fixed; left: 0; top: 0;
        }
        .sidebar .nav-link {
            color: #cbd5e1;
            padding: 12px 20px;
            border-radius: 6px;
            margin: 2px 10px;
        }
        .sidebar .nav-link:hover, .sidebar .nav-link.active {
            background: #334155;
            color: #fff;
        }
        .main-content {
            margin-left: var(--sidebar-width);
            padding: 30px;
        }
        .card-hover:hover { transform: translateY(-2px); transition: .2s; }
    </style>
</head>
<body>
    <nav class="sidebar d-flex flex-column">
        <div class="p-4 text-white">
            <h4 class="m-0"><i class="bi bi-shop"></i> Loja</h4>
            <small class="text-muted">CRUD PHP Puro</small>
        </div>
        <a href="index.php" class="nav-link <?= $pagina=='home'?'active':'' ?>">
            <i class="bi bi-house-door"></i> Dashboard
        </a>
        <a href="index.php?pagina=clientes" class="nav-link <?= $pagina=='clientes'?'active':'' ?>">
            <i class="bi bi-people"></i> Clientes
        </a>
        <a href="index.php?pagina=categorias" class="nav-link <?= $pagina=='categorias'?'active':'' ?>">
            <i class="bi bi-tags"></i> Categorias
        </a>
        <a href="index.php?pagina=produtos" class="nav-link <?= $pagina=='produtos'?'active':'' ?>">
            <i class="bi bi-box-seam"></i> Produtos
        </a>
        <a href="index.php?pagina=pedidos" class="nav-link <?= $pagina=='pedidos'?'active':'' ?>">
            <i class="bi bi-cart3"></i> Pedidos
        </a>
    </nav>

    <main class="main-content">
        <?php if (isset($_SESSION['flash'])): ?>
            <div class="alert alert-<?= $_SESSION['flash']['tipo'] ?> alert-dismissible fade show">
                <?= $_SESSION['flash']['msg'] ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            <?php unset($_SESSION['flash']); ?>
        <?php endif; ?>
        <?= $conteudo ?>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
