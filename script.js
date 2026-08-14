// ========================================
// VS PLAYER
// V0.2
// Biblioteca + IndexedDB
// ========================================


// ========================================
// CONFIGURAÇÕES
// ========================================

const MAX_MUSIC_IMPORT = 50;

const DB_NAME = "VSPlayerDB";
const DB_VERSION = 1;
const STORE_NAME = "musics";


// ========================================
// ELEMENTOS DA INTERFACE
// ========================================

const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

const pageTitle = document.getElementById("page-title");
const pageLabel = document.querySelector(".page-label");

const addMusicButton =
    document.getElementById("add-music");

const emptyAddButton =
    document.getElementById("empty-add");

const musicInput =
    document.getElementById("music-input");

const musicGrid =
    document.getElementById("music-grid");

const musicCount =
    document.getElementById("music-count");

const emptyLibrary =
    document.getElementById("empty-library");

const sortSelect =
    document.getElementById("sort-select");


// ========================================
// ESTADO DO VS PLAYER
// ========================================

let musicLibrary = [];

let currentSort = "recent";


// ========================================
// INDEXEDDB
// ========================================

let db;


// Abre/cria o banco
function openDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );


        // Banco criado pela primeira vez
        request.onupgradeneeded = event => {

            const database =
                event.target.result;


            if (!database.objectStoreNames.contains(STORE_NAME)) {

                const store =
                    database.createObjectStore(
                        STORE_NAME,
                        {
                            keyPath: "id"
                        }
                    );


                store.createIndex(
                    "dateAdded",
                    "dateAdded",
                    {
                        unique: false
                    }
                );

            }

        };


        request.onsuccess = event => {

            db = event.target.result;

            console.log(
                "VS Player: IndexedDB conectado."
            );

            resolve(db);

        };


        request.onerror = event => {

            console.error(
                "Erro ao abrir IndexedDB:",
                event.target.error
            );

            reject(event.target.error);

        };

    });

}


// ========================================
// OPERAÇÕES DO BANCO
// ========================================


// Salvar música
function saveMusic(music) {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );


        const store =
            transaction.objectStore(
                STORE_NAME
            );


        const request =
            store.put(music);


        request.onsuccess = () => {

            resolve();

        };


        request.onerror = event => {

            reject(
                event.target.error
            );

        };

    });

}


// Buscar todas as músicas
function getAllMusic() {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                STORE_NAME,
                "readonly"
            );


        const store =
            transaction.objectStore(
                STORE_NAME
            );


        const request =
            store.getAll();


        request.onsuccess = () => {

            resolve(
                request.result
            );

        };


        request.onerror = event => {

            reject(
                event.target.error
            );

        };

    });

}


// ========================================
// UTILIDADES
// ========================================


// Gera um ID único
function generateId() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );

}


// Formata duração
function formatDuration(seconds) {

    if (!seconds || !isFinite(seconds)) {
        return "0:00";
    }


    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60);


    return (
        minutes +
        ":" +
        remainingSeconds
            .toString()
            .padStart(2, "0")
    );

}


// ========================================
// OBTER DURAÇÃO DO ÁUDIO
// ========================================

function getAudioDuration(file) {

    return new Promise(resolve => {

        const audio =
            document.createElement("audio");


        const url =
            URL.createObjectURL(file);


        audio.preload = "metadata";


        audio.onloadedmetadata = () => {

            const duration =
                audio.duration;


            URL.revokeObjectURL(url);

            resolve(duration);

        };


        audio.onerror = () => {

            URL.revokeObjectURL(url);

            resolve(0);

        };


        audio.src = url;

    });

}


// ========================================
// CRIAR CAPA PROVISÓRIA
// ========================================

function createDefaultCover() {

    return `
        <div class="default-cover">
            <span>♫</span>
        </div>
    `;

}


// ========================================
// CRIAR CARD DA MÚSICA
// ========================================

function createMusicCard(music) {

    const card =
        document.createElement("div");


    card.className =
        "music-card";


    card.dataset.id =
        music.id;


    const cover =
        document.createElement("div");


    cover.className =
        "music-cover";


    // Se futuramente tivermos capa real,
    // ela será colocada aqui.
    cover.innerHTML =
        createDefaultCover();


    const title =
        document.createElement("h3");


    title.textContent =
        music.title || "Título desconhecido";


    const artist =
        document.createElement("p");


    artist.textContent =
        music.artist || "Artista desconhecido";


    card.appendChild(cover);
    card.appendChild(title);
    card.appendChild(artist);


    return card;

}


// ========================================
// RENDERIZAR BIBLIOTECA
// ========================================

function renderLibrary() {

    musicGrid.innerHTML = "";


    if (!musicLibrary.length) {

        emptyLibrary.style.display =
            "flex";

        musicCount.textContent =
            "0 músicas";

        return;

    }


    emptyLibrary.style.display =
        "none";


    musicCount.textContent =
        musicLibrary.length === 1
            ? "1 música"
            : `${musicLibrary.length} músicas`;


    const sortedMusic =
        [...musicLibrary];


    sortMusic(
        sortedMusic
    );


    sortedMusic.forEach(music => {

        const card =
            createMusicCard(music);


        musicGrid.appendChild(card);

    });

}


// ========================================
// ORDENAÇÃO
// ========================================

function sortMusic(list) {

    switch (currentSort) {


        case "recent":

            list.sort(
                (a, b) =>
                    b.dateAdded -
                    a.dateAdded
            );

            break;


        case "oldest":

            list.sort(
                (a, b) =>
                    a.dateAdded -
                    b.dateAdded
            );

            break;


        case "az":

            list.sort(
                (a, b) =>
                    a.title.localeCompare(
                        b.title,
                        "pt-BR"
                    )
            );

            break;


        case "za":

            list.sort(
                (a, b) =>
                    b.title.localeCompare(
                        a.title,
                        "pt-BR"
                    )
            );

            break;


        case "artist":

            list.sort(
                (a, b) =>
                    a.artist.localeCompare(
                        b.artist,
                        "pt-BR"
                    )
            );

            break;


        case "album":

            list.sort(
                (a, b) =>
                    a.album.localeCompare(
                        b.album,
                        "pt-BR"
                    )
            );

            break;


        case "played":

            list.sort(
                (a, b) =>
                    b.playCount -
                    a.playCount
            );

            break;


        case "duration":

            list.sort(
                (a, b) =>
                    b.duration -
                    a.duration
            );

            break;

    }

}


// ========================================
// IMPORTAR MÚSICAS
// ========================================

async function importMusic(files) {

    if (!files.length) {
        return;
    }


    // Limite de 50 por importação
    if (files.length > MAX_MUSIC_IMPORT) {

        alert(
            `Você pode adicionar no máximo ${MAX_MUSIC_IMPORT} músicas por vez.`
        );

        return;

    }


    let imported =
        0;


    for (const file of files) {


        // Verifica se é áudio
        if (!file.type.startsWith("audio/")) {

            continue;

        }


        console.log(
            "Importando:",
            file.name
        );


        const duration =
            await getAudioDuration(file);


        const music = {

            id:
                generateId(),


            // Arquivo original
            file:
                file,


            // Nome provisório
            title:
                file.name
                    .replace(
                        /\.[^/.]+$/,
                        ""
                    ),


            // Ainda vamos ler os metadados
            artist:
                "Artista desconhecido",


            album:
                "Álbum desconhecido",


            duration:
                duration,


            dateAdded:
                Date.now(),


            // Pasta padrão
            folder:
                null,


            // Favorito
            favorite:
                false,


            // Estatísticas
            playCount:
                0,


            // Posição salva
            position:
                0,


            // Letra
            lyrics:
                null,


            // Vídeo YouTube
            youtube:
                null

        };


        try {

            await saveMusic(
                music
            );


            musicLibrary.push(
                music
            );


            imported++;


        } catch (error) {

            console.error(
                "Erro ao salvar música:",
                error
            );

        }

    }


    renderLibrary();


    console.log(
        `${imported} música(s) importada(s).`
    );

}


// ========================================
// INPUT DE MÚSICAS
// ========================================

musicInput.addEventListener(
    "change",
    async event => {

        const files =
            Array.from(
                event.target.files
            );


        await importMusic(
            files
        );


        // Permite selecionar
        // o mesmo arquivo novamente.
        musicInput.value = "";

    }
);


// ========================================
// BOTÕES DE ADICIONAR
// ========================================

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
// ORDENAÇÃO
// ========================================

sortSelect.addEventListener(
    "change",
    event => {

        currentSort =
            event.target.value;


        renderLibrary();

    }
);


// ========================================
// NAVEGAÇÃO
// ========================================

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


function changePage(pageName) {

    const page =
        document.getElementById(
            `page-${pageName}`
        );


    if (!page) {
        return;
    }


    navItems.forEach(item => {

        item.classList.remove(
            "active"
        );

    });


    const activeButton =
        document.querySelector(
            `[data-page="${pageName}"]`
        );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );

    }


    pages.forEach(page => {

        page.classList.remove(
            "active-page"
        );

    });


    page.classList.add(
        "active-page"
    );


    if (pageNames[pageName]) {

        pageLabel.textContent =
            pageNames[pageName].label;

        pageTitle.textContent =
            pageNames[pageName].title;

    }


    localStorage.setItem(
        "vsplayer-last-page",
        pageName
    );

}


navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            changePage(
                item.dataset.page
            );

        }
    );

});


// ========================================
// INICIALIZAÇÃO
// ========================================

async function initializeVSPlayer() {

    try {

        // Abre banco
        await openDatabase();


        // Carrega músicas salvas
        musicLibrary =
            await getAllMusic();


        // Mostra biblioteca
        renderLibrary();


        // Recupera última página
        const lastPage =
            localStorage.getItem(
                "vsplayer-last-page"
            );


        if (
            lastPage &&
            document.getElementById(
                `page-${lastPage}`
            )
        ) {

            changePage(
                lastPage
            );

        } else {

            changePage(
                "music"
            );

        }


        console.log(
            "VS Player iniciado."
        );


    } catch (error) {

        console.error(
            "Não foi possível iniciar o VS Player:",
            error
        );


        alert(
            "Não foi possível inicializar o armazenamento do VS Player."
        );

    }

}


initializeVSPlayer();
