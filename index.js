const canvas = document.querySelector('.canvas');
const playerWalking = canvas.querySelector('.player.walking'); 
const playerJumping = canvas.querySelector('.player.jumping'); 
const scoreField = canvas.querySelector('.score');
const canvasWidth = canvas.clientWidth;
const jumpLengthInTicks = 160;
const obstacleAnimationInTicks = 290;
let inJump = false;
let gameOver = false;
let drawingHitboxes = false;
let isPaused = false;

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

function createObstacle(obstacleSpawnLikelihood) {
    if (shouldGenerateNewObstacle(obstacleSpawnLikelihood)) {
        const obstacle = document.createElement('img');
        obstacle.setAttribute('src', 'public/singlebox.png')
        const width = 30 + Math.floor(Math.random() * 51);
        const height = 30 + Math.floor(Math.random() * 101);

        obstacle.className = 'block' + (drawingHitboxes ? " drawHitbox" : "");
        obstacle.style.width = `${width}px`;
        obstacle.style.height = `${height}px`;
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

setTimeout(performGameTick, 10);

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
        if(!gameOver) {
            isPaused = !isPaused;
            obstacles.forEach((obstacle) => {
                obstacle.classList.toggle('paused');
            });
            playerJumping.classList.toggle('paused');
            playerWalking.classList.toggle('paused');
            if (!isPaused) {
                performGameTick();
            }
        }
    }
})
