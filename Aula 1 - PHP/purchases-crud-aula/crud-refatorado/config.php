<?php
/**
 * config.php
 * ---------------------------------------------------------------------
 * Configurações centrais da aplicação.
 *
 * Por que isso existe?
 * No projeto original, cada arquivo tinha sua própria linha
 * `mysqli_connect("localhost","root","","PurchasesDB")` repetida.
 * Se o banco mudasse de nome ou senha, seria preciso editar N arquivos.
 *
 * Agora existe UM único lugar para configurar o acesso ao banco.
 * Todo o resto do sistema (includes/db.php) lê essas constantes.
 * ---------------------------------------------------------------------
 */

// Dados de conexão com o banco de dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'PurchasesDB');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Nome "mágico" que identifica o usuário administrador.
// (Mantido igual ao projeto original: quem se chama 'admin' vira admin.
//  Isso é ingênuo — veja o README, seção "Possíveis melhorias".)
define('ADMIN_NAME', 'admin');

// Exibir erros do PHP na tela. Em um sistema real (produção) isso
// deve ficar como 0/false. Deixamos ligado aqui só para fins didáticos.
error_reporting(E_ALL);
ini_set('display_errors', '1');
