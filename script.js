const bgm = document.getElementById('bgm');
const playButton = document.getElementById('play-button');
const points = document.getElementById('points');
const gameContainer = document.getElementById('game-container');
const game = document.getElementById('game');
const player = document.getElementById('player');
let platforms = [], coins = [], enemies = [];
let isJumping = false;
let hasPlayerLanded = false;
let gravity = 1;
let velocityY = 0;
let velocityX = 0;
let coinsConsumed = 0;
points.innerText = coinsConsumed;

const keys = {
    right: false,
    left: false
};

bgm.addEventListener('canplaythrough', () => {
    bgm.play();
});

document.addEventListener('DOMContentLoaded', () => {

    playButton.addEventListener('click', () => {
        gameContainer.style.display = 'block';
        playButton.style.display = 'none';
        init();
    });
});

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
        platform.classList.add('platform');
        platform.style.left = `${startingHorizontalPositionForPlatforms}px`;
        platform.style.top = `${startingVerticalPositionForPlatforms + generatePlatformHeight() * 5}px`;
        game.appendChild(platform);
        platforms.push(platform);
        startingHorizontalPositionForPlatforms += 250;
    }
    return platforms;
}

function createCoins(number) {
    let startingHorizontalPositionForCoins = 100, startingVerticalPositionForCoins = 100;
    let coins = [];
    for (let index = 0; index < number; index++) {
        const coin = document.createElement('div');
        coin.classList.add('coin');
        coin.style.left = `${startingHorizontalPositionForCoins}px`;
        coin.style.top = `${startingVerticalPositionForCoins + generatePlatformHeight() * 5}px`;
        game.appendChild(coin);
        coins.push(coin);
        startingHorizontalPositionForCoins += 250;
    }
    return coins;
}

function createEnemies(number) {
    let startingHorizontalPositionForEnemies = 150, startingVerticalPositionForEnemies = 100;
    let enemies = [];
    for (let index = 0; index < number; index++) {
        const enemy = document.createElement('img');
        enemy.src = './assets/enemy.png';
        enemy.classList.add('enemy');
        enemy.style.left = `${startingHorizontalPositionForEnemies}px`;
        enemy.style.top = `${startingVerticalPositionForEnemies + generatePlatformHeight() * 5}px`;
        game.appendChild(enemy);
        enemies.push(enemy);
        startingHorizontalPositionForEnemies += 300;
    }
    return enemies;
}

function hasPlayerCollidedWithEnemy(enemy) {
    return player.offsetLeft + player.offsetWidth >= enemy.offsetLeft
        &&
        player.offsetLeft <= enemy.offsetLeft + enemy.offsetWidth
        &&
        player.offsetTop + player.offsetHeight >= enemy.offsetTop
        &&
        player.offsetTop <= enemy.offsetTop + enemy.offsetHeight;
}

function detectEnemyCollision() {
    for (const enemy of enemies) {
        if (hasPlayerCollidedWithEnemy(enemy)) {
            resetGame();
            return;
        }
    }
}

function calculateEnemyMovement() {
    const positiveXDirection = parseInt(Math.random() * 100) > 50;
    const positiveYDirection = parseInt(Math.random() * 100) > 50;
    let x = 0, y = 0;

    if (positiveXDirection) x = parseInt(Math.random() * 5);
    else x = -parseInt(Math.random() * 5);

    if (positiveYDirection) y = parseInt(Math.random() * 5);
    else y = -parseInt(Math.random() * 5);

    return { x, y };
};

function moveEnemies() {
    for (const enemy of enemies) {
        const movement = calculateEnemyMovement();
        enemy.style.left = `${enemy.offsetLeft - 3}px`;
        enemy.style.top = `${enemy.offsetTop + movement.y}px`;
    }
}

function resetGame() {
    player.style.left = `${game.offsetLeft + game.offsetWidth / 2}px`;
    player.style.top = `${game.offsetHeight - game.offsetTop - 2 * player.offsetHeight}px`;
    coinsConsumed = 0;
    points.innerText = coinsConsumed;
}

function init() {
    player.style.left = `${game.offsetLeft + game.offsetWidth / 2}px`;
    player.style.top = `${game.offsetHeight + game.offsetTop - 2 * player.offsetHeight}px`;
    platforms = createPlatforms(100);
    coins = createCoins(100);
    enemies = createEnemies(100);
    update();
}

function hasPlayerCollidedWithCoin(coin) {
    return player.offsetLeft + player.offsetWidth >= coin.offsetLeft
        &&
        player.offsetLeft <= coin.offsetLeft + coin.offsetWidth
        &&
        player.offsetTop + player.offsetHeight >= coin.offsetTop
        &&
        player.offsetTop <= coin.offsetTop + coin.offsetHeight;
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

function consumeCoin() {
    for (const coin of coins) {
        if (hasPlayerCollidedWithCoin(coin)) {
            game.removeChild(coin);
            coinsConsumed++;
            points.innerText = coinsConsumed;
            return;
        }
    }
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

function moveCoins(x) {
    for (const coin of coins) {
        coin.style.left = `${coin.offsetLeft + x}px`;
    }
}

function movePlatforms(x) {
    for (const platform of platforms) {
        platform.style.left = `${platform.offsetLeft + x}px`;
    }
}

function update() {
    consumeCoin();
    detectCollision();
    detectEnemyCollision();

    if (keys.right) {
        velocityX = -5;
    } else if (keys.left) {
        velocityX = 5;
    } else {
        velocityX = 0;
    }

    moveCoins(velocityX);
    movePlatforms(velocityX);
    moveEnemies();

    velocityY += gravity;
    if (isJumping && (player.offsetTop + player.offsetHeight + velocityY) < (game.offsetHeight + game.offsetTop)) {
        player.style.top = `${player.offsetTop + velocityY}px`;
    } else isJumping = false;

    requestAnimationFrame(update);
}
