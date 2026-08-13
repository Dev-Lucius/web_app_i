<?php
/**
 * includes/db.php
 * ---------------------------------------------------------------------
 * Responsável por UMA coisa só: abrir a conexão com o banco de dados
 * e devolvê-la pronta para uso.
 *
 * Trocamos mysqli por PDO + "prepared statements" (consultas preparadas).
 *
 * Por quê? No código original as consultas eram montadas assim:
 *
 *     $query = "SELECT * FROM customers WHERE email='$email'";
 *
 * Isso é uma porta aberta para SQL Injection: se alguém digitar, no
 * campo de e-mail, algo como   ' OR '1'='1   a consulta vira sempre
 * verdadeira e o "ataque" passa a autenticar sem senha correta.
 *
 * Com PDO + prepared statements, o valor digitado pelo usuário NUNCA
 * é colado dentro do texto da query. Ele é enviado separadamente,
 * então não existe forma de "escapar" da consulta original.
 * ---------------------------------------------------------------------
 */

require_once __DIR__ . '/../config.php';

function obterConexao(): PDO
{
    // Guardamos a conexão em uma variável estática: assim, mesmo que
    // esta função seja chamada várias vezes na mesma página, a conexão
    // com o banco é aberta apenas UMA vez.
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            // Faz o PDO lançar exceções em caso de erro, em vez de
            // devolver "false" silenciosamente (como o mysqli antigo).
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            // Devolve os resultados como array associativo por padrão.
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $e) {
        // Em produção nunca exiba $e->getMessage() para o usuário final
        // (pode revelar detalhes do servidor). Aqui exibimos por ser
        // um projeto didático.
        die('Não foi possível conectar ao banco de dados: ' . $e->getMessage());
    }

    return $pdo;
}
