// ========================================
// VS PLAYER
// V0.1
// ========================================


// Elementos principais
const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

const pageTitle = document.getElementById("page-title");
const pageLabel = document.querySelector(".page-label");


// Nomes das páginas
const pageNames = {
    music: {
        label: "BIBLIOTECA",
        title: "Músicas"
    },

    folders: {
        label: "ORGANIZAÇÃO",
        title: "Pastas"
    },

    playlists: {
        label: "ORGANIZAÇÃO",
        title: "Playlists"
    },

    favorites: {
        label: "COLEÇÃO",
        title: "Favoritos"
    },

    history: {
        label: "HISTÓRICO",
        title: "Histórico"
    },

    settings: {
        label: "SISTEMA",
        title: "Configurações"
    }
};


// Troca de página
function changePage(pageName) {

    const page = document.getElementById(`page-${pageName}`);

    if (!page) {
        return;
    }


    // Remove estado ativo dos botões
    navItems.forEach(item => {
        item.classList.remove("active");
    });


    // Ativa o botão correspondente
    const activeButton = document.querySelector(
        `[data-page="${pageName}"]`
    );

    if (activeButton) {
        activeButton.classList.add("active");
    }


    // Esconde todas as páginas
    pages.forEach(page => {
        page.classList.remove("active-page");
    });


    // Mostra a página escolhida
    page.classList.add("active-page");


    // Atualiza título
    if (pageNames[pageName]) {

        pageLabel.textContent =
            pageNames[pageName].label;

        pageTitle.textContent =
            pageNames[pageName].title;
    }


    // Salva a última página
    localStorage.setItem(
        "vsplayer-last-page",
        pageName
    );
}


// Eventos do menu
navItems.forEach(item => {

    item.addEventListener("click", () => {

        const pageName =
            item.dataset.page;

        changePage(pageName);

    });

});


// ========================================
// RESTAURAR ÚLTIMA PÁGINA
// ========================================

const lastPage =
    localStorage.getItem("vsplayer-last-page");

if (lastPage && document.getElementById(`page-${lastPage}`)) {

    changePage(lastPage);

} else {

    changePage("music");

}


// ========================================
// BOTÕES DE ADICIONAR
// ========================================

const addMusicButton =
    document.getElementById("add-music");

const emptyAddButton =
    document.getElementById("empty-add");

const musicInput =
    document.getElementById("music-input");


function openMusicSelector() {

    musicInput.click();

}


addMusicButton.addEventListener(
    "click",
    openMusicSelector
);


emptyAddButton.addEventListener(
    "click",
    openMusicSelector
);


// ========================================
// IMPORTAÇÃO — TEMPORARIAMENTE
// ========================================

musicInput.addEventListener("change", event => {

    const files = Array.from(
        event.target.files
    );

    if (!files.length) {
        return;
    }


    console.log(
        "Músicas selecionadas:",
        files
    );


    // Por enquanto só mostramos no console.
    // A próxima etapa será:
    //
    // arquivo
    // ↓
    // metadados
    // ↓
    // IndexedDB
    // ↓
    // biblioteca


    alert(
        `${files.length} música(s) selecionada(s).`
    );

});
