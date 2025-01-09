const words = {
    lotr: ['sauron', 'galadriel', 'gandalf', 'aragorn', 'frodo', 'elrond', 'arwen', 'legolas', 'gollum', 'gimli', 'balrog', 'eowyn', 'pippin', 'saruman', 'samwise', 'boromir', 'theoden', 'merry', 'faramir', 'eomer',  'elendil', 'grima'],
    marvel: ['ironman', 'thor', 'captainamerica', 'hulk', 'blackwidow', 'spiderman', 'captainmarvel', 'hawkeye', 'scarletwitch', 'vision', 'antman', 'starlord', 'gamora', 'doctorstrange', 'loki', 'thanos', 'ultron', 'groot', 'blackpanther', 'falcon', 'wintersoldier', 'warmachine'],
    legends: ['godfather', 'scarface']
};

const hints = {
    sauron: 'Dark Lord of Mordor',
    galadriel: 'Lady of Lothlórien',
    ironman: 'Genius, billionaire, playboy, philanthropist',
    thor: 'God of Thunder',
    godfather: 'Mafia boss',
    scarface: 'Famous gangster',
    captainamerica: 'Super soldier',
    hulk: 'Green giant',
    blackwidow: 'Master spy',
    spiderman: 'Friendly neighborhood hero',
    captainmarvel: 'Cosmic superhero',
    hawkeye: 'Expert archer',
    scarletwitch: 'Reality warper',
    vision: 'Synthezoid',
    antman: 'Size-shifting hero',
    starlord: 'Leader of the Guardians',
    gamora: 'Deadliest woman in the galaxy',
    doctorstrange: 'Master of the Mystic Arts',
    loki: 'God of Mischief',
    thanos: 'Mad Titan',
    ultron: 'Artificial intelligence',
    groot: 'Flora colossus',
    blackpanther: 'King of Wakanda',
    falcon: 'Winged Avenger',
    wintersoldier: 'Super soldier',
    warmachine: 'Armored Avenger',
    gandalf: 'Wizard of Middle-earth',
    aragorn: 'King of Gondor',
    frodo: 'Ring-bearer',
    elrond: 'Lord of Rivendell',
    arwen: 'Elven princess',
    legolas: 'Elven archer',
    gollum: 'Creature corrupted by the One Ring',
    gimli: 'Dwarf warrior',
    balrog: 'Demon of the ancient world',
    eowyn: 'Shieldmaiden of Rohan',
    pippin: 'Hobbit of the Shire',
    saruman: 'Corrupted wizard',
    samwise: 'Loyal friend of Frodo',
    boromir: 'Son of Denethor',
    theoden: 'King of Rohan',
    merry: 'Hobbit of the Shire',
    faramir: 'Brother of Boromir',
    eomer: 'Marshal of the Riddermark',
    
    elendil: 'High King of Arnor and Gondor',
    grima: 'Advisor to King Théoden'
};

let selectedWord = '';
let attempts = 3;
let jokerCount = 5;
let category = '';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    category = urlParams.get('category');
    if (category && words[category]) {
        loadNextWord();
    }

    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', () => playSound('../static/sounds/click.mp3'));
    });
});

function loadNextWord() {
    const collection = JSON.parse(localStorage.getItem('collection')) || [];
    const remainingWords = words[category].filter(word => !collection.includes(word));
    if (remainingWords.length === 0) {
        displayNotification('Tebrikler! Bu kategoriyi bitirdiniz.');
        return;
    }
    selectedWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    displayWord();
    displayHint();
    document.getElementById('next-word-button').style.display = 'none';
    hideNotification();
}

function displayWord() {
    const wordContainer = document.getElementById('word-container');
    wordContainer.innerHTML = '';
    addNewAttemptRow();
}

function displayHint() {
    const hintContainer = document.getElementById('hint-container');
    hintContainer.innerText = `İpucu: ${hints[selectedWord]}`;
}

function checkLetter(event) {
    const input = event.target;
    const inputs = Array.from(input.parentNode.children);
    const allFilled = inputs.every(input => input.value !== '');

    if (allFilled) {
        checkWord();
    } else if (input.nextElementSibling) {
        input.nextElementSibling.focus();
    }
}

function checkWord() {
    const inputs = document.getElementById('word-container').lastChild.children;
    let guessedWord = '';
    for (let input of inputs) {
        guessedWord += input.value.toLowerCase();
    }

    for (let i = 0; i < guessedWord.length; i++) {
        const input = inputs[i];
        const letter = guessedWord[i];
        if (selectedWord[i] === letter) {
            input.style.backgroundColor = 'green';
        } else if (selectedWord.includes(letter)) {
            input.style.backgroundColor = 'orange';
        } else {
            input.style.backgroundColor = 'red';
        }
    }

    if (guessedWord === selectedWord) {
        saveToCollection(selectedWord);
        displayNotification('Tebrikler! Kelimeyi doğru tahmin ettiniz.');
        playSound('../static/sounds/win.mp3');
        document.getElementById('view-image-button').style.display = 'block';
        document.getElementById('won-image').src = `../images/${selectedWord}.jpg`;
    } else {
        attempts--;
        document.getElementById('attempts-count').innerText = attempts;
        if (attempts > 0) {
            addNewAttemptRow();
        } else {
            displayNotification(`Üzgünüz, kelimeyi bilemediniz. Doğru kelime: ${selectedWord}`);
            playSound('../static/sounds/lose.mp3');
        }
    }
    document.getElementById('next-word-button').style.display = 'block';
}

function addNewAttemptRow() {
    const wordContainer = document.getElementById('word-container');
    const newRow = document.createElement('div');
    for (let i = 0; i < selectedWord.length; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.oninput = checkLetter;
        newRow.appendChild(input);
    }
    wordContainer.appendChild(newRow);
    newRow.firstChild.focus();
}

function useJoker() {
    if (jokerCount > 0) {
        jokerCount--;
        document.getElementById('joker-count').innerText = jokerCount;
        revealRandomLetter();
    }
}

function revealRandomLetter() {
    const inputs = document.getElementById('word-container').lastChild.children;
    const unrevealedIndices = [];
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === '') {
            unrevealedIndices.push(i);
        }
    }
    if (unrevealedIndices.length > 0) {
        const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
        inputs[randomIndex].value = selectedWord[randomIndex];
        inputs[randomIndex].style.backgroundColor = 'green';
        checkLetter({ target: inputs[randomIndex] }); // Trigger checkLetter after revealing a letter
    }
}

function displayNotification(message) {
    const notificationContainer = document.getElementById('notification-container');
    notificationContainer.innerHTML = `
        <div class="notification">
            <span class="close" onclick="hideNotification()">&times;</span>
            ${message}
        </div>
    `;
}

function hideNotification() {
    const notificationContainer = document.getElementById('notification-container');
    notificationContainer.innerHTML = '';
}

function saveToCollection(word) {
    let collection = JSON.parse(localStorage.getItem('collection')) || [];
    if (!collection.includes(word)) {
        collection.push(word);
        localStorage.setItem('collection', JSON.stringify(collection));
    }
}

function toggleImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'block';
    } else {
        modal.style.display = 'none';
    }
}

function nextWord() {
    loadNextWord();
}

function goBack() {
    window.history.back();
}

function goBackToCategories() {
    window.location.href = 'category.html';
}

function playSound(src) {
    const audio = new Audio(src);
    audio.play();
}
