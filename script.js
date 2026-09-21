let todos = [
    {
        id: 2,
        title: "Tugas 2 KKA",
        description: "8 - Puzzle",
        dueDate: "2026-09-14T07:00",
        completed: false
    },
    {
        id: 1,
        title: "Tugas 1 Pemrograman Web",
        description: "Create a Todo List Webpage",
        dueDate: "2026-09-14T20:00",
        completed: false
    },
    {
        id: 3,
        title: "Tugas 1 Matematika Diskrit",
        description: "Discrete Mathematics and Its Applications, 7th",
        dueDate: "2026-09-17T00:00",
        completed: false
    }
];

let selectedTodoId = null;
const todoContainer = document.getElementById("todoContainer");
const todoForm = document.getElementById("todoForm");
const themeButton = document.getElementById("themeButton");
const emptyDetail = document.getElementById("emptyDetail");
const detailForm = document.getElementById("detailForm");
const editTitle = document.getElementById("editTitle");
const editDescription = document.getElementById("editDescription");
const editDueDate = document.getElementById("editDueDate");
const saveButton = document.getElementById("saveButton");

/* DISPLAY TODO */
function displayTodos(){

    todoContainer.innerHTML = "";

    const sortedTodos = [...todos].sort(function(a, b){
            return new Date(a.dueDate) - new Date(b.dueDate);
        });

    sortedTodos.forEach(function(todo){
        const todoItem = document.createElement("div");
        todoItem.classList.add("todo-item");

        if (todo.completed){
            todoItem.classList.add("completed");
        }

        todoItem.dataset.id = todo.id;
        todoItem.innerHTML = `

            <input
                type="checkbox"
                class="complete-checkbox"
                data-id="${todo.id}"
                ${todo.completed ? "checked" : ""}
            >

            <h3> ${todo.title} </h3>
            <p> ${todo.description} </p>

            <div class="todo-date">

                <span>

                    <svg viewBox="0 0 24 24">

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

                    <svg viewBox="0 0 24 24">

                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                        ></circle>

                        <polyline points="12,7 12,12 16,14"></polyline>

                    </svg>

                    ${formatTime(todo.dueDate)}

                </span>

            </div>

            <div class="todo-actions">

                <button
                    type="button"
                    class="edit-button"
                    data-id="${todo.id}"
                    aria-label="Edit task"
                >

                    <svg viewBox="0 0 24 24">

                        <path d="M4 20h4L19 9l-4-4L4 16v4z"></path>

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
                    aria-label="Delete task"
                >

                    <svg viewBox="0 0 24 24">

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
        todoContainer.appendChild(todoItem);
    });
    addButtonEvents();
}

/* FORMAT DATE */
function formatDate(date){
    const dateObject = new Date(date);
    const monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
        });

    if (!todo){
        return;
    }

    selectedTodoId = id;

    editTitle.value = todo.title;
    editDescription.value = todo.description;
    editDueDate.value = todo.dueDate;
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
    });

    /* EDIT */
    const editButtons = document.querySelectorAll(".edit-button");

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
                    }

                    displayTodos();
                }
            );

        }
    );
}

/* ADD TASK */
todoForm.addEventListener("submit", function(event){

        event.preventDefault();
        const title = document.getElementById("newTitle").value;
        const description = document.getElementById("newDescription").value;
        const dueDate = document.getElementById("newDueDate").value;
        const newTodo = {
            id: Date.now(),
            title: title,
            description: description,
            dueDate: dueDate,
            completed: false
        };

        todos.push(newTodo);
        displayTodos();
        todoForm.reset();
    }
);

/* SAVE CHANGES */
saveButton.addEventListener("click", function(){

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

        todo.title = editTitle.value;
        todo.description = editDescription.value; 
        todo.dueDate = editDueDate.value;
        displayTodos();
    }
);

/* DARK MODE */
themeButton.addEventListener("click", function(){
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")){

            themeButton.innerHTML = `

                <svg viewBox="0 0 24 24">

                    <path d="
                            M21 15.5
                            A9 9 0 0 1 8.5 3
                            A9 9 0 1 0 21 15.5z
                        "
                    ></path>

                </svg>

            `;

        } else {

            themeButton.innerHTML = `

                <svg viewBox="0 0 24 24">

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
);

displayTodos();