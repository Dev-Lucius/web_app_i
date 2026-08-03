<?php
echo "<h1>Adicionar Usuarios do Banco de Dados</h1>";
?>

<form method="POST" action="inserir.php">
    <label for="nome">Nome:</label>
    <input type="text" name="nome" required><br><br>

    <label for="Email">Email:</label>
    <input type="text" name="username" required><br><br>

    <label for="data_cadastro">Data Cadastro:</label>
    <input type="date" name="data_cadastro" required><br><br>

    <input type="submit" value="Adicionar Usuario">
</form>

<?php

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $nome = $_POST["nome"];
        $email = $_POST["email"];
        $data_cadastro = $_POST["data_cadastro"];

        require_once 'conexao.php';

        $sql_alterar = "
            INSERT INTO clientes (nome, email, data_cadastro) VALUES
            ('$nome', '$email', '$data_cadastro')
        ";

        if (mysqli_query($conn, $sql_alterar)) {
            echo "Novo usuario criado com sucesso!";
            echo "<br><a href='http://localhost:8080/listar.php'>Voltar para a lista de usuários</a>";
        } else {
            echo "Erro ao criar novo usuario: " . mysqli_error($conn);
        }
    }

    echo "<a href='http://localhost:8080/listar.php'>Retornar</a>"; 
?>