<?php

    echo "<h1> Planos </h1>";

    echo "<br>";
    echo "<a href='http://localhost:8080/inserir.php'>Adicionar novos usuários</a>";

    require_once 'conexao.php';

    $sql_listar = "SELECT * FROM clientes";
    $resultado_listagem = mysqli_query($conn, $sql_listar);

    if (mysqli_num_rows($resultado_listagem) > 0) {
        while ($linha = mysqli_fetch_assoc($resultado_listagem)) {
            echo "<hr>";
            echo "ID: " . $linha['id'] . "<br>";
            echo "Nome: " . $linha['nome'] . "<br>";
            echo "E-mail: " . $linha['email'] . "<br>";
            echo "Data de cadastro: " . $linha['data_cadastro'] . "<br>";
            echo "<hr>";
            
            echo "
            <td> 
                <form method='POST' action='excluir.php'>
                    <input type='hidden' name='id' value='" . $row["id"] . "'>
                    <input type='submit' value='Excluir'>
                </form>
            </td>";

            echo "
            <td> 
                <form method='POST' action='editar.php'>
                    <input type='hidden' name='id' value='" . $row["id"] . "'>
                    <input type='submit' value='Editar'>
                </form>
            </td>";
        }
    } else {
        echo "Nenhum usuário encontrado.";
    }
?>