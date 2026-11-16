<?php
require_once "config.php";

// Send JSON response
function sendJson(int $status, array $data = []): never
{
    http_response_code($status);
    header("Content-Type: application/json; charset=utf-8");
    header("Cache-Control: no-store");

    if ($status !== 204) {
        echo  json_encode($data);
    }

    exit;
}

// Get current scope
function getScope(): string 
{
    $scope = $_GET["scope"] ?? "personal";

    if (!in_array($scope, ["personal", "shared"], true)) {
        sendJson(400, ["error" => "Invalid scope"]);
    }

    return $scope;
}

// Read JSON request body
function getJsonBody(): array
{
    $raw = file_get_contents("php://input");
    $data= json_decode($raw, true);

    if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE || array_is_list($data)) {
        sendJson(400, ["error" => "Invalid JSON body"]);
    }

    return $data;
}

// Get request data
function getRequestData(): array
{
    $contentType = $_SERVER["CONTENT_TYPE"] ?? "";

    if (str_contains(strtolower($contentType), "application/json")) {
        return getJsonBody();
    }

    return $_POST;
}

// Validate task title
function getTitle(array $data): string
{
    if (!isset($data["title"]) || !is_string($data["title"])) {
        sendJson(422, ["error" => "Title is required"]);
    }

    $title = trim($data["title"]);

    if ($title === "" || mb_strlen($title, "UTF-8") > 150) {
        sendJson(422, ["error" => "Title must contain 1 to 150 characters"]);
    }

    return $title;
}

// Validate task description
function getDescription(array $data): string
{
    $description = $data["description"] ?? "";

    if (!is_string($description)) {
        sendJson(422, ["error" => "Invalid description"]);
    }

    return trim($description);
}

// Validate date input
function getDateValue($value): ?string
{
    if ($value === null || $value === "") {
        return null;
    }

    if (!is_string($value)) {
        sendJson(422, ["error" => "Invalid date"]);
    }

    $date = DateTime::createFromFormat("!Y-m-d\TH:i", $value);

    if (!$date || $date->format("Y-m-d\TH:i") !== $value) {
        sendJson(422, ["error" => "Date format must be YYYY-MM-DDTHH:mm"]);
    }

    return $date->format("Y-m-d H:i:s");
}

// Save the uploaded task image
function saveTaskImage(): ?string
{
    if (!isset($_FILES["image"]) || $_FILES["image"]["error"] === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    $file = $_FILES["image"];

    if ($file["error"] !== UPLOAD_ERR_OK) {
        sendJson(422, ["error" => "Image upload failed"]);
    }

    if ($file["size"] > 5 * 1024 * 1024) {
        sendJson(422, ["error" => "Maximum image size is 5 MB"]);
    }

    $fileInfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $fileInfo->file($file["tmp_name"]);

    $allowedTypes = ["image/jpeg" => "jpg", "image/png" => "png", "image/gif" => "gif", "image/webp" => "webp"];

    if (!isset($allowedTypes[$mimeType])) {
        sendJson(422, ["error" => "Image must be JPG, PNG, GIF, or WebP"]);
    }

    $uploadFolder = __DIR__ . DIRECTORY_SEPARATOR . "uploads";

    if (!is_dir($uploadFolder)) {
        if (!mkdir($uploadFolder, 0755, true)) {
            throw new RuntimeException("Cannot create upload folder");
        }
    }

    $fileName = bin2hex(random_bytes(16)) . "." . $allowedTypes[$mimeType];

    $destination = $uploadFolder . DIRECTORY_SEPARATOR . $fileName;

    if (!move_uploaded_file($file["tmp_name"], $destination)) {
        throw new RuntimeException("Cannot save image");
    }

    return "uploads/" . $fileName;
}

// Delete an old task image
function deleteTaskImage(?string $imagePath): void
{
    if (!$imagePath || !preg_match('~^uploads/[a-f0-9]{32}\.(jpg|png|gif|webp)$~', $imagePath)) {
        return;
    }

    $filePath = __DIR__ . DIRECTORY_SEPARATOR . str_replace("/", DIRECTORY_SEPARATOR, $imagePath);

    if (is_file($filePath)) {
        unlink($filePath);
    }
}

// Get selected task
function findTask(PDO $pdo, int $id, string $scope): array
{
    $query = $pdo->prepare(
        "SELECT * FROM tasks
        WHERE id = :id AND scope = :scope"
    );

    $query->execute([
        "id" => $id,
        "scope" => $scope
    ]);

    $task = $query->fetch();

    if (!$task) {
        sendJson(404, ["error" => "Task not found"]);
    }

    return $task;
}

// Get request method and parameters
$method = $_SERVER["REQUEST_METHOD"];
$scope = getScope();
$id = null;

if (isset($_GET["id"])) {
    $id = filter_var($_GET["id"], FILTER_VALIDATE_INT);

    if ($id === false || $id < 1) {
        sendJson(400, ["error" => "Invalid task ID"]);
    }
}

try {
    // Get task list or selected task
    if ($method === "GET") {

        if ($id !== null) {
            sendJson(200, ["data" => findTask($pdo, $id, $scope)]);
        }

        $query = $pdo->prepare(
            "SELECT * FROM tasks
            WHERE scope = :scope
            ORDER BY due_date ASC NULLS LAST, id DESC"
        );

        $query->execute(["scope" => $scope]);

        sendJson(200, ["data" => $query->fetchAll()]);
    }

    // Create a new task
    if ($method === "POST" && $id === null) {

        $data = getRequestData();

        $title = getTitle($data);
        $description = getDescription($data);
        $dueDate = getDateValue($data["due_date"] ?? null);
        $notificationTime = getDateValue($data["notification_time"] ?? null);

        $newImagePath = saveTaskImage();

        try {
            $query = $pdo->prepare(
                "INSERT INTO tasks
                    (title, description, due_date,
                    notification_time, scope, image_path)
                VALUES
                    (:title, :description, :due_date,
                    :notification_time, :scope, :image_path)
                RETURNING id"
            );

            $query->execute([
                "title" => $title,
                "description" => $description,
                "due_date" => $dueDate,
                "notification_time" => $notificationTime,
                "scope" => $scope,
                "image_path" => $newImagePath
            ]);

            $newId = (int) $query->fetchColumn();

        } catch (Throwable $error) {
            deleteTaskImage($newImagePath);
            throw $error;
        }

        sendJson(201, ["message" => "Task created", "data" => findTask($pdo, $newId, $scope)]);
    }

    // Upload or replace task image
    if ($method === "POST" && $id !== null && ($_GET["image"] ?? "") === "1") {
        $oldTask = findTask($pdo, $id, $scope);

        if (!isset($_FILES["image"])) {
            sendJson(422, ["error" => "Image is required"]);
        }

        $newImagePath = saveTaskImage();

        if ($newImagePath === null) {
            sendJson(422, ["error" => "Image is required"]);
        }

        try {
            $query = $pdo->prepare(
                "UPDATE tasks
                SET image_path = :image_path
                WHERE id = :id AND scope = :scope"
            );

            $query->execute([
                "image_path" => $newImagePath,
                "id" => $id,
                "scope" => $scope
            ]);

        } catch (Throwable $error) {
            deleteTaskImage($newImagePath);
            throw $error;
        }

        deleteTaskImage($oldTask["image_path"]);

        sendJson(200, [
            "message" => "Image updated",
            "data" => findTask($pdo, $id, $scope)
        ]);
    }

    // Update an existing task
    if ($method === "PUT" && $id !== null) {

        findTask($pdo, $id, $scope);

        $data = getJsonBody();

        $title = getTitle($data);
        $description = getDescription($data);
        $dueDate = getDateValue($data["due_date"] ?? null);
        $notificationTime = getDateValue($data["notification_time"] ?? null);

        $query = $pdo->prepare(
            "UPDATE tasks
            SET title = :title,
                description = :description,
                due_date = :due_date,
                notification_time = :notification_time
            WHERE id = :id AND scope = :scope"
        );

        $query->execute([
            "title" => $title,
            "description" => $description,
            "due_date" => $dueDate,
            "notification_time" => $notificationTime,
            "id" => $id,
            "scope" => $scope
        ]);

        sendJson(200, ["message" => "Task updated", "data" => findTask($pdo, $id, $scope)]);
    }

    // Update task completion status
    if ($method === "PATCH" && $id !== null) {

        findTask($pdo, $id, $scope);

        $data = getJsonBody();

        if (!array_key_exists("is_completed", $data) || !is_bool($data["is_completed"])) {
            sendJson(422, ["error" => "is_completed must be true or false"]);
        }

        $query = $pdo->prepare(
            "UPDATE tasks
            SET is_completed = :is_completed
            WHERE id = :id AND scope = :scope"
        );

        $query->execute([
            "is_completed" => $data["is_completed"] ? "true" : "false",
            "id" => $id,
            "scope" => $scope
        ]);

        sendJson(200, [
            "message" => "Task status updated",
            "data" => findTask($pdo, $id, $scope)
        ]);
    }

    // Remove task image
    if ($method === "DELETE" && $id !== null && ($_GET["image"] ?? "") === "1") {
        $oldTask = findTask($pdo, $id, $scope);

        $query = $pdo->prepare(
            "UPDATE tasks
            SET image_path = NULL
            WHERE id = :id AND scope = :scope"
        );

        $query->execute([
            "id" => $id,
            "scope" => $scope
        ]);

        deleteTaskImage($oldTask["image_path"]);

        sendJson(204);
    }

    // Delete a task
    if ($method === "DELETE" && $id !== null) {

        $oldTask = findTask($pdo, $id, $scope);

        $query = $pdo->prepare(
            "DELETE FROM tasks
            WHERE id = :id AND scope = :scope"
        );

        $query->execute([
            "id" => $id,
            "scope" => $scope
        ]);

        deleteTaskImage($oldTask["image_path"]);

        sendJson(204);
    }

    // Handle unsupported request method
    header("Allow: GET, POST, PUT, PATCH, DELETE");

    sendJson(405, ["error" => "Method not allowed"]);

} catch (Throwable $error) {

    error_log($error->getMessage());

    sendJson(500, ["error" => "Internal server error"]);
}