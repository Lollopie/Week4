const canvas = document.querySelector('.canvas');
const player = canvas.querySelector('.player');
const canvasWidth = parseInt(window.getComputedStyle(canvas)['width'].split('px')[0]);
const canvasHeight = parseInt(window.getComputedStyle(canvas)['height'].split('px')[0]);
const playerHeight = parseInt(window.getComputedStyle(player)['height'].split('px')[0]);
const stepSize = 5;

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

setTimeout(moveObstacles, 10);

const jumpHeight = 3;
const tickLimit = 40;
let inJump = false;
let spaceHeld = false;
const groundTop = 300;
const maxJumpHeight = 300;

function movePlayer(direction = 1) {
    const currentTop = parseInt(player.style.top);

    // Start falling when Space is released or maximum height is reached
    if (direction === 1 && (
        !spaceHeld ||
        currentTop <= groundTop - maxJumpHeight
    )) {
        direction = -1;
    }

    const newTop = currentTop - jumpHeight * direction;
    player.style.top = `${newTop}px`;

    // Landed back on the ground
    if (direction === -1 && newTop >= groundTop) {
        player.style.top = `${groundTop}px`;
        inJump = false;
        return;
    }

    setTimeout(() => movePlayer(direction), 10);
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

const clickEvents = ['keydown', 'click'];

['keydown', 'mousedown'].forEach((event) => {
    addEventListener(event, (e) => {
        if (e.code === 'Space' || e.type === 'mousedown') {
            e.preventDefault();
            spaceHeld = true;

            if (!inJump) {
                inJump = true;
                movePlayer();
            }
        }
    })
});

['keyup', 'mouseup'].forEach((event) => {
    addEventListener(event, (e) => {
        if (e.code === 'Space' || e.type === 'mouseup') {
            spaceHeld = false;
        }
    })
});
