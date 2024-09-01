const game = document.getElementById('game');
const player = document.getElementById('player');
let platforms = [];
let isJumping = false;
let hasPlayerLanded = false;
let gravity = 1;
let velocityY = 0;
let velocityX = 0;

const keys = {
    right: false,
    left: false
};

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        keys.right = true;
    }
    if (event.key === 'ArrowLeft') {
        keys.left = true;
    }
    if (event.key === ' ' && !isJumping) {
        isJumping = true;
        velocityY = -25;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowRight') {
        keys.right = false;
    }
    if (event.key === 'ArrowLeft') {
        keys.left = false;
    }
});

function generatePlatformHeight() {
    return parseInt(Math.random() * 100);
}

function createPlatforms(number) {
    let startingHorizontalPositionForPlatforms = 100, startingVerticalPositionForPlatforms = 200;
    let platforms = [];
    for (let index = 0; index < number; index++) {
        const platform = document.createElement('div');
        platform.style.position = 'absolute';
        platform.style.left = `${startingHorizontalPositionForPlatforms}px`;
        platform.style.top = `${startingVerticalPositionForPlatforms + generatePlatformHeight() * 5}px`;
        platform.style.border = '2px solid orange';
        platform.style.backgroundColor = 'brown';
        platform.style.width = '200px';
        platform.style.height = '20px';
        game.appendChild(platform);
        platforms.push(platform);
        startingHorizontalPositionForPlatforms += 250;
    }
    return platforms;
}

function init() {
    player.style.left = `${game.offsetLeft + game.offsetWidth / 2}px`;
    player.style.top = `${game.offsetHeight - game.offsetTop - 2 * player.offsetHeight}px`;
    platforms = createPlatforms(100);
    update();
}

function isPlayerOnPlatform(platform) {
    return player.offsetLeft + player.offsetWidth >= (platform.offsetLeft + 10)
        &&
        player.offsetLeft <= platform.offsetLeft + platform.offsetWidth
        &&
        player.offsetTop + player.offsetHeight >= platform.offsetTop
        &&
        player.offsetTop <= platform.offsetTop + platform.offsetHeight;
}

function detectCollision() {
    let collision = false;

    for (const platform of platforms) {
        if (isPlayerOnPlatform(platform)) {
            collision = true;
            if (!hasPlayerLanded) {
                player.style.top = `${platform.offsetTop - 50}px`;
                isJumping = false;
                velocityY = 0;
                hasPlayerLanded = true;
            }
            break;
        }
    }
    if (!collision) {
        isJumping = true;
        hasPlayerLanded = false;
    }
}

function movePlatforms(x) {
    for (const platform of platforms) {
        platform.style.left = `${platform.offsetLeft + x}px`;
    }
}

function update() {
    detectCollision();
    if (keys.right) {
        velocityX = -5;
    } else if (keys.left) {
        velocityX = 5;
    } else {
        velocityX = 0;
    }
    movePlatforms(velocityX);
    velocityY += gravity;
    if (isJumping && (player.offsetTop + player.offsetHeight + velocityY) < (game.offsetHeight + game.offsetTop)) {
        player.style.top = `${player.offsetTop + velocityY}px`;
    } else isJumping = false;

    requestAnimationFrame(update);
}

init();