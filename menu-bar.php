<?php
$currentScope = $_GET["scope"] ?? "personal";

if (!in_array($currentScope, ["personal", "shared"], true)) {
    $currentScope = "personal";
}
?>

<nav class="scope-menu" aria-label="Task lists">
    <a
        href="index.php?scope=personal"
        class="scope-button <?= $currentScope === "personal" ? "active" : "" ?>"
    >
        Personal
    </a>

    <a
        href="index.php?scope=shared"
        class="scope-button <?= $currentScope === "shared" ? "active" : "" ?>"
    >
        Shared
    </a>
</nav>