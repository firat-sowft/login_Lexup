document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', () => playSound('../static/sounds/click.mp3'));
    });
});

function startGame() {
    window.location.href = 'category.html';
}

function showCollection() {
    window.location.href = 'collection.html'; // Redirect to the collection page
}

function logout() {
    window.location.href = 'index.html'; // Redirect to the login page
}

function showHowToPlay() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('how-to-play').style.display = 'block';
}

function selectCategory(category) {
    window.location.href = `play.html?category=${category}`;
}

function goBack() {
    document.getElementById('how-to-play').style.display = 'none';
    document.getElementById('categories-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

function showMainMenu() {
    document.getElementById('categories-menu').style.display = 'none';
    document.getElementById('how-to-play').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

function playSound(src) {
    const audio = new Audio(src);
    audio.play();
}
