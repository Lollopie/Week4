const canvas = document.querySelector('.canvas');
const block = canvas.querySelector('.block');
const player = canvas.querySelector('.player');
const canvasWidth = parseInt(window.getComputedStyle(canvas)['width'].split('px')[0]);
const canvasHeight = parseInt(window.getComputedStyle(canvas)['height'].split('px')[0]);
const blockWidth = parseInt(window.getComputedStyle(block)['width'].split('px')[0]);
const playerHeight = parseInt(window.getComputedStyle(player)['height'].split('px')[0]);
const stepSize = 5;
function moveBlock() {
  const currentTranslate = parseInt(block.getAttribute('style').split('left: ')[1].split('px')[0]);
  let newTranslate = currentTranslate - stepSize;
  if (newTranslate < 0 - blockWidth) {
    newTranslate = canvasWidth + blockWidth;
  }
  block.setAttribute('style', `left: ${newTranslate}px;`);
  setTimeout(moveBlock, 10);
}

setTimeout(moveBlock, 10);
const jumpHeight = 2;
const tickLimit = 80;
let inJump = false;
function movePlayer(tick = 0, direction = 1) {
    if (tick === tickLimit * 2 && direction === -1) {
        inJump = false;
        return;
    }
    const currentTranslate = parseInt(player.getAttribute('style').split('top: ')[1].split('px')[0]);
    if (tick === tickLimit) {
        direction = -1;
    }
    const newTranslate = currentTranslate - jumpHeight * direction;
    player.setAttribute('style', `top: ${newTranslate}px;`);
    setTimeout(() => movePlayer(tick + 1, direction), 10);
}

addEventListener('keydown', (e) => {
    if(e.key === " ") {
        if (!inJump) {
            inJump = true;
            movePlayer();
        }
    }
})
