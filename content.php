<?php
/* Database */
require_once "config.php";

/* Escape */
function e04Escape($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, "UTF-8");
}

/* Status */
function e04IsCompleted($value): bool
{
    return in_array($value, [true, 1, "1", "t", "true"], true);
}

/* Date */
function e04DateValue($value): string
{
    if (!$value) {
        return "";
    }

    return date("Y-m-d\TH:i", strtotime($value));
}

/* Scope */
$currentScope = $_GET["scope"] ?? "personal";

if (!in_array($currentScope, ["personal", "shared"], true)) {
    $currentScope = "personal";
}

/* Task list */
$listQuery = $pdo->prepare(
    "SELECT * FROM tasks
     WHERE scope = :scope
     ORDER BY due_date ASC NULLS LAST, id DESC"
);
$listQuery->execute(["scope" => $currentScope]);
$tasks = $listQuery->fetchAll();

/* Selected task */
$selectedId = filter_input(INPUT_GET, "task", FILTER_VALIDATE_INT);
$selectedTask = null;

if ($selectedId) {
    $detailQuery = $pdo->prepare(
        "SELECT * FROM tasks
         WHERE id = :id AND scope = :scope"
    );
    $detailQuery->execute([
        "id" => $selectedId,
        "scope" => $currentScope
    ]);
    $selectedTask = $detailQuery->fetch();
}
?>

<main class="main-grid">
    <section class="panel tasks-panel">
        <div class="panel-heading">
            <h2 id="listHeading">Tasks</h2>
            <span id="taskCount"><?= count($tasks) ?> tasks</span>
        </div>

        <div id="todoContainer" class="todo-list" aria-live="polite">
            <?php foreach ($tasks as $task): ?>
                <?php $completed = e04IsCompleted($task["is_completed"]); ?>

                <article
                    class="todo-card<?= $completed ? " is-complete" : "" ?><?= (int) $selectedId === (int) $task["id"] ? " selected" : "" ?>"
                    data-task-url="index.php?scope=<?= e04Escape($currentScope) ?>&task=<?= (int) $task["id"] ?>#taskDetail"
                >
                    <form action="task-actions.php" method="post" class="complete-form">
                        <input type="hidden" name="action" value="toggle">
                        <input type="hidden" name="scope" value="<?= e04Escape($currentScope) ?>">
                        <input type="hidden" name="id" value="<?= (int) $task["id"] ?>">

                        <input
                            class="complete-checkbox"
                            type="checkbox"
                            aria-label="Tandai selesai"
                            <?= $completed ? "checked" : "" ?>
                            onchange="this.form.submit()"
                        >
                    </form>

                    <div class="todo-info">
                        <a
                            class="todo-title"
                            href="index.php?scope=<?= e04Escape($currentScope) ?>&task=<?= (int) $task["id"] ?>#taskDetail"
                        >
                            <?= e04Escape($task["title"]) ?>
                        </a>

                        <p class="todo-description">
                            <?= e04Escape($task["description"] ?: "Tidak ada deskripsi") ?>
                        </p>

                        <p class="todo-date">
                            <?php if ($task["due_date"]): ?>
                                <?= date("d M Y", strtotime($task["due_date"])) ?>
                                &nbsp; <?= date("H:i", strtotime($task["due_date"])) ?>
                            <?php else: ?>
                                No due date
                            <?php endif; ?>
                        </p>

                        <?php if ($task["notification_time"]): ?>
                            <p class="todo-date">
                                Reminder:
                                <?= date("d M Y H:i", strtotime($task["notification_time"])) ?>
                            </p>
                        <?php endif; ?>

                        <?php if ($task["image_path"]): ?>
                            <img
                                class="todo-thumb"
                                src="<?= e04Escape($task["image_path"]) ?>"
                                alt="Gambar tugas"
                            >
                        <?php endif; ?>
                    </div>

                    <div class="todo-actions">
                        <a
                            class="secondary-button"
                            href="index.php?scope=<?= e04Escape($currentScope) ?>&task=<?= (int) $task["id"] ?>#taskDetail"
                        >
                            Edit
                        </a>

                        <form
                            action="task-actions.php"
                            method="post"
                            onsubmit="return confirm('Hapus tugas ini?')"
                        >
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="scope" value="<?= e04Escape($currentScope) ?>">
                            <input type="hidden" name="id" value="<?= (int) $task["id"] ?>">
                            <button class="secondary-button" type="submit">Delete</button>
                        </form>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>

        <?php if (empty($tasks)): ?>
            <p id="emptyMessage" class="empty-message visible">
                No tasks yet. Add a task below.
            </p>
        <?php endif; ?>
    </section>

    <section class="panel detail-panel" id="taskDetail">
        <h2>Task Detail</h2>

        <?php if ($selectedTask): ?>
            <form
                action="task-actions.php"
                method="post"
                enctype="multipart/form-data"
                class="detail-form"
            >
                <input type="hidden" name="action" value="update">
                <input type="hidden" name="scope" value="<?= e04Escape($currentScope) ?>">
                <input type="hidden" name="id" value="<?= (int) $selectedTask["id"] ?>">

                <label for="editTitle">Title</label>
                <input
                    id="editTitle"
                    name="title"
                    value="<?= e04Escape($selectedTask["title"]) ?>"
                    required
                    maxlength="150"
                >

                <label for="editDescription">Description</label>
                <textarea id="editDescription" name="description" rows="3"><?= e04Escape($selectedTask["description"]) ?></textarea>

                <label for="editDueDate">Due Date</label>
                <input
                    id="editDueDate"
                    name="due_date"
                    type="datetime-local"
                    value="<?= e04Escape(e04DateValue($selectedTask["due_date"])) ?>"
                >

                <details class="extra-options">
                    <summary>Reminder and task options</summary>

                    <label for="editNotificationTime">Notification Time</label>
                    <input
                        id="editNotificationTime"
                        name="notification_time"
                        type="datetime-local"
                        value="<?= e04Escape(e04DateValue($selectedTask["notification_time"])) ?>"
                    >

                    <div class="image-tools">
                        <label class="file-button" for="editImage">Change Image</label>
                        <input
                            id="editImage"
                            name="image"
                            type="file"
                            accept="image/*"
                            hidden
                        >

                        <?php if ($selectedTask["image_path"]): ?>
                            <label class="check-label">
                                <input type="checkbox" name="remove_image">
                                Remove Image
                            </label>
                        <?php endif; ?>
                    </div>

                    <?php if ($selectedTask["image_path"]): ?>
                        <img
                            class="detail-image"
                            src="<?= e04Escape($selectedTask["image_path"]) ?>"
                            alt="Gambar tugas saat ini"
                        >
                    <?php endif; ?>
                </details>

                <button class="primary-button" type="submit">Save Changes</button>
            </form>
        <?php else: ?>
            <div id="emptyDetail" class="empty-detail">
                <svg class="document-icon" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M12 5h17l9 9v28H12z" />
                    <path d="M29 5v10h9M18 23h14M18 29h14M18 35h9" />
                </svg>
                <p>Select a task to see details</p>
            </div>
        <?php endif; ?>
    </section>
</main>