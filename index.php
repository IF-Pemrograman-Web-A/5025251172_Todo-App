<?php
$currentScope = $_GET["scope"] ?? "personal";

if (!in_array($currentScope, ["personal", "shared"], true)) {
    $currentScope = "personal";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta name="description" content="A Todo List application to organize and manage your tasks.">
    <meta name="theme-color" content="#b72334">

    <title>Todo List</title>

    <link rel="manifest" href="manifest.json">
    <link rel="stylesheet" href="style.css">

    <style>
        .icon-button {
            display: grid;
            place-items: center;
            padding: 0;
        }

        .theme-icon {
            grid-area: 1 / 1;
            width: 28px;
            height: 28px;
        }

        .icon-moon,
        body.dark-mode .icon-sun {
            display: none;
        }

        body.dark-mode .icon-moon {
            display: block;
        }
    </style>
</head>

<body>
    <div class="app-shell">

        <header class="topbar">
            <h1>Todo List</h1>

            <div class="header-actions">
                <button
                    id="installButton"
                    class="secondary-button"
                    type="button"
                    hidden
                >
                    Install App
                </button>

                <button
                    id="themeButton"
                    class="icon-button"
                    type="button"
                    aria-label="Toggle dark mode"
                    aria-pressed="false"
                >
                    <svg class="theme-icon icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="4.2" />
                        <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.85 1.85M16.85 16.85l1.85 1.85M18.7 5.3l-1.85 1.85M7.15 16.85L5.3 18.7" />
                    </svg>

                    <svg class="theme-icon icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
                    </svg>
                </button>
            </div>
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
                        <label class="file-button" for="newImage">
                            Add Image
                        </label>

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

        <footer>[E05] The Offline Abyss</footer>

    </div>

    <script src="script.js" defer></script>
</body>
</html>