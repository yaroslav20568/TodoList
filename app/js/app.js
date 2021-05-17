window.addEventListener('DOMContentLoaded', () => {
    let addBtn = document.querySelector('.todo-list__add button'),
        addInp = document.querySelector('.todo-list__add input'),
        todoList = document.querySelector('.todo-list__content');
    
    let arrayTodos = JSON.parse(localStorage.getItem('arrayTodos')) || [];

    function getDate(date) {
        let currentDate = date.toDateString().split(' ');
        return `${currentDate[2]} ${currentDate[1]}`;
    }

    function getZero(num) {
        if(num < 0 || num <= 9) {
            return `0${num}`;
        } else {
            return num;
        }
    }

    function getTime(date) {
        return `${getZero(date.getHours())}:${getZero(date.getMinutes())}`;
    }

    function renderTodos() {
        todoList.innerHTML = '';
        
        arrayTodos.forEach((elemArr, index) => {
            todoList.innerHTML += `
                <div class="todo">
                <div class="todo__enumaration">${index + 1}.</div>
                <label class="todo__label" for="checkbox${index + 1}">
                    <input ${elemArr.isChecked ? 'checked' : ''} class="todo__checkbox" type="checkbox" id="checkbox${index + 1}">
                    <div class="todo__fake-checkbox"></div>
                </label>
                <div class="todo__title">${elemArr.title}</div>
                <div class="todo__date">${elemArr.date}</div>
                <div class="todo__time">${elemArr.time}</div>
                <div class="todo__delete"></div>
                </div>
            `;
        });

        let checkboxs = document.querySelectorAll('.todo__label input'),
            deleteBtns = document.querySelectorAll('.todo__delete');

        checkboxs.forEach((item, index) => {
            item.addEventListener('click', () => {
                arrayTodos[index].isChecked = !arrayTodos[index].isChecked;
                renderTodos();
                localStorage.setItem('arrayTodos', JSON.stringify(arrayTodos));
            });
        });
        
        deleteBtns.forEach((item, index) => {
            item.addEventListener('click', () => {
                arrayTodos.splice(index, 1);
                document.querySelector('.todo').classList.add('todo_hide');
                renderTodos();
                showMessage();
                localStorage.setItem('arrayTodos', JSON.stringify(arrayTodos));
            });
        });
    }

    function addTodo() {
        let inpValue = addInp.value.charAt(0).toUpperCase() + addInp.value.substr(1).toLowerCase();
        addInp.value && arrayTodos.push({title: inpValue, isChecked: false, date: getDate(new Date()), time: getTime(new Date())});
        showMessage()
        localStorage.setItem('arrayTodos', JSON.stringify(arrayTodos));
    }

    function showMessage() {
        if(arrayTodos.length == 0) {
            document.querySelector('.message__title').textContent = 'Увы, список пуст! Заполните его!';
            document.querySelector('.todo-list__message').classList.remove('hide');
            document.querySelector('.todo-list__message').classList.add('show');
        } else {
            document.querySelector('.message__title').textContent = '';
            document.querySelector('.todo-list__message').classList.remove('show');
            document.querySelector('.todo-list__message').classList.add('hide');
        }
    }


    addBtn.addEventListener('click', () => {
        addTodo();
        if(addInp.value) 
            renderTodos();
        addInp.value = '';
    });

    window.addEventListener('keypress', (e) => {
        if(e.keyCode == 13) {
            addTodo();
            if(addInp.value) 
                renderTodos();
            addInp.value = '';
        }
    });

    document.querySelector('svg').addEventListener('click', (e) => {
        let path = document.querySelector('path');
        if(path.getAttribute('d') == 'M13.571 38.155c3.929-2.38 14-5.714 22.858 0') {
            path.setAttribute('d', 'M13.5699 37H36.4299');
        } else {
            path.setAttribute('d', 'M13.571 38.155c3.929-2.38 14-5.714 22.858 0');
        }
    });

    renderTodos();
    showMessage();
});

