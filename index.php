<?php
/* Scope */
$currentScope = $_GET["scope"] ?? "personal";

if (!in_array($currentScope, ["personal", "shared"], true)) {
    $currentScope = "personal";
}
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Todo List application">
    <title>Todo List</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <div class="app-shell">
        <header class="topbar">
            <h1>Todo List</h1>
            <button
                id="themeButton"
                class="icon-button"
                type="button"
                aria-label="Ganti tema"
            >☼</button>
        </header>

        <?php include "menu-bar.php"; ?>

        <?php include "content.php"; ?>

        <section class="panel create-panel">
            <h2>Create New Task</h2>

            <form
                action="task-actions.php"
                method="post"
                enctype="multipart/form-data"
                class="create-form"
            >
                <input type="hidden" name="action" value="create">
                <input
                    type="hidden"
                    name="scope"
                    value="<?= htmlspecialchars($currentScope, ENT_QUOTES, "UTF-8") ?>"
                >

                <label class="sr-only" for="newTitle">Title</label>
                <input
                    id="newTitle"
                    name="title"
                    required
                    maxlength="150"
                    placeholder="Title"
                >

                <label class="sr-only" for="newDescription">Description</label>
                <input
                    id="newDescription"
                    name="description"
                    placeholder="Description"
                >

                <label class="sr-only" for="newDueDate">Due Date</label>
                <input
                    id="newDueDate"
                    name="due_date"
                    type="datetime-local"
                >

                <button class="primary-button add-button" type="submit">
                    Add Task
                </button>

                <details class="extra-options create-extra">
                    <summary>Reminder and image options</summary>

                    <label for="newNotificationTime">Notification Time</label>
                    <input
                        id="newNotificationTime"
                        name="notification_time"
                        type="datetime-local"
                    >

                    <div class="image-tools">
                        <label class="file-button" for="newImage">Add Image</label>
                        <input
                            id="newImage"
                            name="image"
                            type="file"
                            accept="image/*"
                            hidden
                        >

                        <button
                            id="startCameraButton"
                            class="secondary-button"
                            type="button"
                        >
                            Open Camera
                        </button>

                        <button
                            id="captureButton"
                            class="secondary-button"
                            type="button"
                            disabled
                        >
                            Capture Image
                        </button>
                    </div>

                    <video
                        id="cameraPreview"
                        class="camera-preview hidden"
                        autoplay
                        playsinline
                    ></video>

                    <img
                        id="imagePreview"
                        class="image-preview hidden"
                        alt="Preview of task image"
                    >
                </details>
            </form>
        </section>

        <footer>[E04] The Iron Citadel</footer>
    </div>

    <script src="script.js"></script>
</body>
</html>