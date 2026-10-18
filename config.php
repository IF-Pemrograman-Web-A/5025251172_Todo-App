<?php
$host = "localhost";
$port = "5434";
$dbname = "E04";
$username = "postgres";
$password = "password";

try {
    $pdo = new PDO(
        "pgsql:host=$host;port=$port;dbname=$dbname",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $error) {
    exit("Koneksi database gagal: " . $error->getMessage());
}