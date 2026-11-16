"use strict";

// Theme
const themeButton = document.querySelector("#themeButton");
const themeKey = "todo-e04-theme-v1";

if (localStorage.getItem(themeKey) === "dark") {
    document.body.classList.add("dark-mode");

    if (themeButton) {
        themeButton.setAttribute("aria-pressed", "true");
    }
}

if (themeButton) {
    themeButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        const isDark = document.body.classList.contains("dark-mode");

        themeButton.setAttribute("aria-pressed", String(isDark));

        localStorage.setItem(themeKey, isDark ? "dark" : "light");
    });
}

// Image
const imageInput = document.querySelector("#newImage");
const imagePreview = document.querySelector("#imagePreview");
const cameraPreview = document.querySelector("#cameraPreview");
const startCameraButton = document.querySelector("#startCameraButton");
const captureButton = document.querySelector("#captureButton");

let cameraStream = null;
let previewUrl = null;

function showImagePreview(file) {
    if (!file || !file.type.startsWith("image/")) {
        alert("Please select an image file.");

        if (imageInput) {
            imageInput.value = "";
        }

        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Maximum image size is 5 MB.");

        if (imageInput) {
            imageInput.value = "";
        }
        
        return;
    }

    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }

    previewUrl = URL.createObjectURL(file);
    imagePreview.src = previewUrl;
    imagePreview.classList.remove("hidden");
}

if (imageInput && imagePreview) {
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];

        if (file) {
            showImagePreview(file);
            stopCamera();
        }
    });
}

// Camera
async function openCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera is not supported by this browser.");
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false
        });

        cameraPreview.srcObject = cameraStream;
        cameraPreview.classList.remove("hidden");

        captureButton.disabled = false;
        startCameraButton.textContent = "Close Camera";
    } catch (error) {
        alert("Unable to open camera. Allow camera access or select an image.");
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }

    cameraStream = null;

    if (cameraPreview) {
        cameraPreview.srcObject = null;
        cameraPreview.classList.add("hidden");
    }

    if (captureButton) {
        captureButton.disabled = true;
    }

    if (startCameraButton) {
        startCameraButton.textContent = "Open Camera";
    }
}

if (startCameraButton && cameraPreview && captureButton) {
    startCameraButton.addEventListener("click", () => {
        if (cameraStream) {
            stopCamera();
        } else {
            openCamera();
        }
    });

    captureButton.addEventListener("click", () => {
        if (!cameraStream || !cameraPreview.videoWidth) {
            return;
        }

        const canvas = document.createElement("canvas");

        canvas.width = cameraPreview.videoWidth;
        canvas.height = cameraPreview.videoHeight;

        const context = canvas.getContext("2d");

        context.drawImage(
            cameraPreview,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(blob => {
            if (!blob) {
                alert("Failed to capture image.");
                return;
            }

            const imageFile = new File([blob], "task-image.jpg", {
                type: "image/jpeg"
            });

            const fileTransfer = new DataTransfer();

            fileTransfer.items.add(imageFile);
            imageInput.files = fileTransfer.files;

            showImagePreview(imageFile);
            stopCamera();
        }, "image/jpeg", 0.85);
    });
}

 // REST API
const apiUrl = "api.php";

// Send API request
async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        let message = `HTTP error ${response.status}`;

        try {
            const result = await response.json();
            message = result.error || message;
        } catch (error) {
            // Keep the HTTP error message.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// Get task URL
function getTaskUrl(id, scope) {
    return `${apiUrl}?id=${encodeURIComponent(id)}` + `&scope=${encodeURIComponent(scope)}`;
}

// Update page content without reloading
let contentRequestId = 0;

async function loadTaskPage(url, updateHistory = false) {
    const requestId = ++contentRequestId;

    const response = await fetch(url, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to load task content.");
    }

    const html = await response.text();
    const parser = new DOMParser();
    const newDocument = parser.parseFromString(html, "text/html");

    const newMain = newDocument.querySelector(".main-grid");
    const currentMain = document.querySelector(".main-grid");

    if (!newMain || !currentMain) {
        throw new Error("Task content not found.");
    }

    // Ignore outdated responses
    if (requestId !== contentRequestId) {
        return;
    }

    currentMain.replaceWith(newMain);

    const pageUrl = new URL(url, window.location.href);
    const scope = pageUrl.searchParams.get("scope") || "personal";

    // Update active menu
    document.querySelectorAll(".scope-button").forEach(button => {
        const buttonUrl = new URL(button.href);
        const buttonScope = buttonUrl.searchParams.get("scope");

        const active = buttonScope === scope;

        button.classList.toggle("active", active);

        if (active) {
            button.setAttribute("aria-current", "page");
        } else {
            button.removeAttribute("aria-current");
        }
    });

    // Update create form scope
    const scopeInput = document.querySelector('#createTaskForm [name="scope"]');

    if (scopeInput) {
        scopeInput.value = scope;
    }

    if (updateHistory) {
        window.history.pushState({}, "", pageUrl.href);
    }
}

// Handle menu and task navigation
document.addEventListener("click", async event => {
    const scopeButton = event.target.closest(".scope-button");
    const taskLink = event.target.closest('.todo-card a[href*="task="]');
    const taskCard = event.target.closest(".todo-card[data-task-url]");

    let url = null;
    let showDetail = false;

    if (scopeButton) {
        url = scopeButton.href;
    } else if (taskLink) {
        url = taskLink.href;
        showDetail = true;
    } else if (taskCard && !event.target.closest("button, input, form, label, a")) {
        url = taskCard.dataset.taskUrl;
        showDetail = true;
    }

    if (!url) {
        return;
    }

    event.preventDefault();

    try {
        await loadTaskPage(url, true);

        if (showDetail) {
            document.querySelector("#taskDetail") ?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
        }

    } catch (error) {
        alert("Failed to load task: " + error.message);
    }
});

// Create and update tasks
document.addEventListener("submit", async event => {
    const form = event.target;

    if (!form.matches("#createTaskForm") && !form.matches("#editTaskForm")) {
        return;
    }

    event.preventDefault();

    const formData = new FormData(form);
    const scope = formData.get("scope") || "personal";
    const isCreate = form.id === "createTaskForm";

    const button = form.querySelector('button[type="submit"]');

    if (button.disabled) {
        return;
    }

    button.disabled = true;

    try {
        if (isCreate) {
            // Create a new task
            await apiRequest(`${apiUrl}?scope=${encodeURIComponent(scope)}`,
                {
                    method: "POST",
                    body: formData
                }
            );

            form.reset();

            const scopeUrl = `index.php?scope=${encodeURIComponent(scope)}`;

            await loadTaskPage(scopeUrl, true);

        } else {
            // Update an existing task
            const id = formData.get("id");
            const url = getTaskUrl(id, scope);

            const taskData = {
                title: formData.get("title"),
                description: formData.get("description"),
                due_date: formData.get("due_date"),
                notification_time: formData.get("notification_time")
            };

            await apiRequest(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(taskData)
            });

            // Update task image
            const image = form.querySelector("#editImage")?.files[0];
            const removeImage = formData.has("remove_image");

            if (image) {
                const imageData = new FormData();
                imageData.append("image", image);

                await apiRequest(`${url}&image=1`, {
                    method: "POST",
                    body: imageData
                });

            } else if (removeImage) {
                await apiRequest(`${url}&image=1`, {
                    method: "DELETE"
                });
            }

            await loadTaskPage(window.location.href);
        }

    } catch (error) {
        alert("Failed to save task: " + error.message);

    } finally {
        button.disabled = false;
    }
});

// Update task completion status
document.addEventListener("change", async event => {
    const checkbox = event.target;

    if (!checkbox.matches(".complete-checkbox")) {
        return;
    }

    const form = checkbox.closest(".complete-form");
    const id = form.querySelector('[name="id"]').value;
    const scope = form.querySelector('[name="scope"]').value;
    const completed = checkbox.checked;

    checkbox.disabled = true;

    try {
        await apiRequest(getTaskUrl(id, scope), {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                is_completed: completed
            })
        });

        await loadTaskPage(window.location.href);

    } catch (error) {
        checkbox.checked = !completed;
        alert("Failed to update status: " + error.message);

    } finally {
        checkbox.disabled = false;
    }
});

// Delete a task
document.addEventListener("submit", async event => {
    const form = event.target;

    if (!form.matches(".delete-form")) {
        return;
    }

    event.preventDefault();

    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    const id = form.querySelector('[name="id"]').value;
    const scope = form.querySelector('[name="scope"]').value;
    const button = form.querySelector('button[type="submit"]');

    button.disabled = true;

    try {
        await apiRequest(getTaskUrl(id, scope), {
            method: "DELETE"
        });

        const scopeUrl = `index.php?scope=${encodeURIComponent(scope)}`;

        await loadTaskPage(scopeUrl, true);

    } catch (error) {
        alert("Failed to delete task: " + error.message);

    } finally {
        button.disabled = false;
    }
});

// Prevent old checkbox forms from submitting
document.addEventListener("submit", event => {
    if (event.target.matches(".complete-form")) {
        event.preventDefault();
    }
});

// Handle browser Back and Forward
window.addEventListener("popstate", async () => {
    try {
        await loadTaskPage(window.location.href);

    } catch (error) {
        alert("Failed to load task: " + error.message);
    }
});

// PWA installation
const installButton = document.querySelector("#installButton");

let deferredInstallPrompt = null;

// True when the page is running as an installed app (no browser address bar).
const isInstalledApp =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

if (installButton) {
    installButton.hidden = true;

    if (!isInstalledApp) {
        window.addEventListener("beforeinstallprompt", event => {
            event.preventDefault();

            deferredInstallPrompt = event;
            installButton.hidden = false;
        });

        installButton.addEventListener("click", async () => {
            if (!deferredInstallPrompt) {
                return;
            }

            deferredInstallPrompt.prompt();

            const choice = await deferredInstallPrompt.userChoice;

            if (choice.outcome === "accepted") {
                installButton.hidden = true;
            }

            deferredInstallPrompt = null;
        });
    }

    window.addEventListener("appinstalled", () => {
        installButton.hidden = true;
        deferredInstallPrompt = null;
    });
}

// Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            await navigator.serviceWorker.register("./service-worker.js");
            console.log("Service Worker registered successfully.");
        } catch (error) {
            console.error("Service Worker registration failed:", error);
        }
    });
}

// Clean up camera when leaving the page.
window.addEventListener("beforeunload", () => {
    stopCamera();

    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }
});