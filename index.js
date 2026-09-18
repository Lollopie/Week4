const canvas = document.querySelector('.canvas');
const mainMenuContainer = document.querySelector('.main-menu-container');
const mainMenu = document.querySelector('.main-menu');
const menu = document.querySelector('.menu');
const playerWalking = canvas.querySelector('.player.walking');
const playerJumping = canvas.querySelector('.player.jumping');
const scoreField = canvas.querySelector('.score');
const jumpLengthInTicks = 60;
const obstacleAnimationInTicks = 150;
let inJump = false;
let gameOver = false;
let drawingHitboxes = false;
let isPaused = false;
let isMainMenuOpen = true;
const gameOverCard = document.querySelector('.menu.game-over');
const finalScore = gameOverCard.querySelector('.final-score');
const highScore = gameOverCard.querySelector('.high-score');
const gameOverFinalScoreField = gameOverCard.querySelector('.game-over-final-score');
const gameOverHighScoreField = gameOverCard.querySelector('.game-over-high-score');

function removeJump() {
    if (!gameOver) {
        playerJumping.classList.remove('jump');
        playerJumping.classList.add('hidden');
        playerWalking.classList.remove('hidden');
        inJump = false;
        playerWalking.offsetWidth;
    }
}

function removeObstacle() {
    while (tick >= removeObstacleTicks[0]) {
        removeObstacleTicks.shift();
        canvas.removeChild(obstacles.shift());

        if (!gameOver) {
            incrementScore();
        }
    }
}

function incrementScore() {
    const currentScore = parseInt(scoreField.textContent.split(': ')[1]);
    scoreField.textContent = 'Score: ' + (currentScore + 1);
}

let obstacles = [];
let removeObstacleTicks = [];

function shouldGenerateNewObstacle(obstacleSpawnLikelihood) {
    return Math.floor(Math.random() * Math.pow(2, obstacleSpawnLikelihood)) === 0;
}

const obstacleTypes = [
    { width: 50, height: 50, image: 'singlebox.png' },
    { width: 90, height: 50, image: 'widebox.png' },
    { width: 50, height: 100, image: 'tallbox.png' }
];

function createObstacle(obstacleSpawnLikelihood) {
    if (shouldGenerateNewObstacle(obstacleSpawnLikelihood)) {
        const obstacle = document.createElement('img');
        const obstacleType =
            obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        obstacle.setAttribute('src', `public/images/${obstacleType.image}`);

        obstacle.className = 'block' + (drawingHitboxes ? " drawHitbox" : "");
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
    for (let i = 0; i < obstacles.length; i++) {
        const player = inJump ? playerJumping : playerWalking;
        if (isColliding(obstacles[i], player)) {
            return true;
        }
    }
    return false;
}
const obstacleSpawnBaseLikelihood = 80;
let obstacleSpawnLikelihood = obstacleSpawnBaseLikelihood;
const minTicksToNextObstacle = 100;
let nextObstacleTick = 0;
let removeJumpTick = Infinity;
let tick = 0;

function handleGameOver() {
    console.log('Game over');
    gameOver = true;
    const score = parseInt(scoreField.textContent.split(': ')[1]);
    finalScore.textContent = score;
    if (score > highScore.textContent) {
        gameOverFinalScoreField.classList.add('rainbow_text_animated');
        gameOverHighScoreField.classList.add('rainbow_text_animated');
        highScore.textContent = score;
    } else {
        gameOverFinalScoreField.classList.remove('rainbow_text_animated');
        gameOverHighScoreField.classList.remove('rainbow_text_animated');
    }
    gameOverCard.classList.remove('hidden');
    obstacles.forEach((obstacle) => {
        obstacle.classList.add('paused');
    });
    playerJumping.classList.add('paused');
    playerWalking.classList.add('paused');
    canvas.classList.add('muted');
}

function performGameTick() {
    const hasCollided = checkCollision();
    if (hasCollided) {
        handleGameOver();
    }
    if (tick >= nextObstacleTick) {
        const obstacle = createObstacle(obstacleSpawnLikelihood);
        if (obstacle === null) {
            obstacleSpawnLikelihood -= 1;
        }
        else {
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
        setTimeout(performGameTick, 10);
    }
}

function togglePause() {
    if (!gameOver) {
        isPaused = !isPaused;
        obstacles.forEach((obstacle) => {
            obstacle.classList.toggle('paused');
        });
        playerJumping.classList.toggle('paused');
        playerWalking.classList.toggle('paused');
        canvas.classList.toggle('muted');
        menu.classList.toggle('hidden');
        if (!isPaused) {
            performGameTick();
        }
    }
}

function startGame() {
    performGameTick();
}

function resetGame() {
    obstacles.forEach((obstacle) => obstacle.remove());
    obstacles = [];
    removeObstacleTicks = [];
    tick = 0;
    obstacleSpawnLikelihood = obstacleSpawnBaseLikelihood;
    nextObstacleTick = 0;
    removeJumpTick = Infinity;
    inJump = false;
    gameOver = false;
    isPaused = false;
    scoreField.textContent = 'Score: 0';
    gameOverCard.classList.add('hidden');
    menu.classList.add('hidden');
    playerJumping.classList.remove('jump', 'paused');
    playerJumping.classList.add('hidden');
    playerWalking.classList.remove('hidden', 'paused');
    canvas.classList.remove('muted');
    startGame();
}

const playButton = document.querySelector('.play-button');
playButton.addEventListener('click', () => {
    mainMenuContainer.classList.add('hidden');
    isMainMenuOpen = false;
    resetGame();
})

const resumeButton = document.querySelector('.resume-button');
resumeButton.addEventListener('click', () => togglePause());
const menuRestartButton = document.querySelector('.menu-button.restart-button');
menuRestartButton.addEventListener('click', () => resetGame());
const gameOverRestartButton = gameOverCard.querySelector('.restart-button');
gameOverRestartButton.addEventListener('click', () => resetGame());
const mainMenuButton = gameOverCard.querySelector('.main-menu-return-button');
mainMenuButton.addEventListener('click', () => {
    mainMenuContainer.classList.remove('hidden');
    isMainMenuOpen = true;
});
const settingsMainMenuButton = document.querySelector('.settings-button');
const settingsMenu = document.querySelector('.settings-menu');
let isSettingsMenuOpen = false;
settingsMainMenuButton.addEventListener('click', () => {
    settingsMenu.classList.remove('hidden');
    mainMenu.classList.add('muted');
    isSettingsMenuOpen = true;
});
const settingsMenuExitButton = settingsMenu.querySelector('.settings-menu-exit-button');
settingsMenuExitButton.addEventListener('click', () => {
    settingsMenu.classList.add('hidden');
    mainMenu.classList.remove('muted');
    isSettingsMenuOpen = false;
});
let isHowToPlayMenuOpen = false;
const howToPlayMenu = document.querySelector('.htp-menu');
const howToPlayMainMenuButton = document.querySelector('.htp-button');
howToPlayMainMenuButton.addEventListener('click', () => {
    howToPlayMenu.classList.remove('hidden');
    mainMenu.classList.add('muted');
    isHowToPlayMenuOpen = true;
});
const howToPlayMenuExitButton = howToPlayMenu.querySelector('.htp-menu-exit-button');
howToPlayMenuExitButton.addEventListener('click', () => {
    howToPlayMenu.classList.add('hidden');
    mainMenu.classList.remove('muted');
    isHowToPlayMenuOpen = false;
});

const sfxAudio = document.querySelector('.sfx');
addEventListener('keydown', (e) => {
    if (e.key === " ") {
        if (!inJump && !gameOver && !isPaused) {
            e.preventDefault();
            inJump = true;
            playerJumping.classList.add('jump');
            playerJumping.classList.remove('hidden');
            playerWalking.classList.add('hidden');
            removeJumpTick = tick + jumpLengthInTicks;
            sfxAudio.setAttribute('src', 'public/music/jump.mp3');
            sfxAudio.play();
        }
    }
    else if (e.key === "h") {
        drawingHitboxes = !drawingHitboxes;
        playerJumping.classList.toggle('drawHitbox');
        playerWalking.classList.toggle('drawHitbox');
        obstacles.forEach((obstacle) => obstacle.classList.toggle('drawHitbox'));
    }
    else if (e.key === 'Escape') {
        if (!isMainMenuOpen) {
            togglePause();
        } else {
            if (isSettingsMenuOpen) {
                isSettingsMenuOpen = false;
                settingsMenu.classList.add('hidden');
                mainMenu.classList.remove('muted');
            } else if (isHowToPlayMenuOpen) {
                isHowToPlayMenuOpen = false;
                howToPlayMenu.classList.add('hidden');
                mainMenu.classList.remove('muted');
            }
        }
    }
})

