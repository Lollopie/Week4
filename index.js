const canvas = document.querySelector('.canvas');
const menu = document.querySelector('.menu');
const playerWalking = canvas.querySelector('.player.walking');
const playerJumping = canvas.querySelector('.player.jumping');
const scoreField = canvas.querySelector('.score');
const musicVolumeNumber = document.querySelector('#music-volume-number');
const sfxVolumeNumber = document.querySelector('#sfx-volume-number');
const music = document.querySelector('.background-music');
music.volume = 0.3;
const sfx = document.querySelector('.sfx');
sfx.volume = 0.3;
const canvasWidth = canvas.clientWidth;
const jumpLengthInTicks = 60;
const obstacleAnimationInTicks = 150;
let inJump = false;
let gameOver = false;
let drawingHitboxes = false;
let isPaused = false;
const gameOverCard = canvas.querySelector('.game-over.game-card');
const finalScore = gameOverCard.querySelector('.final-score');

function removeJump() {
    if (!gameOver) {
        playerJumping.classList.remove('jump');
        playerJumping.classList.add('hidden');
        playerWalking.classList.remove('hidden');
        inJump = false;
        //Forces the browser to reflow reference:https://stackoverflow.com/a/63561659
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
    { width: 50, height: 50 },
    { width: 90, height: 50 },
    { width: 50, height: 100 }
];

function createObstacle(obstacleSpawnLikelihood) {
    if (shouldGenerateNewObstacle(obstacleSpawnLikelihood)) {
        const obstacle = document.createElement('img');
        const obstacleType =
            obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

        obstacle.setAttribute('src', 'public/images/singlebox.png')
        const width = 30 + Math.floor(Math.random() * 51);
        const height = 30 + Math.floor(Math.random() * 101);

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
let removeJumpTick = 0;
let tick = 0;

function performGameTick() {
    const isColliding = checkCollision();
    if (isColliding) {
        console.log('Game over');
        gameOver = true;
        finalScore.textContent = scoreField.textContent.split(': ')[1];
        gameOverCard.classList.remove('hidden');
        obstacles.forEach((obstacle) => {
            obstacle.classList.add('paused');
        });
        playerJumping.classList.add('paused');
        playerWalking.classList.add('paused');
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
    if(!gameOver) {
        isPaused = !isPaused;
        obstacles.forEach((obstacle) => {
            obstacle.classList.toggle('paused');
        });
        playerJumping.classList.toggle('paused');
        playerWalking.classList.toggle('paused');
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
    startGame();
}

startGame();

const resumeButton = document.querySelector('.resume-button');
resumeButton.addEventListener('click', () => togglePause());
const menuRestartButton = document.querySelector('.menu-button.restart-button');
menuRestartButton.addEventListener('click', () => resetGame());
const gameOverRestartButton = document.querySelector('.restart-button');
gameOverRestartButton.addEventListener('click', () => resetGame());

addEventListener('keydown', (e) => {
    if (e.key === " ") {
        if (!inJump && !gameOver) {
            e.preventDefault();
            inJump = true;
            playerJumping.classList.add('jump');
            playerJumping.classList.remove('hidden');
            playerWalking.classList.add('hidden');
            removeJumpTick = tick + jumpLengthInTicks;
        }
    }
    else if (e.key === "h") {
        drawingHitboxes = !drawingHitboxes;
        playerJumping.classList.toggle('drawHitbox');
        playerWalking.classList.toggle('drawHitbox');
        obstacles.forEach((obstacle) => obstacle.classList.toggle('drawHitbox'));
    }
    else if (e.key === 'Escape') {
        togglePause();
    }
})

const musicVolume = document.querySelector("#music-volume");
const sfxVolume = document.querySelector('#sfx-volume');
const activeColor = "#6D7D76";
const inactiveColor = "#2C363F";

function adjustVolume(volumeRange, volumeNumber, audioElement) {
    const ratio = Math.floor((volumeRange.value - volumeRange.min) / (volumeRange.max - volumeRange.min) * 100);
    volumeRange.style.background = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`;
    volumeNumber.textContent = `${ratio}%`;
    volumeNumber.style.left = `${ratio}%`;
    audioElement.volume = ratio / 100;
}

musicVolume.addEventListener("input", function(){
    adjustVolume(musicVolume, musicVolumeNumber, music);
});

sfxVolume.addEventListener("input", function(){
    adjustVolume(sfxVolume, sfxVolumeNumber, sfx);
});


const songOptions = [...document.querySelectorAll('.bg-music')];
songOptions.forEach((songOption) => {songOption.addEventListener("click", function() {
    const songName = this.textContent.slice(4);
    music.setAttribute('src', `public/music/${songName}.mp3`);
    const activeSongOption = songOptions.filter((songOption) => songOption.textContent[1] === 'x')[0];
    activeSongOption.classList.remove('bg-music-active');
    activeSongOption.textContent = '[ ]' + activeSongOption.textContent.slice(3); 
    songOption.classList.add('bg-music-active');
    songOption.textContent = '[x]' + songOption.textContent.slice(3); 
})});
