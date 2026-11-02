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

// Task detail
document.querySelectorAll(".todo-card[data-task-url]").forEach(card => {
    card.addEventListener("click", event => {
        if (event.target.closest("a, button, input, form, label")) {
            return;
        }

        window.location.href = card.dataset.taskUrl;
    });
});

// PWA installation
const installButton = document.querySelector("#installButton");

let deferredInstallPrompt = null;

if (installButton) {
    installButton.hidden = true;

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