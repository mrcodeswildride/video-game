var playingArea = document.getElementById("playingArea");
var ship = document.getElementById("ship");
var cloud = document.getElementById("cloud");
var plane = document.getElementById("plane");
var bolt = document.getElementById("bolt");
var dynamite = document.getElementById("dynamite");
var explosion = document.getElementById("explosion");
var explosionSound = document.getElementById("explosionSound");
var gameOverMessage = document.getElementById("gameOverMessage");
var scoreDisplay = document.getElementById("scoreValue");

var playingAreaWidth = playingArea.clientWidth;
var playingAreaHeight = playingArea.clientHeight;

var shipSpeed = 10;
var shipWidth = ship.clientWidth;
var shipHeight = ship.clientHeight;
var shipX = playingAreaWidth / 2 - shipWidth / 2;
var shipY = playingAreaHeight - shipHeight;

var missileSpeed = 10;
var missileWidth = 16;
var missileHeight = 49;
var missileLaunchDelay = 500;

var cloudSpeed = 10;
var cloudWidth = cloud.clientWidth;
var cloudHeight = cloud.clientHeight;
var cloudX = -cloudWidth;
var cloudY = 0;
var cloudLaunched = false;

var boltSpeed = 10;
var boltWidth = bolt.clientWidth;
var boltHeight = bolt.clientHeight;
var boltX = -boltWidth;
var boltY = 0;
var boltLaunched = false;

var planeSpeed = 10;
var planeWidth = plane.clientWidth;
var planeHeight = plane.clientHeight;
var planeX = playingAreaWidth;
var planeY = cloudHeight;
var planeLaunched = false;

var dynamiteSpeed = 10;
var dynamiteWidth = dynamite.clientWidth;
var dynamiteHeight = dynamite.clientHeight;
var dynamiteX = playingAreaWidth;
var dynamiteY = cloudHeight;
var dynamiteLaunched = false;

var gameLoopInterval = 50;
var gameLaunched = true;
var score = 0;
var missiles = {};
var missileCount = 0;
var lastMissileLaunched = 0;

var gameLoopId = setInterval(gameLoop, gameLoopInterval);

document.addEventListener("keydown", function(event) {
    var missile;
    var missileDiv;

    if (gameLaunched) {
        if (event.keyCode == 37 && shipX > 0) {
            shipX -= shipSpeed;
            ship.style.left = shipX + "px";
        }
        else if (event.keyCode == 39 && shipX < playingAreaWidth - shipWidth) {
            shipX += shipSpeed;
            ship.style.left = shipX + "px";
        }
        else if (event.keyCode == 38 && new Date().getTime() > lastMissileLaunched + missileLaunchDelay) {
            missile = {
                x: shipX + shipWidth / 2 - missileWidth / 2,
                y: shipY - missileHeight
            };

            var missileId = missileCount;
            missiles[missileId] = missile;
            missileCount++;

            missileDiv = document.createElement("div");
            missileDiv.setAttribute("id", missileId);
            missileDiv.classList.add("missile");
            missileDiv.style.left = missile.x + "px";
            missileDiv.style.top = missile.y + "px";
            playingArea.appendChild(missileDiv);

            lastMissileLaunched = new Date().getTime();
        }
    }
    else {
        if (event.keyCode === 13) {
            shipX = playingAreaWidth / 2 - shipWidth / 2;
            ship.style.display = "block";
            ship.style.left = shipX + "px";

            explosion.style.left = -shipWidth + "px";
            explosionSound.pause();
            explosionSound.currentTime = 0;

            gameOverMessage.style.display = "none";

            for (var id in missiles) {
                missile = missiles[id];
                missileDiv = document.getElementById(id);

                delete missiles[id];
                playingArea.removeChild(missileDiv);
            }

            removeCloud();
            removeBolt();
            removePlane();
            removeDynamite();

            gameLaunched = true;
            score = 0;
            scoreDisplay.innerHTML = score;
            missileCount = 0;
            lastMissileLaunched = 0;
            gameLoopId = setInterval(gameLoop, gameLoopInterval);
        }
    }
});

function gameLoop() {
    handleMissles();
    handleCloud();
    handleBolt();
    handlePlane();
    handleDynamite();
    checkCollisions();
}

function handleMissles() {
    for (var id in missiles) {
        var missile = missiles[id];
        var missileDiv = document.getElementById(id);

        missile.y -= missileSpeed;

        if (missile.y < -missileHeight) {
            delete missiles[id];
            playingArea.removeChild(missileDiv);
        }
        else {
            missileDiv.style.top = missile.y + "px";
        }
    }
}

function handleCloud() {
    if (cloudLaunched) {
        cloudX += cloudSpeed;
        cloud.style.left = cloudX + "px";

        if (cloudX > playingAreaWidth) {
            cloudLaunched = false;
        }
        else if (!boltLaunched && rollDie(20) == 1) {
            boltX = cloudX + cloudWidth / 2 - boltWidth / 2;
            boltY = cloudY + cloudHeight;
            bolt.style.left = boltX + "px";
            bolt.style.top = boltY + "px";
            boltLaunched = true;
        }
    }
    else if (rollDie(20) == 1) {
        cloudX = -cloudWidth;
        cloudLaunched = true;
    }
}

function handleBolt() {
    if (boltLaunched) {
        boltX += boltSpeed;
        boltY += boltSpeed;
        bolt.style.left = boltX + "px";
        bolt.style.top = boltY + "px";

        if (boltX > playingAreaWidth || boltY > playingAreaHeight) {
            boltLaunched = false;
        }
    }
}

function handlePlane() {
    if (planeLaunched) {
        planeX -= planeSpeed;
        plane.style.left = planeX + "px";

        if (planeX < -planeWidth) {
            planeLaunched = false;
        }
        else if (!dynamiteLaunched && rollDie(20) == 1) {
            dynamiteX = planeX + planeWidth / 2 - dynamiteWidth / 2;
            dynamiteY = planeY + planeHeight;
            dynamite.style.left = dynamiteX + "px";
            dynamite.style.top = dynamiteY + "px";
            dynamiteLaunched = true;
        }
    }
    else if (rollDie(20) == 1) {
        planeX = playingAreaWidth;
        planeLaunched = true;
    }
}

function handleDynamite() {
    if (dynamiteLaunched) {
        dynamiteX -= dynamiteSpeed;
        dynamiteY += dynamiteSpeed;
        dynamite.style.left = dynamiteX + "px";
        dynamite.style.top = dynamiteY + "px";

        if (dynamiteX < -dynamiteWidth || dynamiteY > playingAreaHeight) {
            dynamiteLaunched = false;
        }
    }
}

function checkCollisions() {
    for (var id in missiles) {
        var missile = missiles[id];
        var missileTouchingCloud = cloudLaunched && touching(missile.x, missile.y, missileWidth, missileHeight, cloudX, cloudY, cloudWidth, cloudHeight);
        var missileTouchingBolt = boltLaunched && touching(missile.x, missile.y, missileWidth, missileHeight, boltX, boltY, boltWidth, boltHeight);
        var missileTouchingPlane = planeLaunched && touching(missile.x, missile.y, missileWidth, missileHeight, planeX, planeY, planeWidth, planeHeight);
        var missileTouchingDynamite = dynamiteLaunched && touching(missile.x, missile.y, missileWidth, missileHeight, dynamiteX, dynamiteY, dynamiteWidth, dynamiteHeight);

        if (missileTouchingCloud) {
            removeMissile(id);
            removeCloud();
            score++;
            scoreDisplay.innerHTML = score;
        }

        if (missileTouchingBolt) {
            removeMissile(id);
            removeBolt();
            score++;
            scoreDisplay.innerHTML = score;
        }

        if (missileTouchingPlane) {
            removeMissile(id);
            removePlane();
            score++;
            scoreDisplay.innerHTML = score;
        }

        if (missileTouchingDynamite) {
            removeMissile(id);
            removeDynamite();
            score++;
            scoreDisplay.innerHTML = score;
        }
    }

    var boltTouchingShip = boltLaunched && touching(boltX, boltY, boltWidth, boltHeight, shipX, shipY, shipWidth, shipHeight);
    var dynamiteTouchingShip = dynamiteLaunched && touching(dynamiteX, dynamiteY, dynamiteWidth, dynamiteHeight, shipX, shipY, shipWidth, shipHeight);

    if (boltTouchingShip) {
        removeBolt();
        gameOver();
    }

    if (dynamiteTouchingShip) {
        removeDynamite();
        gameOver();
    }
}

function removeMissile(id) {
    var missileDiv = document.getElementById(id);
    delete missiles[id];
    playingArea.removeChild(missileDiv);
}

function removeCloud() {
    cloudX = -cloudWidth;
    cloud.style.left = cloudX + "px";
    cloudLaunched = false;
}

function removeBolt() {
    boltX = -boltWidth;
    boltY = 0;
    bolt.style.left = boltX + "px";
    bolt.style.top = boltY + "px";
    boltLaunched = false;
}

function removePlane() {
    planeX = playingAreaWidth;
    plane.style.left = planeX + "px";
    planeLaunched = false;
}

function removeDynamite() {
    dynamiteX = playingAreaWidth;
    dynamiteY = cloudHeight;
    dynamite.style.left = dynamiteX + "px";
    dynamite.style.top = dynamiteY + "px";
    dynamiteLaunched = false;
}

function gameOver() {
    ship.style.display = "none";

    explosion.style.left = shipX + "px";
    explosionSound.play();

    gameOverMessage.style.display = "block";

    gameLaunched = false;
    clearInterval(gameLoopId);
}

function touching(x1, y1, width1, height1, x2, y2, width2, height2) {
    return x1 + width1 >= x2 && x1 <= x2 + width2 && y1 + height1 >= y2 && y1 <= y2 + height2;
}

function rollDie(numSides) {
    return Math.floor(Math.random() * numSides) + 1;
}
