const canvas = document.querySelector('.canvas');
const mainMenuContainer = document.querySelector('.main-menu-container');
const mainMenu = document.querySelector('.main-menu');
const menu = document.querySelector('.menu');
const playerWalking = canvas.querySelector('.player.walking');
const playerJumping = canvas.querySelector('.player.jumping');
const scoreField = canvas.querySelector('.score');
const gameAudio = canvas.querySelector('.game-audio');

const gameOverCard = document.querySelector('.menu.game-over');
const finalScore = gameOverCard.querySelector('.final-score');
const highScore = gameOverCard.querySelector('.high-score');
const gameOverFinalScoreField = gameOverCard.querySelector('.game-over-final-score');
const gameOverHighScoreField = gameOverCard.querySelector('.game-over-high-score');

const jumpLengthInTicks = 60;
const obstacleAnimationInTicks = 150;
const obstacleSpawnBaseLikelihood = 80;
const minTicksToNextObstacle = 100;

let inJump = false;
let gameOver = false;
let drawingHitboxes = false;
let isPaused = false;
let isMainMenuOpen = true;

let obstacles = [];
let removeObstacleTicks = [];
let obstacleSpawnLikelihood = obstacleSpawnBaseLikelihood;
let nextObstacleTick = 0;
let removeJumpTick = Infinity;
let tick = 0;
let tickTimer = null;

let highScoreValue = parseInt(localStorage.getItem('highScore')) || 0;
highScore.textContent = highScoreValue;

const obstacleTypes = [
    { width: 50, height: 50, image: 'singlebox.png' },
    { width: 90, height: 50, image: 'widebox.png' },
    { width: 50, height: 100, image: 'tallbox.png' }
];

function removeJump() {
    if (!gameOver) {
        playerJumping.classList.remove('jump');
        playerJumping.classList.add('hidden');
        playerWalking.classList.remove('hidden');
        inJump = false;
    }
}

function incrementScore() {
    const currentScore = parseInt(scoreField.textContent.split(': ')[1]);
    scoreField.textContent = 'Score: ' + (currentScore + 1);
}

function removeObstacle() {
    while (tick >= removeObstacleTicks[0]) {
        removeObstacleTicks.shift();
        obstacles.shift().remove();

        if (!gameOver) {
            incrementScore();
        }
    }
}

function shouldGenerateNewObstacle(likelihood) {
    return Math.floor(Math.random() * Math.pow(2, likelihood)) === 0;
}

function createObstacle(likelihood) {
    if (shouldGenerateNewObstacle(likelihood)) {
        const obstacle = document.createElement('img');
        const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        obstacle.setAttribute('src', `public/images/${obstacleType.image}`);

        obstacle.className = 'block' + (drawingHitboxes ? ' drawHitbox' : '');
        obstacle.style.width = `${obstacleType.width}px`;
        obstacle.style.height = `${obstacleType.height}px`;
        canvas.appendChild(obstacle);
        obstacles.push(obstacle);
        removeObstacleTicks.push(tick + obstacleAnimationInTicks);
        return obstacle;
    }
    return null;
}

function isColliding(element1, element2) {
    const a = element1.getBoundingClientRect();
    const b = element2.getBoundingClientRect();

    return (
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top
    );
}

function checkCollision() {
    const player = inJump ? playerJumping : playerWalking;
    return obstacles.some((obstacle) => isColliding(obstacle, player));
}

function handleGameOver() {
    gameOver = true;
    clearTimeout(tickTimer);
    tickTimer = null;

    const score = parseInt(scoreField.textContent.split(': ')[1]);
    finalScore.textContent = score;

    const isNewRecord = score > highScoreValue;
    if (isNewRecord) {
        highScoreValue = score;
        highScore.textContent = score;
        localStorage.setItem('highScore', score);
    }
    gameOverFinalScoreField.classList.toggle('rainbow_text_animated', isNewRecord);
    gameOverHighScoreField.classList.toggle('rainbow_text_animated', isNewRecord);

    gameOverCard.classList.remove('hidden');
    obstacles.forEach((obstacle) => obstacle.classList.add('paused'));
    playerJumping.classList.add('paused');
    playerWalking.classList.add('paused');
    canvas.classList.add('muted');
}

function performGameTick() {
    if (checkCollision()) {
        handleGameOver();
    }
    if (tick >= nextObstacleTick) {
        const obstacle = createObstacle(obstacleSpawnLikelihood);
        if (obstacle === null) {
            obstacleSpawnLikelihood -= 1;
        } else {
            obstacleSpawnLikelihood = obstacleSpawnBaseLikelihood;
            nextObstacleTick = tick + minTicksToNextObstacle;
        }
    }
    if (tick >= removeJumpTick) {
        removeJump();
        removeJumpTick = Infinity;
    }
    if (tick >= removeObstacleTicks[0]) {
        removeObstacle();
    }
    if (!gameOver && !isPaused) {
        tick += 1;
        tickTimer = setTimeout(performGameTick, 10);
    }
}

function togglePause() {
    if (gameOver) {
        return;
    }
    isPaused = !isPaused;
    obstacles.forEach((obstacle) => obstacle.classList.toggle('paused'));
    playerJumping.classList.toggle('paused');
    playerWalking.classList.toggle('paused');
    canvas.classList.toggle('muted');
    menu.classList.toggle('hidden');

    clearTimeout(tickTimer);
    tickTimer = null;

    if (!isPaused) {
        performGameTick();
    }
}

function clearObstacles() {
    obstacles.forEach((obstacle) => obstacle.remove());
    obstacles = [];
    removeObstacleTicks = [];
}

function resetGame() {
    clearTimeout(tickTimer);
    tickTimer = null;

    clearObstacles();
    tick = 0;
    obstacleSpawnLikelihood = obstacleSpawnBaseLikelihood;
    nextObstacleTick = 0;
    removeJumpTick = Infinity;
    inJump = false;
    gameOver = false;
    isPaused = false;

    scoreField.textContent = 'Score: 0';
    scoreField.classList.remove('hidden');
    gameAudio.classList.remove('hidden');
    gameOverCard.classList.add('hidden');
    menu.classList.add('hidden');
    playerJumping.classList.remove('jump', 'paused');
    playerJumping.classList.add('hidden');
    playerWalking.classList.remove('hidden', 'paused');
    canvas.classList.remove('muted');

    performGameTick();
}

function returnToMainMenu() {
    clearTimeout(tickTimer);
    tickTimer = null;

    clearObstacles();
    gameOver = false;
    isPaused = false;
    gameOverCard.classList.add('hidden');
    menu.classList.add('hidden');
    canvas.classList.remove('muted');

    mainMenuContainer.classList.remove('hidden');
    isMainMenuOpen = true;
    scoreField.classList.add('hidden');
    gameAudio.classList.add('hidden');
}

const playButton = document.querySelector('.play-button');
playButton.addEventListener('click', () => {
    mainMenuContainer.classList.add('hidden');
    isMainMenuOpen = false;
    scoreField.classList.remove('hidden');
    gameAudio.classList.remove('hidden');
    resetGame();
});

const resumeButton = document.querySelector('.resume-button');
resumeButton.addEventListener('click', () => togglePause());

const menuRestartButton = menu.querySelector('.restart-button');
menuRestartButton.addEventListener('click', () => resetGame());

const gameOverRestartButton = gameOverCard.querySelector('.restart-button');
gameOverRestartButton.addEventListener('click', () => resetGame());

const mainMenuButton = gameOverCard.querySelector('.main-menu-return-button');
mainMenuButton.addEventListener('click', () => returnToMainMenu());

const settingsMenu = document.querySelector('.settings-menu');
const settingsMainMenuButton = document.querySelector('.settings-button');
let isSettingsMenuOpen = false;

function closeSettingsMenu() {
    settingsMenu.classList.add('hidden');
    mainMenu.classList.remove('muted');
    isSettingsMenuOpen = false;
}

settingsMainMenuButton.addEventListener('click', () => {
    settingsMenu.classList.remove('hidden');
    mainMenu.classList.add('muted');
    isSettingsMenuOpen = true;
});
settingsMenu
    .querySelector('.settings-menu-exit-button')
    .addEventListener('click', () => closeSettingsMenu());

const howToPlayMenu = document.querySelector('.htp-menu');
const howToPlayMainMenuButton = document.querySelector('.htp-button');
let isHowToPlayMenuOpen = false;

function closeHowToPlayMenu() {
    howToPlayMenu.classList.add('hidden');
    mainMenu.classList.remove('muted');
    isHowToPlayMenuOpen = false;
}

howToPlayMainMenuButton.addEventListener('click', () => {
    howToPlayMenu.classList.remove('hidden');
    mainMenu.classList.add('muted');
    isHowToPlayMenuOpen = true;
});
howToPlayMenu
    .querySelector('.htp-menu-exit-button')
    .addEventListener('click', () => closeHowToPlayMenu());

const sfxAudio = document.querySelector('.sfx');

addEventListener('click', () => {
    musicAudioElement.play().catch(() => {});
}, { once: true });

addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        if (!inJump && !gameOver && !isPaused && !isMainMenuOpen) {
            e.preventDefault();
            inJump = true;
            playerJumping.classList.add('jump');
            playerJumping.classList.remove('hidden');
            playerWalking.classList.add('hidden');
            removeJumpTick = tick + jumpLengthInTicks;
            sfxAudio.currentTime = 0;
            sfxAudio.play().catch(() => {});
        }
    } else if (e.key === 'h') {
        if (isMainMenuOpen) {
            return;
        }
        drawingHitboxes = !drawingHitboxes;
        playerJumping.classList.toggle('drawHitbox');
        playerWalking.classList.toggle('drawHitbox');
        obstacles.forEach((obstacle) => obstacle.classList.toggle('drawHitbox'));
    } else if (e.key === 'Escape') {
        if (isMainMenuOpen) {
            if (isSettingsMenuOpen) {
                closeSettingsMenu();
            } else if (isHowToPlayMenuOpen) {
                closeHowToPlayMenu();
            }
        } else if (gameOver) {
            returnToMainMenu();
        } else {
            togglePause();
        }
    }
});