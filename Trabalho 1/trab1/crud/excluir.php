<?php

    require_once 'conexao.php';

    $id = $_POST['id'];

    $sql_excluir = "DELETE FROM clientes WHERE id = $id";

    if(mysqli_query($conn, $sql_excluir)){
?>
        <script>
            window.location.href = "http://localhost:8080/listar.php";
        </script>
<?php
    }
?>