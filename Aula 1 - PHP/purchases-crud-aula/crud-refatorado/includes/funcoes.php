<?php
/**
 * includes/funcoes.php
 * ---------------------------------------------------------------------
 * Funções pequenas e reutilizáveis, usadas por várias páginas.
 * Reunir esse tipo de lógica em um único arquivo evita "copiar e colar"
 * o mesmo trecho de código em cada página (era o que acontecia no
 * projeto original, ex: `session_start()` + checagem de sessão repetida).
 * ---------------------------------------------------------------------
 */

/**
 * Redireciona o navegador para outra página e encerra o script.
 * Ter uma função para isso evita esquecer o `exit` depois do header()
 * — um erro comum que deixa o resto do script rodando por engano.
 */
function redirecionarPara(string $local): void
{
    header('Location: ' . $local);
    exit;
}

/**
 * Garante que exista uma sessão iniciada. Chame isso no topo de toda
 * página que precisa ler/gravar $_SESSION.
 */
function iniciarSessaoSeNecessario(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

/**
 * Verifica se existe um cliente logado. Caso não exista, manda a
 * pessoa de volta para o login. Use no topo das páginas protegidas.
 */
function exigirLogin(): void
{
    iniciarSessaoSeNecessario();
    if (empty($_SESSION['id'])) {
        redirecionarPara('login.php?msg=LOGIN_NECESSARIO');
    }
}

/**
 * Verifica se o cliente logado é o administrador. Caso não seja,
 * manda de volta para a home. Use no topo do admin.php.
 */
function exigirAdmin(): void
{
    exigirLogin();
    if (!souAdmin()) {
        redirecionarPara('home.php');
    }
}

/**
 * Diz se o usuário logado é o administrador (mesma regra do projeto
 * original: o "nome mágico" definido em ADMIN_NAME).
 */
function souAdmin(): bool
{
    return isset($_SESSION['name']) && $_SESSION['name'] === ADMIN_NAME;
}

/**
 * Escapa texto antes de jogar no HTML, prevenindo XSS (Cross-Site
 * Scripting). Sempre que formos ecoar algo que o usuário digitou
 * (nome, descrição, etc.) devemos passar por aqui.
 *
 * Exemplo do problema que isso evita: se alguém cadastrar um pedido
 * com a descrição  <script>alert('hack')</script> , sem essa função
 * esse script seria executado no navegador de quem visse a listagem.
 */
function h(?string $texto): string
{
    return htmlspecialchars($texto ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Pequeno helper para ler um valor de $_POST já com "trim" aplicado,
 * evitando repetir `trim($_POST['x'] ?? '')` em todo lugar.
 */
function postTrim(string $chave): string
{
    return trim($_POST[$chave] ?? '');
}
