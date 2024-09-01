const game = document.getElementById('game');
const player = document.getElementById('player');
const gameBoundary = game.getBoundingClientRect();
let isJumping = false;
let hasPlayerLanded = false;
let gravity = 0.9;
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
    let startingHorizontalPositionForPlatforms = 400;
    let platforms = [];
    for (let index = 0; index < number; index++) {
        const platform = document.createElement('div');
        platform.style.position = 'absolute';
        platform.style.left = `${startingHorizontalPositionForPlatforms}px`;
        platform.style.top = `${200 + generatePlatformHeight() * 5}px`;
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
    player.style.left = `${gameBoundary.left}px`;
    player.style.top = `${gameBoundary.bottom - player.offsetHeight}px`;
    const platforms = createPlatforms(4);
    update(getRectInfoOfAllPlatforms(platforms));
}

function getRectInfoOfAllPlatforms(platforms) {
    return platforms.map((platform) => (platform.getBoundingClientRect()));
}

function isPlayerOnPlatform(playerBoundary, platformArea) {
    return playerBoundary.right >= (platformArea.left + 10)
        &&
        playerBoundary.left <= platformArea.right
        &&
        playerBoundary.bottom >= platformArea.top
        &&
        playerBoundary.top <= platformArea.bottom;
}

function detectCollision(platformAreas) {
    let playerBoundary = player.getBoundingClientRect();
    let collision = false;

    for (let index = 0; index < platformAreas.length; index++) {
        const platformArea = platformAreas[index];
        if (isPlayerOnPlatform(playerBoundary, platformArea)) {
            collision = true;
            if (!hasPlayerLanded) {
                player.style.top = `${platformArea.top - 50}px`;
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

function update(platformAreas) {
    detectCollision(platformAreas);
    if (keys.right && (player.offsetLeft + 50) < gameBoundary.right) {
        velocityX = 5;
    } else if (keys.left && player.offsetLeft > gameBoundary.left) {
        velocityX = -5;
    } else {
        velocityX = 0;
    }

    player.style.left = `${player.offsetLeft + velocityX}px`;

    velocityY += gravity;
    if (isJumping && (player.offsetTop + 50 + velocityY) < gameBoundary.bottom) {
        player.style.top = `${player.offsetTop + velocityY}px`;
    } else isJumping = false;

    requestAnimationFrame(() => update(platformAreas));
}

init();