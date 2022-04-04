let taskAddButton = document.getElementById("task-add-button");
let tasksList = document.getElementById("tasks-list");
let taskContent = document.getElementById("task-content");
let isEmptyText = document.getElementById("is-empty");
let removeItemList = document.getElementById("remove-item-list");
let categoryDiv = document.getElementById("category-wrapper");
let taskCounterDiv = document.getElementById("task-counter");
let categoryId = 1;
let categoryColor = "white";
let categoryName = "no-category";
let taskCounter = 0;
let doneTaskCounter = 0;
let wSize = window.innerWidth;
const REST_API_ENDPOINT = 'http://localhost:8080';
const HTTP_RESPONSE_SUCCES = 200;



function showRemoveAll() {
    if (taskCounter == 0) {
        console.log(taskCounter);
        removeItemList.classList.add("hidden");

    } else if (taskCounter > 0){
        console.log(taskCounter);
        removeItemList.classList.remove("hidden");
    }
}



function emptyList() {
    if (taskCounter == 0) {
        console.log(taskCounter);
        isEmptyText.classList.remove("hidden");
    } else {
        console.log(taskCounter);
        isEmptyText.classList.add("hidden");
    }
}



taskContent.addEventListener("click", function () {
    categoryDiv.classList.remove("hidden");
});



/**
 * Questa funzione aggiorna la select delle categorie interrogando il server attraverso ajax.
 * verrà invocata subito dopo il completo caricamento della pagina.
 */
function updateCategoryList() {
    //crea oggetto di tipo XMLHttpRequest per gestire chiamaa ajax al server
    let ajaxRequest = new XMLHttpRequest();
    //gestisco onload
    ajaxRequest.onload = function() {
        //mi salvo tutte le categorie ritornate dal server in una variabile nominata 
        //categories parsando il contenuto della response attaverso JSON.parse()
        let categories = JSON.parse(ajaxRequest.response);
        //cicliamo ogni categorie all'interno dell'array gategories
        for (let categ of categories) {
            let categoryColDiv = document.createElement("div");
            categoryColDiv.classList.add("col-4");
            let categorySpan = document.createElement("span");
            categorySpan.setAttribute("value", categ.id);
            categorySpan.innerHTML = `# ` + categ.name.toUpperCase();
            categorySpan.classList.add(categ.color + "-category");
            categoryColDiv.appendChild(categorySpan);
            categoryDiv.appendChild(categoryColDiv);
            categorySpan.addEventListener("click", function() {
                categoryId = categ.id;
                categoryName = categ.name;
                categoryColor = categ.color;
            });
        }
    }
    //setto il metodo e url della request
    ajaxRequest.open("GET", REST_API_ENDPOINT + "/categories/");
    //send della richiesta.
    ajaxRequest.send();
}



updateCategoryList();



function createTask(task) {
    let newTaskLine = document.createElement("div");
    newTaskLine.classList.add("task-wrapper");
    newTaskLine.classList.add(categoryColor + "-task");

    let nameSpan = document.createElement("span");
    nameSpan.classList.add("task-text");
    nameSpan.innerText = task.name;
    newTaskLine.appendChild(nameSpan);

    let doneCheck = document.createElement("input");
    doneCheck.setAttribute("type", "checkbox");
    doneCheck.classList.add("ceckbox");
    doneCheck.addEventListener("click", function() {
        task.done = !task.done;
        let taskContent = {
            done: task.done,
            name: task.name
        };
        taskCounterDiv.innerHTML = task.done ? `${doneTaskCounter = doneTaskCounter+1} di ${taskCounter}` : `${doneTaskCounter = doneTaskCounter-1} di ${taskCounter}`;
        updateTask(task.id, taskContent, () => {
            newTaskLine.classList.toggle("task-done");
            edit.classList.toggle("hidden");
            
        });
    });
    newTaskLine.appendChild(doneCheck);

    let dateSpan = document.createElement("span");
    let date = new Date(task.created);
    dateSpan.classList.add("task-date");
    dateSpan.innerText = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    newTaskLine.appendChild(dateSpan);

    let edit = document.createElement("button");
    edit.innerHTML = `<i class="fas fa-edit"></i>`;
    edit.classList.add("edit-button");
    if (task.done) {
        newTaskLine.classList.add("task-done");
        doneCheck.checked = true;
        edit.classList.toggle("hidden");
        taskCounterDiv.innerHTML = `${doneTaskCounter = doneTaskCounter+1} di ${taskCounter}`;
    }
    edit.addEventListener("click", function() {
        let newInput = document.createElement("input");
        newInput.classList.add("task-text");
        newInput.setAttribute("id", "edit-input-" + task.id);
        if (newTaskLine.classList.contains("editing")) {
            let editInput = document.getElementById("edit-input-" + task.id);
            let taskContent = {
                name: editInput.value
            };
           updateTaskName(task.id, taskContent, () => {
                nameSpan.innerText = editInput.value;
                task.name = editInput.value;
                editInput.replaceWith(nameSpan);
                edit.innerHTML = `<i class="fas fa-edit"></i>`;
                newTaskLine.classList.remove("editing");
                doneCheck.style.visibility = "visible";
           }); 
        } else {
            newInput.value = task.name;
            nameSpan.replaceWith(newInput);
            edit.innerHTML = `<i class="fas fa-save"></i>`;
            newTaskLine.classList.add("editing");
            task.name = nameSpan.innerText;
            doneCheck.style.visibility = "hidden";
        }
    });
    newTaskLine.appendChild(edit);
    
    let deleteTask = document.createElement("button");
    deleteTask.classList.add("delete-single-task");
    deleteTask.innerHTML = `<i class="fas fa-trash-alt"></i>`;
    newTaskLine.appendChild(deleteTask);
    deleteTask.addEventListener("click", function() {
        deleteATask(task.id, newTaskLine);
    });

    newTaskLine.setAttribute("data-id", task.id);
    //inserisce il task creato in prima posizione
    tasksList.insertBefore(newTaskLine, tasksList.firstChild);
    taskCounterDiv.innerHTML = `${doneTaskCounter} di ${taskCounter = taskCounter+1}`;
    showRemoveAll();
    emptyList();
}



function updateTasksList() {
    //recupero i dati dal server
    tasksList.innerHTML = "";
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function () {
        let tasks = JSON.parse(ajaxRequest.response);
        for (let task of tasks) {
            console.log(task);
            categoryId = task.category.id;
            categoryColor = task.category.color;
            categoryName = task.category.name;
            createTask(task);
        }
    }
    ajaxRequest.open("GET", REST_API_ENDPOINT + "/tasks/");
    ajaxRequest.send();
}



updateTasksList();



showRemoveAll();



function saveTask(taskContentValue, successfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        let task = JSON.parse(ajaxRequest.response);
        createTask(task);
        //risetto la categoria a no-category dopo aver creato il task in modo che 
        //se non seleziono nessuna categoria viene messa questa come predefinita
        //senza doverla selezionare.
        successfullCallback();
        categoryId = 1;
        categoryName = "no-category";
        categoryColor = "white";
    }
    ajaxRequest.open("POST", REST_API_ENDPOINT + "/tasks/add");
    ajaxRequest.setRequestHeader("content-type", "application/json");
    let ObjectCategory = {
        id: categoryId,
        name: categoryName,
        color: categoryColor
    };
    let body = {
        name: taskContentValue,
        created: new Date(),
        category: ObjectCategory
    };
    ajaxRequest.send(JSON.stringify(body));
}



function updateTask(taskId, taskContent, successfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        successfullCallback(); 
    }
    // Metodo in PUT:
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId);
    // Metodo in POST:
    //ajaxRequest.open("POST", REST_API_ENDPOINT + "/tasks/" + taskId + "/edit");
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}



function updateTaskName(taskId, taskContent, successfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_RESPONSE_SUCCES) {
           successfullCallback(); 
        }
    }
    // Metodo in PUT:
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId + "/update-name");
    // Metodo in POST:
    //ajaxRequest.open("POST", REST_API_ENDPOINT + "/tasks/" + taskId + "/edit");
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}



taskAddButton.addEventListener("click", function () {
    categoryDiv.classList.add("hidden");
    let taskContentValue = taskContent.value;
    if (taskContentValue.length < 1) {
        alert("Non puoi inserire un task vuoto")
        return;
    }
    saveTask(taskContentValue, () => {
        taskContent.value = "";
    });
});



function deleteATask(taskId, taskElement) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        let jsonResponse = ajaxRequest.response;
        if (jsonResponse == "ok") {
            taskCounterDiv.innerHTML = taskElement.classList.contains("task-done") ? `${doneTaskCounter = doneTaskCounter-1} di ${taskCounter = taskCounter-1}` : `${doneTaskCounter} di ${taskCounter = taskCounter-1}`;
            taskElement.remove();
            showRemoveAll();
            emptyList();
        }
    }
    // Metodo DELETE:
    ajaxRequest.open("DELETE", REST_API_ENDPOINT + `/tasks/${taskId}`);
    // Metodo POST:
    //ajaxRequest.open("POST", REST_API_ENDPOINT + `/tasks/${taskId}/delete`);
    ajaxRequest.send();
}

function deleteAllTasks() {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        let jsonResponse = ajaxRequest.response;
        if (jsonResponse == "ok") {
            tasksList.innerHTML = "";
            doneTaskCounter = 0;
            taskCounter = 0;
            taskCounterDiv.innerText = `${doneTaskCounter}/${taskCounter}`;
            showRemoveAll();
            emptyList();
        }
    }
    ajaxRequest.open("DELETE", REST_API_ENDPOINT + "/tasks/delete-all");
    ajaxRequest.send();
}

removeItemList.addEventListener("click", function() {
    deleteAllTasks();
});


taskCounterDiv.innerText = `${doneTaskCounter}/${taskCounter}`;
