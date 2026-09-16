const player = document.querySelector('.player');
const canvas = document.querySelector('.canvas');
const canvasWidth = canvas.clientWidth;
const jumpLengthInMillis = 1600;
const obstacleAnimationInMillis = 3000;
let inJump = false;
let gameOver = false;

function removeJump() {
    if (!gameOver) {
        player.classList.remove('jump');
        inJump = false;
        //Forces the browser to reflow reference:https://stackoverflow.com/a/63561659
        player.offsetWidth;
    }
}

let obstacles = [];

function shouldGenerateNewObstacle(obstacleSpawnLikelihood) {
    return Math.floor(Math.random() * Math.pow(2, obstacleSpawnLikelihood)) === 0;
}

function createObstacle(obstacleSpawnLikelihood) {
    if (shouldGenerateNewObstacle(obstacleSpawnLikelihood)) {
        const obstacle = document.createElement('div');
        const width = 30 + Math.floor(Math.random() * 51);
        const height = 30 + Math.floor(Math.random() * 101);
        const left = canvasWidth;

        obstacle.className = 'block';
        obstacle.style.width = `${width}px`;
        obstacle.style.height = `${height}px`;
        obstacle.style.left = `${left}px`;
        obstacle.style.top = `${350 - height}px`;
        canvas.appendChild(obstacle);
        obstacles.push(obstacle);
        setTimeout(()=>{
            if(!gameOver) {
                canvas.removeChild(obstacle);
                obstacles = obstacles.filter((obstacleX) => obstacleX != obstacle);
            }
        }, obstacleAnimationInMillis);
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

function performGameTick(tick = 0) {
    const isColliding = checkCollision();
    if (isColliding) {
        console.log('Game over');
        gameOver = true;
        obstacles.forEach((obstacle) => {
            obstacle.classList.add('paused');
        });
        player.classList.add('paused');
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
    if (!gameOver) {
        setTimeout(() => performGameTick(tick + 1), 10);
    }
}

setTimeout(performGameTick, 10);

addEventListener('keydown', (e) => {
    if (e.key === " ") {
        if (!inJump && !gameOver) {
            e.preventDefault();
            inJump = true;
            player.classList.add('jump');
            setTimeout(removeJump, jumpLengthInMillis);
        }
    }
})
