class App {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem("notes")) || [];
        this.title = "";
        this.text = "";
        this.id = "";

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

        this.render();
        this.addEventListener();
    }

    saveNotes() {
        localStorage.setItem("notes", JSON.stringify(this.notes));
    }
    displayNotes() {
        const hasNotes = this.notes.length > 0;

        this.$placeholder.style.display = hasNotes ? "none" : "flex";
        this.$noteText.innerHTML = this.notes.map((note) => {
            return `
                <div style="background: ${note.color};" class="note" data-id="${note.id}">
                    ${note.title ? `<div class="note-title">${note.title}</div>` : ''}
                    <div class="note-text">${note.text}</div>
                    <div class="toolbar-container">
                        <div class="toolbar">
                            <i class="fa-solid fa-pencil" data-id="${note.id}">edit</i>
                            <i class="fa-solid fa-trash" data-id="${note.id}">delete</i>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    }
    render() {
        this.saveNotes();
        this.displayNotes();
    }
    addEventListener() {
        document.body.addEventListener('click', (e) => {
            this.handleFormClick(e);
            this.selectNote(e);
            this.openModal(e);
            this.deleteNote(e);
        });

        this.$form.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = this.$noteTitle.value;
            const text = this.$noteText.value;
            const hasNote = title || text;
            if (hasNote) {
                this.addNote({ title, text })
            }
        });

        this.$formCloseButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.closeForm();
        });
        this.$modalCloseButton.addEventListener("click", (e) => {

            this.closeModal(e);
        })


    }
    handleFormClick(event) {
        const isFormClicked = this.$form.contains(event.target);
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
        if (this.$form) {
            this.$form.classList.add("form-open");
        }
        if (this.$noteTitle) {
            this.$noteTitle.style.display = "block";
        }
        if (this.$formButtons) {
            this.$formButtons.style.display = "block";
        }
    }

    closeForm() {
        if (this.$form) {
            this.$form.classList.remove("form-open");
        }
        if (this.$noteTitle) {
            this.$noteTitle.style.display = "none";
        }
        if (this.$formButtons) {
            this.$formButtons.style.display = "none";
        }
        this.$noteTitle.value = '';
        this.$noteText.value = '';
    }
    closeTooltip(event) {
        if (!event.target.matches('.fa-pencil')) return;
        this.$colorTooltip.style.display = "none";
    }
    // save notes to local storage
    addNote({ title, text }) {

        const newNote = {
            title,
            text,
            color: "white",
            id: this.notes.length > 0 ? this.notes[this.notes.length - 1].id + 1 : 1
        }
        this.notes = [...this.notes, newNote];
        this.render();
        this.closeForm();
    }
    editNote() {
        const title = this.$modalTitle.value;
        const text = this.$modalText.value;
        this.notes = this.notes.map((note) => {
            note.id === Number(this.id) ? { ...note, title, text } : note
        });
        this.render();
    }
    editNoteColor(color) {
        this.notes = this.notes.map((note) => {
            note.id === Number(this.id) ? { ...note, color } : note
        })
    }
    deleteNote(event) {
        event.stopPropagation();
        if (!event.target.matches('.fa-trash')) return;
        const id = event.target.dataset.id;
        this.notes = this.notes.filter(notes => note.id !== Number(id));
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
}

new App();
