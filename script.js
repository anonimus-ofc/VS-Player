// ========================================
// VS PLAYER
// V0.4
// IndexedDB + Biblioteca + Player
// Tela completa do Player
// Visualizador — estrutura inicial
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

const navItems =
    document.querySelectorAll(".nav-item");

const pages =
    document.querySelectorAll(".page");

const pageTitle =
    document.getElementById("page-title");

const pageLabel =
    document.querySelector(".page-label");

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
// MINI PLAYER
// ========================================

const playButton =
    document.getElementById("play-button");

const previousButton =
    document.getElementById("previous-button");

const nextButton =
    document.getElementById("next-button");

const progressBar =
    document.getElementById("progress-bar");

const currentTimeElement =
    document.getElementById("current-time");

const totalTimeElement =
    document.getElementById("total-time");

const miniTitle =
    document.getElementById("mini-title");

const miniArtist =
    document.getElementById("mini-artist");

const miniCover =
    document.querySelector(".mini-cover");


// ========================================
// TELA COMPLETA DO PLAYER
// ========================================

const playerScreen =
    document.getElementById("player-screen");

const closePlayerButton =
    document.getElementById("close-player");

const playerTitle =
    document.getElementById("player-title");

const playerArtist =
    document.getElementById("player-artist");

const playerPlay =
    document.getElementById("player-play");

const playerPrevious =
    document.getElementById("player-previous");

const playerNext =
    document.getElementById("player-next");

const playerProgress =
    document.getElementById("player-progress");

const playerCurrentTime =
    document.getElementById("player-current-time");

const playerTotalTime =
    document.getElementById("player-total-time");

const playerFavorite =
    document.getElementById("player-favorite");

const visualizerButton =
    document.getElementById("player-visualizer");

const visualizerPanel =
    document.getElementById("visualizer-panel");

const closeVisualizer =
    document.getElementById("close-visualizer");

const visualizerModes =
    document.querySelectorAll(
        ".visualizer-mode"
    );

const visualizerCanvas =
    document.getElementById(
        "visualizer-canvas"
    );

const visualizerCover =
    document.getElementById(
        "visualizer-cover"
    );


// ========================================
// ESTADO
// ========================================

let db = null;

let musicLibrary = [];

let currentSort = "recent";

let currentMusicIndex = -1;

let currentMusic = null;

let audio = new Audio();

let currentObjectURL = null;

let lastPositionSave = 0;


// ========================================
// VISUALIZADOR
// ========================================

// Modo atual do espectro.
//
// all    = todas as frequências
// bass   = graves
// mid    = médios
// treble = agudos

let spectrumMode = "all";


// Futuramente será usado pelo
// sistema real do Visual Stério.

let visualStereoEnabled = true;


// ========================================
// INDEXEDDB
// ========================================

function openDatabase() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            request.onupgradeneeded =
                event => {

                    const database =
                        event.target.result;


                    if (
                        !database
                            .objectStoreNames
                            .contains(
                                STORE_NAME
                            )
                    ) {

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


            request.onsuccess =
                event => {

                    db =
                        event.target.result;


                    console.log(
                        "VS Player: IndexedDB conectado."
                    );


                    resolve(db);

                };


            request.onerror =
                event => {

                    console.error(
                        "Erro ao abrir IndexedDB:",
                        event.target.error
                    );


                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// ========================================
// BANCO — SALVAR
// ========================================

function saveMusic(music) {

    return new Promise(
        (resolve, reject) => {

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


            request.onsuccess =
                () => resolve();


            request.onerror =
                event => {

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// ========================================
// BANCO — BUSCAR TODAS
// ========================================

function getAllMusic() {

    return new Promise(
        (resolve, reject) => {

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


            request.onsuccess =
                () => {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                event => {

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// ========================================
// UTILIDADES
// ========================================

function generateId() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );

}


function formatDuration(seconds) {

    if (
        !seconds ||
        !isFinite(seconds)
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        Math.floor(
            seconds % 60
        );


    return (
        minutes +
        ":" +
        remainingSeconds
            .toString()
            .padStart(
                2,
                "0"
            )
    );

}


// ========================================
// DURAÇÃO DO ÁUDIO
// ========================================

function getAudioDuration(file) {

    return new Promise(
        resolve => {

            const tempAudio =
                document.createElement(
                    "audio"
                );


            const url =
                URL.createObjectURL(
                    file
                );


            tempAudio.preload =
                "metadata";


            tempAudio.onloadedmetadata =
                () => {

                    const duration =
                        tempAudio.duration;


                    URL.revokeObjectURL(
                        url
                    );


                    resolve(
                        duration
                    );

                };


            tempAudio.onerror =
                () => {

                    URL.revokeObjectURL(
                        url
                    );


                    resolve(0);

                };


            tempAudio.src =
                url;

        }
    );

}


// ========================================
// CAPA PADRÃO
// ========================================

function createDefaultCover() {

    return `
        <div class="default-cover">
            <span>♫</span>
        </div>
    `;

}


// ========================================
// CARD DA MÚSICA
// ========================================

function createMusicCard(music) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "music-card";


    card.dataset.id =
        music.id;


    const cover =
        document.createElement(
            "div"
        );


    cover.className =
        "music-cover";


    cover.innerHTML =
        createDefaultCover();


    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        music.title ||
        "Título desconhecido";


    const artist =
        document.createElement(
            "p"
        );


    artist.textContent =
        music.artist ||
        "Artista desconhecido";


    card.appendChild(
        cover
    );


    card.appendChild(
        title
    );


    card.appendChild(
        artist
    );


    card.addEventListener(
        "click",
        () => {

            playMusicFromLibrary(
                music.id
            );

        }
    );


    return card;

}


// ========================================
// RENDERIZAR BIBLIOTECA
// ========================================

function renderLibrary() {

    musicGrid.innerHTML =
        "";


    if (
        !musicLibrary.length
    ) {

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


    sortedMusic.forEach(
        music => {

            const card =
                createMusicCard(
                    music
                );


            musicGrid.appendChild(
                card
            );

        }
    );

}


// ========================================
// ORDENAÇÃO
// ========================================

function sortMusic(list) {

    switch (
        currentSort
    ) {

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
                    (
                        a.title || ""
                    ).localeCompare(
                        b.title || "",
                        "pt-BR"
                    )
            );

            break;


        case "za":

            list.sort(
                (a, b) =>
                    (
                        b.title || ""
                    ).localeCompare(
                        a.title || "",
                        "pt-BR"
                    )
            );

            break;


        case "artist":

            list.sort(
                (a, b) =>
                    (
                        a.artist || ""
                    ).localeCompare(
                        b.artist || "",
                        "pt-BR"
                    )
            );

            break;


        case "album":

            list.sort(
                (a, b) =>
                    (
                        a.album || ""
                    ).localeCompare(
                        b.album || "",
                        "pt-BR"
                    )
            );

            break;


        case "played":

            list.sort(
                (a, b) =>
                    (
                        b.playCount || 0
                    ) -
                    (
                        a.playCount || 0
                    )
            );

            break;


        case "duration":

            list.sort(
                (a, b) =>
                    (
                        b.duration || 0
                    ) -
                    (
                        a.duration || 0
                    )
            );

            break;

    }

}


// ========================================
// IMPORTAR MÚSICAS
// ========================================

async function importMusic(files) {

    if (
        !files.length
    ) {

        return;

    }


    if (
        files.length >
        MAX_MUSIC_IMPORT
    ) {

        alert(
            `Você pode adicionar no máximo ${MAX_MUSIC_IMPORT} músicas por vez.`
        );

        return;

    }


    let imported =
        0;


    for (
        const file of files
    ) {

        if (
            !file.type.startsWith(
                "audio/"
            )
        ) {

            continue;

        }


        console.log(
            "Importando:",
            file.name
        );


        const duration =
            await getAudioDuration(
                file
            );


        const music = {

            id:
                generateId(),


            file:
                file,


            title:
                file.name.replace(
                    /\.[^/.]+$/,
                    ""
                ),


            artist:
                "Artista desconhecido",


            album:
                "Álbum desconhecido",


            duration:
                duration,


            dateAdded:
                Date.now(),


            folder:
                null,


            favorite:
                false,


            playCount:
                0,


            position:
                0,


            lyrics:
                null,


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


        } catch (
            error
        ) {

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
// INPUT
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


        musicInput.value =
            "";

    }
);


// ========================================
// ABRIR SELETOR
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
// PLAYER
// ========================================

// Encontra música pelo ID
function findMusicById(id) {

    return musicLibrary.find(
        music =>
            music.id === id
    );

}


// ========================================
// ABRIR TELA COMPLETA
// ========================================

function openFullPlayer(
    music
) {

    if (
        !playerScreen
    ) {

        return;

    }


    playerScreen.classList.add(
        "open"
    );


    playerTitle.textContent =
        music.title ||
        "Título desconhecido";


    playerArtist.textContent =
        music.artist ||
        "Artista desconhecido";


    playerTotalTime.textContent =
        formatDuration(
            music.duration
        );


    playerCurrentTime.textContent =
        formatDuration(
            music.position || 0
        );


    playerProgress.value =
        music.duration
            ? (
                (
                    music.position || 0
                ) /
                music.duration
            ) * 100
            : 0;


    updateFullPlayerCover(
        music
    );

}


// ========================================
// ATUALIZAR CAPA DA TELA COMPLETA
// ========================================

function updateFullPlayerCover(
    music
) {

    if (
        !visualizerCover
    ) {

        return;

    }


    visualizerCover.innerHTML =
        createDefaultCover();

}


// ========================================
// CARREGAR E REPRODUZIR MÚSICA
// ========================================

async function playMusicFromLibrary(
    musicId
) {

    const music =
        findMusicById(
            musicId
        );


    if (!music) {

        console.error(
            "Música não encontrada."
        );

        return;

    }


    currentMusicIndex =
        musicLibrary.findIndex(
            item =>
                item.id ===
                musicId
        );


    currentMusic =
        music;


    // Abre a tela completa
    openFullPlayer(
        music
    );


    // Remove URL anterior
    if (
        currentObjectURL
    ) {

        URL.revokeObjectURL(
            currentObjectURL
        );

        currentObjectURL =
            null;

    }


    // Cria URL do arquivo
    currentObjectURL =
        URL.createObjectURL(
            music.file
        );


    // Define áudio
    audio.src =
        currentObjectURL;


    // Começa da posição salva
    audio.currentTime =
        music.position || 0;


    // Atualiza mini player
    updateMiniPlayer(
        music
    );


    try {

        await audio.play();


        updatePlayButton();
        updateFullPlayButton();


    } catch (
        error
    ) {

        console.error(
            "Não foi possível reproduzir:",
            error
        );


        updatePlayButton();
        updateFullPlayButton();

    }

}


// ========================================
// ATUALIZA MINI PLAYER
// ========================================

function updateMiniPlayer(
    music
) {

    miniTitle.textContent =
        music.title ||
        "Título desconhecido";


    miniArtist.textContent =
        music.artist ||
        "Artista desconhecido";


    totalTimeElement.textContent =
        formatDuration(
            music.duration
        );


    currentTimeElement.textContent =
        formatDuration(
            music.position || 0
        );


    progressBar.value =
        music.duration
            ? (
                (
                    music.position ||
                    0
                ) /
                music.duration
            ) *
            100
            : 0;


    miniCover.innerHTML =
        createDefaultCover();

}


// ========================================
// PLAY / PAUSE MINI PLAYER
// ========================================

playButton.addEventListener(
    "click",
    async () => {

        if (!currentMusic) {

            if (
                musicLibrary.length
            ) {

                await playMusicFromLibrary(
                    musicLibrary[0].id
                );

            }

            return;

        }


        if (
            audio.paused
        ) {

            try {

                await audio.play();

            } catch (
                error
            ) {

                console.error(
                    error
                );

            }

        } else {

            audio.pause();

        }


        updatePlayButton();
        updateFullPlayButton();

    }
);


// ========================================
// BOTÃO PLAY MINI
// ========================================

function updatePlayButton() {

    if (
        !playButton
    ) {

        return;

    }


    playButton.textContent =
        audio.paused
            ? "▶"
            : "Ⅱ";

}


// ========================================
// BOTÃO PLAY TELA COMPLETA
// ========================================

function updateFullPlayButton() {

    if (
        !playerPlay
    ) {

        return;

    }


    playerPlay.textContent =
        audio.paused
            ? "▶"
            : "Ⅱ";

}


// ========================================
// PLAY / PAUSE TELA COMPLETA
// ========================================

if (
    playerPlay
) {

    playerPlay.addEventListener(
        "click",
        async () => {

            if (!currentMusic) {

                if (
                    musicLibrary.length
                ) {

                    await playMusicFromLibrary(
                        musicLibrary[0].id
                    );

                }

                return;

            }


            if (
                audio.paused
            ) {

                try {

                    await audio.play();

                } catch (
                    error
                ) {

                    console.error(
                        error
                    );

                }

            } else {

                audio.pause();

            }


            updatePlayButton();
            updateFullPlayButton();

        }
    );

}


// ========================================
// TEMPO DA MÚSICA
// ========================================

audio.addEventListener(
    "timeupdate",
    () => {

        if (
            !currentMusic
        ) {

            return;

        }


        const current =
            audio.currentTime;


        const duration =
            audio.duration ||
            currentMusic.duration ||
            0;


        currentTimeElement.textContent =
            formatDuration(
                current
            );


        totalTimeElement.textContent =
            formatDuration(
                duration
            );


        if (
            duration > 0
        ) {

            progressBar.value =
                (
                    current /
                    duration
                ) *
                100;

        }


        // Tela completa

        if (
            playerCurrentTime
        ) {

            playerCurrentTime.textContent =
                formatDuration(
                    current
                );

        }


        if (
            playerTotalTime
        ) {

            playerTotalTime.textContent =
                formatDuration(
                    duration
                );

        }


        if (
            playerProgress &&
            duration > 0
        ) {

            playerProgress.value =
                (
                    current /
                    duration
                ) *
                100;

        }

    }
);


// ========================================
// DURAÇÃO CARREGADA
// ========================================

audio.addEventListener(
    "loadedmetadata",
    () => {

        if (
            !currentMusic
        ) {

            return;

        }


        const duration =
            audio.duration;


        totalTimeElement.textContent =
            formatDuration(
                duration
            );


        if (
            playerTotalTime
        ) {

            playerTotalTime.textContent =
                formatDuration(
                    duration
                );

        }

    }
);


// ========================================
// BARRA MINI PLAYER
// ========================================

progressBar.addEventListener(
    "input",
    () => {

        if (
            !audio.duration
        ) {

            return;

        }


        const percentage =
            Number(
                progressBar.value
            );


        audio.currentTime =
            (
                percentage /
                100
            ) *
            audio.duration;

    }
);


// ========================================
// BARRA TELA COMPLETA
// ========================================

if (
    playerProgress
) {

    playerProgress.addEventListener(
        "input",
        () => {

            if (
                !audio.duration
            ) {

                return;

            }


            const percentage =
                Number(
                    playerProgress.value
                );


            audio.currentTime =
                (
                    percentage /
                    100
                ) *
                audio.duration;

        }
    );

}


// ========================================
// MÚSICA TERMINOU
// ========================================

audio.addEventListener(
    "ended",
    () => {

        playNextMusic();

    }
);


// ========================================
// PRÓXIMA
// ========================================

function playNextMusic() {

    if (
        !musicLibrary.length
    ) {

        return;

    }


    let nextIndex =
        currentMusicIndex + 1;


    if (
        nextIndex >=
        musicLibrary.length
    ) {

        nextIndex = 0;

    }


    const nextMusic =
        musicLibrary[
            nextIndex
        ];


    playMusicFromLibrary(
        nextMusic.id
    );

}


nextButton.addEventListener(
    "click",
    () => {

        playNextMusic();

    }
);


// ========================================
// PRÓXIMA — TELA COMPLETA
// ========================================

if (
    playerNext
) {

    playerNext.addEventListener(
        "click",
        () => {

            playNextMusic();

        }
    );

}


// ========================================
// ANTERIOR
// ========================================

function playPreviousMusic() {

    if (
        !musicLibrary.length
    ) {

        return;

    }


    let previousIndex =
        currentMusicIndex - 1;


    if (
        previousIndex < 0
    ) {

        previousIndex =
            musicLibrary.length - 1;

    }


    const previousMusic =
        musicLibrary[
            previousIndex
        ];


    playMusicFromLibrary(
        previousMusic.id
    );

}


previousButton.addEventListener(
    "click",
    () => {

        playPreviousMusic();

    }
);


// ========================================
// ANTERIOR — TELA COMPLETA
// ========================================

if (
    playerPrevious
) {

    playerPrevious.addEventListener(
        "click",
        () => {

            playPreviousMusic();

        }
    );

}


// ========================================
// SALVAR POSIÇÃO
// ========================================

audio.addEventListener(
    "timeupdate",
    async () => {

        if (
            !currentMusic
        ) {

            return;

        }


        const now =
            Date.now();


        if (
            now -
            lastPositionSave <
            3000
        ) {

            return;

        }


        lastPositionSave =
            now;


        currentMusic.position =
            audio.currentTime;


        try {

            await saveMusic(
                currentMusic
            );

        } catch (
            error
        ) {

            console.error(
                "Erro ao salvar posição:",
                error
            );

        }

    }
);


// ========================================
// FECHAR TELA COMPLETA
// ========================================

if (
    closePlayerButton
) {

    closePlayerButton.addEventListener(
        "click",
        () => {

            playerScreen.classList.remove(
                "open"
            );

        }
    );

}


// ========================================
// ESC FECHA A TELA
// ========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            if (
                visualizerPanel &&
                visualizerPanel.classList.contains(
                    "open"
                )
            ) {

                visualizerPanel.classList.remove(
                    "open"
                );

                return;

            }


            if (
                playerScreen &&
                playerScreen.classList.contains(
                    "open"
                )
            ) {

                playerScreen.classList.remove(
                    "open"
                );

            }

        }

    }
);


// ========================================
// VISUALIZADOR — ABRIR
// ========================================

if (
    visualizerButton
) {

    visualizerButton.addEventListener(
        "click",
        () => {

            visualizerPanel.classList.add(
                "open"
            );

        }
    );

}


// ========================================
// VISUALIZADOR — FECHAR
// ========================================

if (
    closeVisualizer
) {

    closeVisualizer.addEventListener(
        "click",
        () => {

            visualizerPanel.classList.remove(
                "open"
            );

        }
    );

}


// ========================================
// MODOS DO ESPECTRO
// ========================================

visualizerModes.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                visualizerModes.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                spectrumMode =
                    button.dataset
                        .spectrumMode;


                console.log(
                    "VS Player — modo do espectro:",
                    spectrumMode
                );

            }
        );

    }
);


// ========================================
// VISUAL STÉRIO
// ========================================
//
// O Visual Stério NÃO é um modo.
//
// Ele permanece ativo dentro
// do sistema de visualização.
//
// Futuramente:
//
// Áudio
//   ↓
// AudioContext
//   ↓
// ChannelSplitter
//   ├── LEFT
//   └── RIGHT
//        ↓
//     Analisadores
//        ↓
//   Visual Stério
//        ↓
//      Canvas
//
// O spectrumMode apenas decide
// quais frequências serão exibidas.
//
// ========================================

function getSpectrumFrequencyRange() {

    switch (
        spectrumMode
    ) {

        case "bass":

            return {
                min: 20,
                max: 250
            };


        case "mid":

            return {
                min: 250,
                max: 4000
            };


        case "treble":

            return {
                min: 4000,
                max: 20000
            };


        case "all":

        default:

            return {
                min: 20,
                max: 20000
            };

    }

}


// ========================================
// FAVORITO — ESTRUTURA INICIAL
// ========================================

if (
    playerFavorite
) {

    playerFavorite.addEventListener(
        "click",
        async () => {

            if (
                !currentMusic
            ) {

                return;

            }


            currentMusic.favorite =
                !currentMusic.favorite;


            await saveMusic(
                currentMusic
            );


            playerFavorite.textContent =
                currentMusic.favorite
                    ? "♥"
                    : "♡";


            console.log(
                currentMusic.favorite
                    ? "Música favoritada."
                    : "Música removida dos favoritos."
            );

        }
    );

}


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


function changePage(
    pageName
) {

    const page =
        document.getElementById(
            `page-${pageName}`
        );


    if (!page) {

        return;

    }


    navItems.forEach(
        item => {

            item.classList.remove(
                "active"
            );

        }
    );


    const activeButton =
        document.querySelector(
            `[data-page="${pageName}"]`
        );


    if (
        activeButton
    ) {

        activeButton.classList.add(
            "active"
        );

    }


    pages.forEach(
        page => {

            page.classList.remove(
                "active-page"
            );

        }
    );


    page.classList.add(
        "active-page"
    );


    if (
        pageNames[pageName]
    ) {

        pageLabel.textContent =
            pageNames[
                pageName
            ].label;


        pageTitle.textContent =
            pageNames[
                pageName
            ].title;

    }


    localStorage.setItem(
        "vsplayer-last-page",
        pageName
    );

}


navItems.forEach(
    item => {

        item.addEventListener(
            "click",
            () => {

                changePage(
                    item.dataset.page
                );

            }
        );

    }
);


// ========================================
// INICIALIZAÇÃO
// ========================================

async function initializeVSPlayer() {

    try {

        await openDatabase();


        musicLibrary =
            await getAllMusic();


        renderLibrary();


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


        updatePlayButton();
        updateFullPlayButton();


        console.log(
            "VS Player iniciado."
        );


    } catch (
        error
    ) {

        console.error(
            "Erro ao iniciar VS Player:",
            error
        );


        alert(
            "Não foi possível inicializar o VS Player."
        );

    }

}


initializeVSPlayer();
