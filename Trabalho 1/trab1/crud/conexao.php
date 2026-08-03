<?php
    $conn = mysqli_connect("localhost", "root", "mysqluser", "planos");

    if(!$conn){
        die("Erro" . mysqli_connect_error());
    }
?>