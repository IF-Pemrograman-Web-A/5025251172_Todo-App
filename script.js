let todos = [];
let selectedTodoId = null;

const dbName = "TodoAppDB";
const dbVersion = 1;
const storeName = "todos";

let db = null;
let cameraStream = null;
let capturedImage = null;
let serviceWorkerRegistration = null;

const notificationTimers = new Map();

const todoContainer = document.getElementById("todoContainer");
const todoForm = document.getElementById("todoForm");
const themeButton = document.getElementById("themeButton");
const emptyDetail = document.getElementById("emptyDetail");
const detailForm = document.getElementById("detailForm");

const editTitle = document.getElementById("editTitle");
const editDescription = document.getElementById("editDescription");
const editDueDate = document.getElementById("editDueDate");
const editNotificationTime = document.getElementById("editNotificationTime");
const saveButton = document.getElementById("saveButton");

const newTitle = document.getElementById("newTitle");
const newDescription = document.getElementById("newDescription");
const newDueDate = document.getElementById("newDueDate");
const newNotificationTime = document.getElementById("newNotificationTime");

const startCameraButton = document.getElementById("startCameraButton");
const captureButton = document.getElementById("captureButton");
const addImageButton = document.getElementById("addImageButton");

const imageInput = document.getElementById("imageInput");
const cameraPreview = document.getElementById("cameraPreview");
const cameraCanvas = document.getElementById("cameraCanvas");
const imagePreview = document.getElementById("imagePreview");

/* INDEXEDDB */
function openDatabase(){
    const request =
        indexedDB.open(
            dbName,
            dbVersion
        );

    request.addEventListener(
        "upgradeneeded",
        function(event){
            db = event.target.result;

            if (!db.objectStoreNames.contains(storeName)){

                db.createObjectStore(
                    storeName,
                    {
                        keyPath: "id"
                    }
                );
            }
        }
    );

    request.addEventListener("success", function(event){
            db = event.target.result;
            loadTodos();
        }
    );

    request.addEventListener("error", function(){
            console.error("Failed to open IndexedDB.");
        }
    );
}

/* LOAD TODOS */
function loadTodos(){
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.addEventListener("success", function(){
            if (request.result.length === 0){
                addInitialTodos();
            } else {
                todos = request.result;
                displayTodos();
                scheduleAllNotifications();
            }
        }
    );
}

/* INITIAL TODOS */
function addInitialTodos(){
    const initialTodos = [
        {
            id: 2,
            title: "Tugas 2 KKA",
            description: "8 - Puzzle",
            dueDate: "2026-09-14T07:00",
            notificationTime: "",
            completed: false,
            image: null
        },

        {
            id: 1,
            title: "Tugas 1 Pemrograman Web",
            description: "Create a Todo List Webpage",
            dueDate: "2026-09-14T20:00",
            notificationTime: "",
            completed: false,
            image: null
        },

        {
            id: 3,
            title: "Tugas 1 Matematika Diskrit",
            description:
                "Discrete Mathematics and Its Applications, 7th",
            dueDate: "2026-09-17T00:00",
            notificationTime: "",
            completed: false,
            image: null
        }
    ];

    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    initialTodos.forEach(function(todo){
        store.add(todo);
        }
    );

    transaction.addEventListener("complete", function(){
            todos = initialTodos;
            displayTodos();
            scheduleAllNotifications();
        }
    );
}

/* SAVE TODO TO INDEXEDDB */
function saveTodo(todo){
    if (!db){
        return;
    }

    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.put(todo);
}

/* DELETE TODO FROM INDEXEDDB */
function deleteTodo(id){
    if (!db){
        return;
    }

    const transaction = db.transaction(storeName,"readwrite");
    const store = transaction.objectStore(storeName);
    store.delete(id);
}

/* DISPLAY TODO */
function displayTodos(){
    todoContainer.innerHTML = "";

    const sortedTodos = [...todos].sort(function(a, b){
                return (new Date(a.dueDate) - new Date(b.dueDate));
            }
        );

    sortedTodos.forEach(function(todo){
            const todoItem = document.createElement("div");
            todoItem.classList.add("todo-item");

            if (todo.completed){
                todoItem.classList.add("completed");
            }

            todoItem.dataset.id = todo.id;
            todoItem.setAttribute("tabindex", "0");
            todoItem.setAttribute("role", "button");
            todoItem.setAttribute("aria-label", `Open task ${todo.title}`);

            todoItem.innerHTML = `
                <input
                    type="checkbox"
                    class="complete-checkbox"
                    data-id="${todo.id}"
                    ${todo.completed ? "checked" : ""}
                    aria-label="Mark ${escapeHTML(todo.title)} as complete"
                >

                <h3>${escapeHTML(todo.title)}</h3>

                <p>${escapeHTML(todo.description)}</p>

                <div class="todo-date">

                    <span>

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >

                            <rect
                                x="3"
                                y="4"
                                width="18"
                                height="17"
                                rx="2"
                            ></rect>

                            <line
                                x1="8"
                                y1="2"
                                x2="8"
                                y2="6"
                            ></line>

                            <line
                                x1="16"
                                y1="2"
                                x2="16"
                                y2="6"
                            ></line>

                            <line
                                x1="3"
                                y1="9"
                                x2="21"
                                y2="9"
                            ></line>

                        </svg>

                        ${formatDate(todo.dueDate)}

                    </span>

                    <span>

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >

                            <circle
                                cx="12"
                                cy="12"
                                r="9"
                            ></circle>

                            <polyline
                                points="12,7 12,12 16,14"
                            ></polyline>

                        </svg>

                        ${formatTime(todo.dueDate)}

                    </span>

                </div>

                ${
                    todo.image
                    ?
                    `
                    <img
                        src="${todo.image}"
                        class="todo-image"
                        alt="Image for task ${escapeHTML(todo.title)}"
                    >
                    `
                    :
                    ""
                }

                <div class="todo-actions">

                    <button
                        type="button"
                        class="edit-button"
                        data-id="${todo.id}"
                        aria-label="Edit task ${escapeHTML(todo.title)}"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >

                            <path
                                d="M4 20h4L19 9l-4-4L4 16v4z"
                            ></path>

                            <line
                                x1="13"
                                y1="6"
                                x2="18"
                                y2="11"
                            ></line>

                        </svg>

                    </button>


                    <button
                        type="button"
                        class="delete-button"
                        data-id="${todo.id}"
                        aria-label="Delete task ${escapeHTML(todo.title)}"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >

                            <polyline points="3,6 21,6"></polyline>

                            <path d="M8 6V4h8v2"></path>

                            <path d="M19 6l-1 15H6L5 6"></path>

                            <line
                                x1="10"
                                y1="10"
                                x2="10"
                                y2="18"
                            ></line>

                            <line
                                x1="14"
                                y1="10"
                                x2="14"
                                y2="18"
                            ></line>

                        </svg>

                    </button>

                </div>

            `;

            todoContainer.appendChild(
                todoItem
            );
        }
    );

    addButtonEvents();
}

/* ESCAPE HTML */
function escapeHTML(value){
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* FORMAT DATE */
function formatDate(date){
    const dateObject = new Date(date);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = monthNames[dateObject.getMonth()];
    const year = dateObject.getFullYear();
    return `${day} ${month} ${year}`;
}

/* FORMAT TIME */
function formatTime(date){
    const dateObject = new Date(date);
    const hours = String(dateObject.getHours()).padStart(2, "0");
    const minutes = String(dateObject.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

/* SHOW TASK DETAIL */
function showTaskDetail(id){
    const todo = todos.find(function(todo){
                return todo.id === id;
            }
        );

    if (!todo){
        return;
    }

    selectedTodoId = id;

    editTitle.value = todo.title;
    editDescription.value =  todo.description;
    editDueDate.value = todo.dueDate;
    editNotificationTime.value = todo.notificationTime || "";

    emptyDetail.classList.add("hidden");
    detailForm.classList.remove("hidden");
}

/* BUTTON EVENTS */
function addButtonEvents(){

    const todoItems = document.querySelectorAll(".todo-item");
    todoItems.forEach(function(item){
            item.addEventListener("click", function(event){
                    if (event.target.closest(".edit-button") || event.target.closest(".delete-button") || event.target.closest(".complete-checkbox")){
                        return;
                    }

                    const id = Number(item.dataset.id);
                    showTaskDetail(id);
                }
            );

            item.addEventListener("keydown", function(event){
                    if (event.key === "Enter" || event.key === " "){
                        if (event.target === item){
                            event.preventDefault();
                            const id = Number(item.dataset.id);
                            showTaskDetail(id);
                        }
                    }
                }
            );
        }
    );

    /* EDIT */
    const editButtons =document.querySelectorAll(".edit-button");
    editButtons.forEach(function(button){
                button.addEventListener("click", function(event){
                    event.stopPropagation();
                    const id = Number(button.dataset.id);
                    showTaskDetail(id);
                }
            );
        }
    );

    /* DELETE */
    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach(function(button){
            button.addEventListener("click", function(event){
                    event.stopPropagation();
                    const id = Number(button.dataset.id);
                    todos = todos.filter(function(todo){
                                return todo.id !== id;
                            }
                        );
                    deleteTodo(id);
                    clearNotificationTimer(id);
                    displayTodos();

                    if (selectedTodoId === id){
                        selectedTodoId = null;
                        detailForm.classList.add("hidden");
                        emptyDetail.classList.remove("hidden");
                    }
                }
            );
        }
    );

    /* CHECKBOX */
    const checkboxes = document.querySelectorAll(".complete-checkbox");
    checkboxes.forEach(function(checkbox){
            checkbox.addEventListener("change", function(event){
                    event.stopPropagation();
                    const id = Number(checkbox.dataset.id);
                    const todo = todos.find(function(todo){
                                return todo.id === id;
                            }
                        );

                    if (todo){
                        todo.completed = checkbox.checked;
                        saveTodo(todo);

                        if (todo.completed){
                            clearNotificationTimer(todo.id);
                        } else {
                            scheduleNotification(todo);
                        }
                    }

                    displayTodos();
                }
            );
        }
    );
}

/* ADD TASK */
todoForm.addEventListener("submit", async function(event){
        event.preventDefault();
        const title = newTitle.value.trim();
        const description = newDescription.value.trim();
        const dueDate = newDueDate.value;
        const notificationTime = newNotificationTime.value;

        if (!title || !dueDate){
            return;
        }

        if (notificationTime){
            await requestNotificationPermission();
        }

        const newTodo = {
            id: Date.now(),
            title: title,
            description: description,
            dueDate: dueDate,
            notificationTime: notificationTime,
            completed: false,
            image: capturedImage
        };

        todos.push(newTodo);
        saveTodo(newTodo);
        displayTodos();
        scheduleNotification(newTodo);

        todoForm.reset();
        clearCapturedImage();
    }
);

/* SAVE CHANGES */
saveButton.addEventListener("click", async function(){
        if (selectedTodoId === null){
            alert("Please choose a task first.");
            return;
        }

        const todo = todos.find(function(todo){
                    return todo.id === selectedTodoId;
                }
            );

        if (!todo){
            return;
        }

        todo.title = editTitle.value.trim();
        todo.description = editDescription.value.trim();
        todo.dueDate = editDueDate.value;
        todo.notificationTime = editNotificationTime.value;

        if (todo.notificationTime){
            await requestNotificationPermission();
        }

        saveTodo(todo);
        displayTodos();
        scheduleNotification(todo);
    }
);

/* DARK MODE + LOCAL STORAGE */
function setThemeIcon(){
    if (document.body.classList.contains("dark-mode")){
        themeButton.innerHTML = `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
            >

                <path d="
                    M21 15.5
                    A9 9 0 0 1 8.5 3
                    A9 9 0 1 0 21 15.5z
                "></path>

            </svg>
        `;
    } else {
        themeButton.innerHTML = `

            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
            >

                <circle
                    cx="12"
                    cy="12"
                    r="4"
                ></circle>

                <line
                    x1="12"
                    y1="2"
                    x2="12"
                    y2="5"
                ></line>

                <line
                    x1="12"
                    y1="19"
                    x2="12"
                    y2="22"
                ></line>

                <line
                    x1="2"
                    y1="12"
                    x2="5"
                    y2="12"
                ></line>

                <line
                    x1="19"
                    y1="12"
                    x2="22"
                    y2="12"
                ></line>

                <line
                    x1="4.9"
                    y1="4.9"
                    x2="7"
                    y2="7"
                ></line>

                <line
                    x1="17"
                    y1="7"
                    x2="19.1"
                    y2="4.9"
                ></line>

                <line
                    x1="17"
                    y1="17"
                    x2="19.1"
                    y2="19.1"
                ></line>

                <line
                    x1="4.9"
                    y1="19.1"
                    x2="7"
                    y2="17"
                ></line>

            </svg>
        `;
    }
}


function loadTheme(){
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark"){
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
    setThemeIcon();
}

themeButton.addEventListener("click", function(){
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")){
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
        setThemeIcon();
    }
);

/* MEDIA CAPTURE API */
startCameraButton.addEventListener("click", async function(){
        if (cameraStream){
            stopCamera();
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
            alert("Camera is not supported by this browser.");
            return;
        }

        try {
            cameraStream = await navigator.mediaDevices.getUserMedia(
                    {
                        video: true,
                        audio: false
                    }
                );


            cameraPreview.srcObject = cameraStream;

            cameraPreview.classList.remove("hidden");
            captureButton.disabled = false;
            startCameraButton.textContent = "Stop Camera";
        } catch (error){
            console.error("Camera could not be opened:", error);
            alert("Camera permission is required to capture an image.");
        }
    }
);

/* CAPTURE IMAGE */
captureButton.addEventListener("click", function(){
        if (!cameraStream){
            return;
        }

        const width = cameraPreview.videoWidth;
        const height = cameraPreview.videoHeight;

        if (width === 0 || height === 0){
            return;
        }

        cameraCanvas.width = width;
        cameraCanvas.height = height;

        const context = cameraCanvas.getContext("2d");

        context.drawImage(cameraPreview, 0, 0, width, height);

        capturedImage = cameraCanvas.toDataURL("image/jpeg", 0.8);

        imagePreview.src = capturedImage;
        imagePreview.classList.remove("hidden");
    }
);

/* ADD IMAGE FROM FILE */
addImageButton.addEventListener("click", function(){
        imageInput.click();
    }
);

imageInput.addEventListener("change", function(){
        const file = imageInput.files[0];
        if (!file){
            return;
        }

        if (!file.type.startsWith("image/")){
            alert("Please select an image file.");
            imageInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.addEventListener("load", function(){
                capturedImage = reader.result;
                imagePreview.src = capturedImage;
                imagePreview.classList.remove("hidden");
            }
        );

        reader.readAsDataURL(file);
    }
);

/* STOP CAMERA */
function stopCamera(){
    if (cameraStream){
        cameraStream
            .getTracks()
            .forEach(
                function(track){
                    track.stop();
                }
            );
    }

    cameraStream = null;
    cameraPreview.srcObject = null;
    cameraPreview.classList.add("hidden");
    captureButton.disabled = true;
    startCameraButton.textContent = "Open Camera";
}

/* CLEAR IMAGE */
function clearCapturedImage(){
    capturedImage = null;
    imagePreview.src = "";
    imagePreview.classList.add("hidden");
    imageInput.value = "";
    stopCamera();
}

/* NOTIFICATION */
async function requestNotificationPermission(){
    if (!("Notification" in window)){
        return false;
    }

    if (Notification.permission === "granted"){
        return true;
    }

    if (Notification.permission === "default"){
        const permission = await Notification.requestPermission();
        return (permission === "granted");
    }
    return false;
}

/* SCHEDULE NOTIFICATION */
function scheduleNotification(todo){
    clearNotificationTimer(todo.id);
    if (todo.completed || !todo.notificationTime){
        return;
    }

    const notificationDate = new Date(todo.notificationTime);
    const delay = notificationDate.getTime() - Date.now();

    if (delay <= 0){
        return;
    }

    const timer = setTimeout(async function(){
                const permission = await requestNotificationPermission();

                if (!permission){
                    return;
                }

                showTodoNotification(todo);

                notificationTimers.delete(todo.id);
            },
            delay
        );

    notificationTimers.set(todo.id, timer
    );
}

/* CLEAR NOTIFICATION TIMER */
function clearNotificationTimer(id){
    const timer = notificationTimers.get(id);

    if (timer){
        clearTimeout(timer);
        notificationTimers.delete(id);
    }
}

/* SCHEDULE ALL NOTIFICATIONS */
function scheduleAllNotifications(){
    todos.forEach(function(todo){
            scheduleNotification(todo);
        }
    );
}

/* SHOW NOTIFICATION */
async function showTodoNotification(todo){
    const message = `Task "${todo.title}" is due soon.`;

    if (serviceWorkerRegistration){
        await serviceWorkerRegistration.showNotification("Todo Reminder",
            {
                body: message
            }
        );

    } else if ("Notification" in window && Notification.permission === "granted"){
        new Notification("Todo Reminder",
            {
                body: message
            }
        );
    }
}

/* SERVICE WORKER */
function registerServiceWorker(){
    if (!("serviceWorker" in navigator)){
        return;
    }

    navigator.serviceWorker
        .register(
            "./sw.js"
        )
        .then(function(registration){
                serviceWorkerRegistration = registration;
                scheduleAllNotifications();
            }
        )
        .catch(
            function(error){
                console.error("Service Worker registration failed:", error);
            }
        );
}

/* INITIALIZE */
loadTheme();
openDatabase();
registerServiceWorker();