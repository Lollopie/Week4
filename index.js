const player = document.querySelector('.player');
const jumpLengthInMillis = 1600;
let inJump = false;
function removeJump() {
    player.classList.remove('jump');
    inJump = false;
    //Forces the browser to reflow reference:https://stackoverflow.com/a/63561659
    player.offsetWidth;
}

addEventListener('keydown', (e) => {
    if(e.key === " ") {
        if (!inJump) {
            inJump = true;
            player.classList.add('jump');
            setTimeout(removeJump, 1600);
        }
    }
})
