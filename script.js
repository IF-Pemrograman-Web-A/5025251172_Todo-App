"use strict";

/* Theme */
const themeButton = document.querySelector("#themeButton");
const themeKey = "todo-e03-theme-v1";

if (localStorage.getItem(themeKey) === "dark") {
    document.body.classList.add("dark-mode");
    themeButton.textContent = "☾";
}

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");
    themeButton.textContent = isDark ? "☾" : "☼";
    localStorage.setItem(themeKey, isDark ? "dark" : "light");
});

/* Image */
const imageInput = document.querySelector("#newImage");
const imagePreview = document.querySelector("#imagePreview");
const cameraPreview = document.querySelector("#cameraPreview");
const startCameraButton = document.querySelector("#startCameraButton");
const captureButton = document.querySelector("#captureButton");

let cameraStream = null;
let previewUrl = null;

function showImagePreview(file) {
    if (!file || !file.type.startsWith("image/")) {
        alert("Pilih file gambar.");
        imageInput.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 5 MB.");
        imageInput.value = "";
        return;
    }

    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }

    previewUrl = URL.createObjectURL(file);
    imagePreview.src = previewUrl;
    imagePreview.classList.remove("hidden");
}

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (file) {
        showImagePreview(file);
        stopCamera();
    }
});

/* Camera */
async function openCamera() {
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
        alert("Kamera tidak bisa dibuka. Izinkan akses kamera atau pilih gambar.");
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }

    cameraStream = null;
    cameraPreview.srcObject = null;
    cameraPreview.classList.add("hidden");
    captureButton.disabled = true;
    startCameraButton.textContent = "Open Camera";
}

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
    context.drawImage(cameraPreview, 0, 0);

    canvas.toBlob(blob => {
        if (!blob) {
            alert("Foto gagal diambil.");
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

/* Task detail */
document.querySelectorAll(".todo-card[data-task-url]").forEach(card => {
    card.addEventListener("click", event => {
        if (event.target.closest("a, button, input, form, label")) {
            return;
        }

        window.location.href = card.dataset.taskUrl;
    });
});

window.addEventListener("beforeunload", stopCamera);