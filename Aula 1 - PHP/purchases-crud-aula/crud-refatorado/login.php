<?php
/**
 * login.php
 * ---------------------------------------------------------------------
 * Só EXIBE o formulário de login e uma eventual mensagem (?msg=...).
 * Quem processa o login é login_processar.php — separar "mostrar
 * formulário" de "processar formulário" deixa cada arquivo com uma
 * única responsabilidade, mais fácil de ler e de testar.
 * ---------------------------------------------------------------------
 */
require_once __DIR__ . '/includes/funcoes.php';
iniciarSessaoSeNecessario();

// Se a pessoa já está logada, não faz sentido ver o login de novo.
if (!empty($_SESSION['id'])) {
    redirecionarPara(souAdmin() ? 'admin.php' : 'home.php');
}

// Mapa de códigos de mensagem -> texto exibido. Trocar/adicionar uma
// mensagem no futuro é só mexer aqui, em um único lugar.
$mensagens = [
    'OK'               => ['tipo' => 'info',    'texto' => 'Cadastro realizado com sucesso. Faça login.'],
    'LOGIN_ERROR'      => ['tipo' => 'danger',   'texto' => 'E-mail ou senha incorretos.'],
    'LOGIN_NECESSARIO' => ['tipo' => 'warning',  'texto' => 'Você precisa entrar para acessar essa página.'],
    'LOGOUT'           => ['tipo' => 'info',     'texto' => 'Você saiu do sistema.'],
];

$tituloPagina = 'Login';
require __DIR__ . '/includes/header.php';

$codigo = $_GET['msg'] ?? null;
if ($codigo !== null && isset($mensagens[$codigo])) {
    $m = $mensagens[$codigo];
    echo '<div class="alert alert-' . h($m['tipo']) . '" role="alert">' . h($m['texto']) . '</div>';
}
?>

<div class="card-formulario">
    <h3 class="text-center">Entrar</h3>
    <form action="login_processar.php" method="post">
        <div class="form-group">
            <label for="email">E-mail:</label>
            <input type="email" name="email" id="email" class="form-control" required autofocus>
        </div>
        <div class="form-group">
            <label for="password">Senha:</label>
            <input type="password" name="password" id="password" class="form-control" required>
        </div>
        <div class="d-flex justify-content-between align-items-center">
            <a href="register.php">Criar conta</a>
            <button type="submit" class="btn btn-primary">Entrar</button>
        </div>
    </form>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
