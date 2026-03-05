const bgm = document.getElementById('bgm');
const playButton = document.getElementById('play-button');
const landing = document.getElementById('landing');
const points = document.getElementById('points');
const livesDisplay = document.getElementById('lives-display');
const gameContainer = document.getElementById('game-container');
const game = document.getElementById('game');
const player = document.getElementById('player');
const gameOverScreen = document.getElementById('game-over');
const finalScore = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

let platforms = [], coins = [];
let isJumping = false;
let hasPlayerLanded = false;
let gravity = 1;
let velocityY = 0;
let velocityX = 0;
let coinsConsumed = 0;
let lives = 3;
let isInvincible = false;
let gameRunning = false;

// Patrol enemy state
let patrolEnemy = null;
let patrolDirection = { x: 0, y: 0 };
let patrolBounces = 0;
let patrolSpawnTimeout = null;

const keys = { right: false, left: false };

bgm.addEventListener('canplaythrough', () => { bgm.play(); });

document.addEventListener('DOMContentLoaded', () => {
    playButton.addEventListener('click', () => {
        gameContainer.style.display = 'block';
        landing.style.display = 'none';
        init();
    });

    restartButton.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        init();
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') keys.right = true;
    if (event.key === 'ArrowLeft') keys.left = true;
    if (event.key === ' ' && !isJumping) {
        isJumping = true;
        velocityY = -25;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowRight') keys.right = false;
    if (event.key === 'ArrowLeft') keys.left = false;
});

function generatePlatformHeight() {
    return parseInt(Math.random() * 100);
}

function createPlatforms(number) {
    let x = 100, y = 200;
    const result = [];
    for (let i = 0; i < number; i++) {
        const el = document.createElement('div');
        el.classList.add('platform');
        el.style.left = `${x}px`;
        el.style.top = `${y + generatePlatformHeight() * 5}px`;
        game.appendChild(el);
        result.push(el);
        x += 250;
    }
    return result;
}

function createCoins(number) {
    let x = 100, y = 100;
    const result = [];
    for (let i = 0; i < number; i++) {
        const el = document.createElement('div');
        el.classList.add('coin');
        el.style.left = `${x}px`;
        el.style.top = `${y + generatePlatformHeight() * 5}px`;
        game.appendChild(el);
        result.push(el);
        x += 250;
    }
    return result;
}

function clearGameElements() {
    game.querySelectorAll('.platform, .coin').forEach(el => el.remove());
    platforms = [];
    coins = [];
}

function updateLivesDisplay() {
    livesDisplay.innerText = '♥'.repeat(lives) + '♡'.repeat(3 - lives);
}

function loseLife() {
    lives--;
    updateLivesDisplay();
    if (lives <= 0) {
        gameOver();
        return;
    }
    isInvincible = true;
    player.classList.add('invincible');
    setTimeout(() => {
        isInvincible = false;
        player.classList.remove('invincible');
    }, 2000);
}

function gameOver() {
    gameRunning = false;
    if (patrolEnemy) { patrolEnemy.remove(); patrolEnemy = null; }
    clearTimeout(patrolSpawnTimeout);
    patrolSpawnTimeout = null;
    finalScore.innerText = `Score: ${coinsConsumed} coin${coinsConsumed !== 1 ? 's' : ''}`;
    gameOverScreen.style.display = 'flex';
}

function init() {
    gameRunning = true;
    coinsConsumed = 0;
    lives = 3;
    isInvincible = false;
    isJumping = false;
    hasPlayerLanded = false;
    velocityY = 0;
    velocityX = 0;
    points.innerText = coinsConsumed;
    updateLivesDisplay();
    player.classList.remove('invincible');

    clearGameElements();

    if (patrolEnemy) { patrolEnemy.remove(); patrolEnemy = null; }
    clearTimeout(patrolSpawnTimeout);

    player.style.left = `${game.offsetLeft + game.offsetWidth / 2}px`;
    player.style.top = `${game.offsetHeight + game.offsetTop - 2 * player.offsetHeight}px`;

    platforms = createPlatforms(100);
    coins = createCoins(100);

    // First patrol enemy arrives 5–8 seconds in
    patrolSpawnTimeout = setTimeout(spawnPatrolEnemy, 5000 + Math.random() * 3000);
    update();
}

// ===== PATROL ENEMY =====

function spawnPatrolEnemy() {
    if (!gameRunning || patrolEnemy) return;

    patrolEnemy = document.createElement('div');
    patrolEnemy.id = 'patrol-enemy';
    patrolEnemy.innerHTML = '<div class="patrol-eye"></div><div class="patrol-eye"></div>';
    game.appendChild(patrolEnemy);

    const gw = game.offsetWidth;
    const gh = game.offsetHeight;
    const size = 50;
    const speed = 2.5;
    const side = Math.floor(Math.random() * 4); // 0=left 1=right 2=top 3=bottom

    let startX, startY, dx, dy;
    if (side === 0) {
        startX = -size; startY = 60 + Math.random() * (gh - size - 100);
        dx = speed; dy = 0;
    } else if (side === 1) {
        startX = gw; startY = 60 + Math.random() * (gh - size - 100);
        dx = -speed; dy = 0;
    } else if (side === 2) {
        startX = Math.random() * (gw - size); startY = -size;
        dx = 0; dy = speed;
    } else {
        startX = Math.random() * (gw - size); startY = gh;
        dx = 0; dy = -speed;
    }

    patrolEnemy.style.left = `${startX}px`;
    patrolEnemy.style.top = `${startY}px`;
    patrolDirection = { x: dx, y: dy };
    patrolBounces = 0;
}

function movePatrolEnemy() {
    if (!patrolEnemy) return;

    const x = patrolEnemy.offsetLeft + patrolDirection.x;
    const y = patrolEnemy.offsetTop + patrolDirection.y;
    const gw = game.offsetWidth;
    const gh = game.offsetHeight;
    const size = 50;

    patrolEnemy.style.left = `${x}px`;
    patrolEnemy.style.top = `${y}px`;

    const isHorizontal = patrolDirection.x !== 0;
    if (isHorizontal) {
        if ((patrolDirection.x > 0 && x > gw) || (patrolDirection.x < 0 && x < -size)) {
            patrolBounces++;
            if (patrolBounces >= 2) { despawnPatrolEnemy(); return; }
            patrolDirection.x *= -1;
        }
    } else {
        if ((patrolDirection.y > 0 && y > gh) || (patrolDirection.y < 0 && y < -size)) {
            patrolBounces++;
            if (patrolBounces >= 2) { despawnPatrolEnemy(); return; }
            patrolDirection.y *= -1;
        }
    }
}

function despawnPatrolEnemy() {
    if (patrolEnemy) { patrolEnemy.remove(); patrolEnemy = null; }
    if (gameRunning) {
        const delay = 10000 + Math.random() * 10000; // 10–20 seconds
        patrolSpawnTimeout = setTimeout(spawnPatrolEnemy, delay);
    }
}

function detectPatrolEnemyCollision() {
    if (!patrolEnemy || isInvincible) return;
    const ex = patrolEnemy.offsetLeft, ey = patrolEnemy.offsetTop;
    const ew = patrolEnemy.offsetWidth, eh = patrolEnemy.offsetHeight;
    const px = player.offsetLeft, py = player.offsetTop;
    const pw = player.offsetWidth, ph = player.offsetHeight;
    if (px + pw >= ex && px <= ex + ew && py + ph >= ey && py <= ey + eh) {
        loseLife();
    }
}

// ===== GAME MECHANICS =====

function hasPlayerCollidedWithCoin(coin) {
    return player.offsetLeft + player.offsetWidth >= coin.offsetLeft
        && player.offsetLeft <= coin.offsetLeft + coin.offsetWidth
        && player.offsetTop + player.offsetHeight >= coin.offsetTop
        && player.offsetTop <= coin.offsetTop + coin.offsetHeight;
}

function isPlayerOnPlatform(platform) {
    return player.offsetLeft + player.offsetWidth >= (platform.offsetLeft + 10)
        && player.offsetLeft <= platform.offsetLeft + platform.offsetWidth
        && player.offsetTop + player.offsetHeight >= platform.offsetTop
        && player.offsetTop <= platform.offsetTop + platform.offsetHeight;
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
    if (!gameRunning) return;

    consumeCoin();
    detectCollision();
    detectPatrolEnemyCollision();
    movePatrolEnemy();

    if (keys.right) {
        velocityX = -5;
    } else if (keys.left) {
        velocityX = 5;
    } else {
        velocityX = 0;
    }

    moveCoins(velocityX);
    movePlatforms(velocityX);

    velocityY += gravity;
    if (isJumping && (player.offsetTop + player.offsetHeight + velocityY) < (game.offsetHeight + game.offsetTop)) {
        player.style.top = `${player.offsetTop + velocityY}px`;
    } else isJumping = false;

    requestAnimationFrame(update);
}
