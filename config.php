<?php
$host = "localhost";
$port = "5434";
$dbname = "E04";
$username = "postgres";
$password = "pass"; //password

try {
    $pdo = new PDO(
        "pgsql:host=$host;port=$port;dbname=$dbname",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $error) {
    error_log($error->getMessage());

    if (basename($_SERVER["SCRIPT_NAME"] ?? "") === "api.php") {
        http_response_code(500);
        header("Content-Type: application/json; charset=utf-8");

        echo json_encode(["error" => "Database connection failed"]);

        exit;
    }

    exit("Database connection failed.");
}