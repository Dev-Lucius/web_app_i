<?php
/**
 * register.php
 * ---------------------------------------------------------------------
 * Formulário de cadastro. No projeto original isso era um register.html
 * estático. Convertemos para .php só para poder reaproveitar o mesmo
 * header/footer/CSS do resto do sistema — o formulário em si continua
 * simples.
 * ---------------------------------------------------------------------
 */
require_once __DIR__ . '/includes/funcoes.php';

$tituloPagina = 'Criar conta';
require __DIR__ . '/includes/header.php';

if (($_GET['msg'] ?? '') === 'EMAIL_EM_USO') {
    echo '<div class="alert alert-danger">Esse e-mail já está cadastrado.</div>';
}
?>

<div class="card-formulario">
    <h3 class="text-center">Criar conta</h3>
    <form action="register_processar.php" method="post">
        <div class="form-group">
            <label for="name">Nome:</label>
            <input type="text" name="name" id="name" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="email">E-mail:</label>
            <input type="email" name="email" id="email" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="passwd">Senha:</label>
            <input type="password" name="passwd" id="passwd" class="form-control" required minlength="4">
        </div>
        <div class="d-flex justify-content-between align-items-center">
            <a href="login.php">Já tenho conta</a>
            <button type="submit" class="btn btn-primary">Cadastrar</button>
        </div>
    </form>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
