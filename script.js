class App {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.title = "";
        this.text = "";
        this.id = "";
        this.bin = JSON.parse(localStorage.getItem('bin')) || [];

        this.$menu = document.getElementById('menu');
        this.$placeholder = document.querySelector("#placeholder");
        this.$form = document.querySelector("#form");
        this.$notes = document.querySelector("#notes");
        this.$noteTitle = document.querySelector("#note-title");
        this.$noteText = document.querySelector("#note-text");
        this.$formButtons = document.querySelector("#form-buttons");
        this.$formCloseButton = document.querySelector("#form-close-button");
        this.$modal = document.querySelector(".modal");
        this.$modalTitle = document.querySelector(".modal-title");
        this.$modalText = document.querySelector(".modal-text");
        this.$modalCloseButton = document.querySelector(".modal-close-button");
        this.$colorTooltip = document.querySelector("#color-tooltip");
        this.$searchText = document.getElementById('search-text').value;
        this.$addStar = document.querySelector('.star-it');
        this.$removeStar = document.querySelector('.remove-star');


        this.render();
        this.addEventListeners();
    }

    addEventListeners() {
        document.body.addEventListener("click", event => {
            this.handleFormClick(event);
            this.selectNote(event);
            this.openModal(event);
            this.deleteNote(event);
            if (event.target.matches('.star-it')) {
                this.addStar();
            }
            if (event.target.matches('.remove-star')) {
                this.removeStar();
            }
            if (event.target.matches('.draggable')) return;
        });

        document.body.addEventListener("mouseover", event => {
            this.openTooltip(event);
        });

        document.body.addEventListener("mouseout", event => {
            this.closeTooltip(event);
        });

        this.$colorTooltip.addEventListener("mouseover", function () {
            this.style.display = "flex";
        });

        this.$colorTooltip.addEventListener("mouseout", function () {
            this.style.display = "none";
        });

        this.$colorTooltip.addEventListener("click", event => {
            const color = event.target.dataset.color;
            if (color) {
                this.editNoteColor(color);
            }
        });

        this.$form.addEventListener("submit", event => {
            event.preventDefault();
            const title = this.$noteTitle.value;
            const text = this.$noteText.value;
            const hasNote = title || text;
            if (hasNote) {
                this.addNote({ title, text });
            }
        });

        this.$formCloseButton.addEventListener("click", event => {
            event.stopPropagation();
            this.closeForm();
        });

        this.$modalCloseButton.addEventListener("click", event => {
            this.closeModal(event);
        });

        document.getElementById('search-text').addEventListener('input', event => {
            this.$searchText = event.target.value;
            this.render();
        });
    }

    addDragListeners() {
        this.$draggables = document.querySelectorAll('.draggable');
        this.$draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (event) => {
                console.log("dragstart");
                draggable.classList.add('dragging');
            });

            draggable.addEventListener('dragend', (event) => {
                draggable.classList.remove('dragging');
            });
        });

        this.$notes.addEventListener('dragover', (event) => {
            event.preventDefault();
            console.log("drag");
            const afterElement = getDragAfterElement(this.$notes, event.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterElement == null) {
                console.log(afterElement, ">>>>>>>>>>>>>>>>>");
                this.$notes.appendChild(draggable);
            } else {
                this.$notes.insertBefore(draggable, afterElement);
            }
        });

        function getDragAfterElement(area, y) {
            const dragableElements = [...area.querySelectorAll('.draggable:not(.dragging)')];

            if (dragableElements.length === 0) {
                return null;
            }

            const closestElement = dragableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;

                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;

            return closestElement;
        }


    }



    addStar() {
        const id = event.target.dataset.id;
        const selectedNote = this.notes.find((note) => note.id === Number(id));
        if (selectedNote) {
            selectedNote.isStared = true;
            this.render();
        }
    }

    removeStar() {
        const id = event.target.dataset.id;
        const selectedNote = this.notes.find((note) => note.id === Number(id));
        if (selectedNote) {
            selectedNote.isStared = false;
            this.render();
        }
    }

    handleFormClick(event) {
        const form = this.$form;
        const isFormClicked = form && form.contains(event.target);
        const title = this.$noteTitle.value;
        const text = this.$noteText.value;
        const hasNote = title || text;

        if (isFormClicked) {
            this.openForm();
        } else if (hasNote) {
            this.addNote({ title, text });
        } else {
            this.closeForm();
        }
    }

    openForm() {
        this.$form.classList.add("form-open");
        this.$noteTitle.style.display = "block";
        this.$formButtons.style.display = "block";
    }

    closeForm() {
        this.$form.classList.remove("form-open");
        this.$noteTitle.style.display = "none";
        this.$formButtons.style.display = "none";
        this.$noteTitle.value = "";
        this.$noteText.value = "";
    }

    openModal(event) {
        if (event.target.matches('.toolbar-delete')) return;
        if (event.target.matches('.remove-star')) return;
        if (event.target.matches('.star-it')) return;

        if (event.target.closest(".note")) {
            this.$modal.classList.toggle("open-modal");
            this.$modalTitle.value = this.title;
            this.$modalText.value = this.text;
        }
    }

    closeModal(event) {
        this.editNote();
        this.$modal.classList.toggle("open-modal");
    }

    openTooltip(event) {
        if (!event.target.matches('.toolbar-color')) return;
        this.id = event.target.dataset.id;
        const noteCoords = event.target.getBoundingClientRect();
        const horizontal = noteCoords.left + window.scrollX;
        const vertical = noteCoords.top + window.scrollY;
        this.$colorTooltip.style.transform = `translate(${horizontal}px, ${vertical}px)`;
        this.$colorTooltip.style.display = 'flex';
    }

    closeTooltip(event) {
        if (!event.target.matches(".toolbar-color")) return;
        this.$colorTooltip.style.display = "none";
    }

    addNote({ title, text }) {
        const newNote = {
            title,
            text,
            color: "white",
            isStared: false,
            id: this.notes.length > 0 ? this.notes[this.notes.length - 1].id + 1 : 1
        };
        this.notes = [...this.notes, newNote];
        this.render();
        this.closeForm();
    }

    editNote() {
        const title = this.$modalTitle.value;
        const text = this.$modalText.value;
        this.notes = this.notes.map(note =>
            note.id === Number(this.id) ? { ...note, title, text } : note
        );
        this.render();
    }

    editNoteColor(color) {
        this.notes = this.notes.map(note =>
            note.id === Number(this.id) ? { ...note, color } : note
        );
        this.render();
    }

    selectNote(event) {
        const $selectedNote = event.target.closest(".note");
        if (!$selectedNote) return;
        const [$noteTitle, $noteText] = $selectedNote.children;
        this.title = $noteTitle.innerText;
        this.text = $noteText.innerText;
        this.id = $selectedNote.dataset.id;
    }

    deleteNote(event) {
        event.stopPropagation();
        if (!event.target.matches('.toolbar-delete')) return;
        const id = event.target.dataset.id;
        const deletedNote = this.notes.find(note => note.id === Number(id));
        if (deletedNote) {
            this.bin.push(deletedNote);
            this.notes = this.notes.filter(note => note.id !== Number(id));
            this.render();
        }
    }

    render() {
        this.saveNotes();
        if (window.location.pathname.includes("archive.html")) {
            this.displayStarredNotes();
        }
        else if (window.location.pathname.includes("bin.html")) {
            this.displayBinNotes();
        } else {
            this.displayNotes();
        }
        this.addDragListeners(); // Reapply drag listeners after rendering
    }

    displayBinNotes() {
        if (this.bin.length > 0) {
            this.$notes.innerHTML = this.bin
                .map(
                    note => `
                    <div style="background: ${note.color}; min-height: 50px;" class="note draggable" draggable="true" data-id="${note.id}">
                    <div class="${note.title ? 'note-title' : ''}">${note.title}</div>
                    <div class="note-text">${note.text}</div>
                    <div class="toolbar-container">
                    <div class="toolbar">
                    <i class="fa-solid fa-trash toolbar-delete "  data-id=${note.id}></i>
                    <i class="fa-solid fa-droplet toolbar-color" data-id=${note.id}></i>
                    ${note.isStared ? `<i class="fa-solid fa-star remove-star" data-id=${note.id} style="color: #FFD43B;"></i>` : `<i class="fa-regular fa-star star-it" data-id=${note.id}></i>`}
                    </div>
                    </div>
                    </div>
       `
                )
                .join("");
        } else {
            this.$notes.innerHTML = `<p id="placeholder-text">No deleted notes found.</p>`;
        }
    }

    displayStarredNotes() {
        const starredNotes = this.notes.filter(note => note.isStared);
        if (starredNotes.length > 0) {
            this.$notes.innerHTML = starredNotes
                .map(
                    note => `
                    <div style="background: ${note.color}; min-height: 50px;" class="note draggable" draggable="true" data-id="${note.id}">
                    <div class="${note.title ? 'note-title' : ''}">${note.title}</div>
                    <div class="note-text">${note.text}</div>
                    <div class="toolbar-container">
                    <div class="toolbar">
                    <i class="fa-solid fa-trash toolbar-delete "  data-id=${note.id}></i>
                    <i class="fa-solid fa-droplet toolbar-color" data-id=${note.id}></i>
                    ${note.isStared ? `<i class="fa-solid fa-star remove-star" data-id=${note.id} style="color: #FFD43B;"></i>` : `<i class="fa-regular fa-star star-it" data-id=${note.id}></i>`}
                    </div>
                    </div>
                    </div>
       `
                )
                .join("");
        } else {
            this.$notes.innerHTML = `<p id="placeholder-text">No starred notes found.</p>`;
        }
    }

    saveNotes() {
        localStorage.setItem('bin', JSON.stringify(this.bin));
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    displayNotes() {
        const hasNotes = this.notes.length > 0;
        this.$placeholder.style.display = hasNotes ? "none" : "flex";

        const filteredNotes = this.notes.filter(note =>
            (note.title && note.title.toLowerCase().includes(this.$searchText.toLowerCase())) ||
            (note.text && note.text.toLowerCase().includes(this.$searchText.toLowerCase()))
        );

        if (filteredNotes.length > 0) {
            this.$notes.innerHTML = filteredNotes
                .map(
                    note => `
                    <div style="background: ${note.color};" class="note draggable" draggable="true" data-id="${note.id}">
                    <div class="${note.title && "note-title"}">${note.title}</div>
                    <div class="note-text">${note.text}</div>
                    <div class="toolbar-container">
                    <div class="toolbar">
                    <i class="fa-solid fa-trash toolbar-delete "  data-id=${note.id}></i>
                    <i class="fa-solid fa-droplet toolbar-color" data-id=${note.id}></i>
                    ${note.isStared ? `<i class="fa-solid fa-star remove-star" data-id=${note.id} style="color: #FFD43B;"></i>` : `<i class="fa-regular fa-star star-it" data-id=${note.id}></i>`}
                    </div>
                    </div>
                    </div>
       `
                )
                .join("");
        } else {
            this.$notes.innerHTML = this.notes
                .map(
                    note => `
                    <div style="background: ${note.color};" class="note draggable" draggable="true" data-id="${note.id}">
                    <div class="${note.title && "note-title"}">${note.title}</div>
                    <div class="note-text">${note.text}</div>
                    <div class="toolbar-container">
                    <div class="toolbar">
                    <i class="fa-solid fa-trash toolbar-delete "  data-id=${note.id}></i>
                    <i class="fa-solid fa-droplet toolbar-color" data-id=${note.id}></i>
                    ${note.isStared ? `<i class="fa-solid fa-star remove-star" data-id=${note.id} style="color: #FFD43B;"></i>` : `<i class="fa-regular fa-star star-it" data-id=${note.id}></i>`}
                    </div>
                    </div>
                    </div>
       `
                )
                .join("");
        }
    }
}

new App();

document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector('.sidebar');
    const menuBarIcon = document.querySelector('#menu-item ');

    menuBarIcon.addEventListener('click', function () {
        sidebar.classList.toggle('collapsed');
    });
});
