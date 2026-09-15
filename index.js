const player = document.querySelector('.player');
const canvas = document.querySelector('.canvas');
const canvasWidth = canvas.clientWidth;
const jumpLengthInMillis = 1600;
const stepSize = 5;
const minimumGap = 250;
let inJump = false;
function removeJump() {
    player.classList.remove('jump');
    inJump = false;
    //Forces the browser to reflow reference:https://stackoverflow.com/a/63561659
    player.offsetWidth;
}

function createObstacles(amount) {
    const obstacles = [];

    for (let index = 0; index < amount; index += 1) {
        const obstacle = document.createElement('div');
        const width = 30 + Math.floor(Math.random() * 51);
        const height = 30 + Math.floor(Math.random() * 101);
        const left = canvasWidth + index * 500;

        obstacle.className = 'block';
        obstacle.style.width = `${width}px`;
        obstacle.style.height = `${height}px`;
        obstacle.style.left = `${left}px`;
        obstacle.style.top = `${350 - height}px`;
        canvas.appendChild(obstacle);
        obstacles.push(obstacle);
    }

    return obstacles;
}

const obstacles = createObstacles(5);

function moveObstacles() {
    obstacles.forEach((obstacle) => {
        const obstacleWidth = obstacle.offsetWidth;
        const currentLeft = parseInt(obstacle.style.left, 10);
        let newLeft = currentLeft - stepSize;

        if (newLeft < -obstacleWidth) {
            newLeft = canvasWidth + obstacleWidth;
        }

        obstacle.style.left = `${newLeft}px`;

        if (isColliding(obstacle, player)) {
            alert('Game over!');
            return;
        }
    });

    if (obstacles.some((obstacle) => isColliding(obstacle, player))) {
        return;
    }

    setTimeout(moveObstacles, 10);
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

setTimeout(moveObstacles, 10);

addEventListener('keydown', (e) => {
    if(e.key === " ") {
        if (!inJump) {
            e.preventDefault();
            inJump = true;
            player.classList.add('jump');
            setTimeout(removeJump, 1600);
        }
    }
})
