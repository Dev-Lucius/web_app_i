<?php

require_once  __DIR__ . '/../config.php';

function obterConexao(): PDO {
    
    static $pdo = null;
    
    if($pdo !== null){
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e){
        die('Não foi possível conectar ao banco de dados: ' . $e->getMessage());
    }

    return $pdo;
}