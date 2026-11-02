<?php
require_once "config.php";

// Return to the task list.
function returnToList(string $scope): never
{
    if (!in_array($scope, ["personal", "shared"], true)) {
        $scope = "personal";
    }

    header("Location: index.php?scope=" . urlencode($scope));
    exit;
}

// Save the uploaded task image.
function saveTaskImage(): ?string
{
    if (
        !isset($_FILES["image"]) ||
        $_FILES["image"]["error"] === UPLOAD_ERR_NO_FILE
    ) {
        return null;
    }

    $file = $_FILES["image"];

    if ($file["error"] !== UPLOAD_ERR_OK) {
        throw new RuntimeException("Gambar gagal diunggah.");
    }

    if ($file["size"] > 5 * 1024 * 1024) {
        throw new RuntimeException("Ukuran gambar maksimal 5 MB.");
    }

    $fileInfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $fileInfo->file($file["tmp_name"]);

    $allowedTypes = [
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/gif" => "gif",
        "image/webp" => "webp"
    ];

    if (!isset($allowedTypes[$mimeType])) {
        throw new RuntimeException(
            "Format gambar harus JPG, PNG, GIF, atau WebP."
        );
    }

    $uploadFolder = __DIR__ . DIRECTORY_SEPARATOR . "uploads";

    if (!is_dir($uploadFolder)) {
        if (!mkdir($uploadFolder, 0755, true)) {
            throw new RuntimeException("Folder uploads tidak bisa dibuat.");
        }
    }

    $fileName = bin2hex(random_bytes(16)) . "." . $allowedTypes[$mimeType];

    $destination = $uploadFolder . DIRECTORY_SEPARATOR . $fileName;

    if (!move_uploaded_file($file["tmp_name"], $destination)) {
        throw new RuntimeException("Gambar tidak bisa disimpan.");
    }

    return "uploads/" . $fileName;
}

// Delete an old task image.
function deleteTaskImage(?string $imagePath): void
{
    if (!$imagePath || !str_starts_with($imagePath, "uploads/")) {
        return;
    }

    $filePath = __DIR__ . DIRECTORY_SEPARATOR .
        str_replace("/", DIRECTORY_SEPARATOR, $imagePath);

    if (is_file($filePath)) {
        unlink($filePath);
    }
}

// Check the request method.
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    returnToList("personal");
}

// Get form data.
$action = $_POST["action"] ?? "";
$scope = $_POST["scope"] ?? "personal";

if (!in_array($scope, ["personal", "shared"], true)) {
    $scope = "personal";
}

$newImagePath = null;

try {
    if ($action === "create") {
        // Create a new task.
        $title = trim($_POST["title"] ?? "");

        if ($title === "") {
            throw new RuntimeException("Judul tugas harus diisi.");
        }

        $description = trim($_POST["description"] ?? "");
        $dueDate = str_replace("T", " ", $_POST["due_date"] ?? "");
        $notificationTime = str_replace(
            "T",
            " ",
            $_POST["notification_time"] ?? ""
        );

        $newImagePath = saveTaskImage();

        $query = $pdo->prepare(
            "INSERT INTO tasks
                (title, description, due_date, notification_time, scope, image_path)
            VALUES
                (:title, :description, :due_date, :notification_time, :scope, :image_path)"
        );

        $query->execute([
            "title" => $title,
            "description" => $description,
            "due_date" => $dueDate !== "" ? $dueDate : null,
            "notification_time" => $notificationTime !== "" ? $notificationTime : null,
            "scope" => $scope,
            "image_path" => $newImagePath
        ]);

    } elseif ($action === "update") {
        // Update an existing task.
        $id = (int) ($_POST["id"] ?? 0);
        $title = trim($_POST["title"] ?? "");

        if ($id < 1 || $title === "") {
            throw new RuntimeException("Tugas atau judul tidak valid.");
        }

        $findQuery = $pdo->prepare(
            "SELECT image_path FROM tasks
            WHERE id = :id AND scope = :scope"
        );

        $findQuery->execute([
            "id" => $id,
            "scope" => $scope
        ]);

        $oldTask = $findQuery->fetch();

        if (!$oldTask) {
            throw new RuntimeException("Tugas tidak ditemukan.");
        }

        $oldImagePath = $oldTask["image_path"];
        $newImagePath = saveTaskImage();
        $removeImage = isset($_POST["remove_image"]);

        $imagePath = $newImagePath
            ?? ($removeImage ? null : $oldImagePath);

        $dueDate = str_replace("T", " ", $_POST["due_date"] ?? "");
        $notificationTime = str_replace(
            "T",
            " ",
            $_POST["notification_time"] ?? ""
        );

        $query = $pdo->prepare(
            "UPDATE tasks
            SET title = :title,
                description = :description,
                due_date = :due_date,
                notification_time = :notification_time,
                image_path = :image_path
            WHERE id = :id AND scope = :scope"
        );

        $query->execute([
            "title" => $title,
            "description" => trim($_POST["description"] ?? ""),
            "due_date" => $dueDate !== "" ? $dueDate : null,
            "notification_time" => $notificationTime !== "" ? $notificationTime : null,
            "image_path" => $imagePath,
            "id" => $id,
            "scope" => $scope
        ]);

        if ($newImagePath || $removeImage) {
            deleteTaskImage($oldImagePath);
        }

    } elseif ($action === "delete") {
        // Delete a task.
        $id = (int) ($_POST["id"] ?? 0);

        if ($id < 1) {
            throw new RuntimeException("ID tugas tidak valid.");
        }

        $findQuery = $pdo->prepare(
            "SELECT image_path FROM tasks
             WHERE id = :id AND scope = :scope"
        );

        $findQuery->execute([
            "id" => $id,
            "scope" => $scope
        ]);

        $oldTask = $findQuery->fetch();

        $query = $pdo->prepare(
            "DELETE FROM tasks
            WHERE id = :id AND scope = :scope"
        );

        $query->execute([
            "id" => $id,
            "scope" => $scope
        ]);

        if ($oldTask) {
            deleteTaskImage($oldTask["image_path"]);
        }

    } elseif ($action === "toggle") {
        // Toggle the task completion status.
        $id = (int) ($_POST["id"] ?? 0);

        if ($id < 1) {
            throw new RuntimeException("ID tugas tidak valid.");
        }

        $query = $pdo->prepare(
            "UPDATE tasks
            SET is_completed = NOT is_completed
            WHERE id = :id AND scope = :scope"
        );

        $query->execute([
            "id" => $id,
            "scope" => $scope
        ]);

    } else {
        throw new RuntimeException("Tindakan tidak dikenal.");
    }

} catch (Throwable $error) {
    // Remove the new image if the operation fails.
    if ($newImagePath) {
        deleteTaskImage($newImagePath);
    }

    exit("Tindakan tugas gagal: " . $error->getMessage());
}

// Return to the task page.
returnToList($scope);