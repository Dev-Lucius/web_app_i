<?php

    require_once 'conexao.php';

    $id_edit = $_POST['id'];
    $sql = "
        SELECT *
        FROM clientes
        WHERE ID = $id_edit
    ";
    
    $result = mysqli_query($conn, $sql);

    $row = mysqli_fetch_assoc($result);
    $nome = $row["nome"];
    $email = $row["email"];
    $data_cadastro = $row["data_cadastro"];
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Usuário</title>
</head>
<body>
    <form method="POST" action="alterar.php">
        <label for="nome">Nome:</label>
        <input type="text" name="nome" value="<?php echo $nome; ?>"><br><br>

        <label for="Email">Email:</label>
        <input type="text" name="email" value="<?php echo $email; ?>"><br><br>

        <label for="data_cadastro">Data Cadastro:</label>
        <input type="date" name="data_cadastro" value="<?php echo $data_cadastro; ?>"><br><br>

        <input type="hidden" name="id" value="<?php echo $id_edit; ?>">
        <input type="submit" value="Alterar Usuario">
    </form>
</body>
</html>