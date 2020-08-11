let playingArea = document.getElementById(`playingArea`)
let ship = document.getElementById(`ship`)
let cloud = document.getElementById(`cloud`)
let plane = document.getElementById(`plane`)
let bolt = document.getElementById(`bolt`)
let dynamite = document.getElementById(`dynamite`)
let explosion = document.getElementById(`explosion`)
let playMessage = document.getElementById(`playMessage`)
let scoreValue = document.getElementById(`scoreValue`)

let gameStarted = false
let score = 0
let lastMissileLaunched
let intervalId

document.addEventListener(`keydown`, keyPressed)

function keyPressed(event) {
  event.preventDefault()

  if (!gameStarted) {
    if (event.keyCode == 13) {
      startGame()
    }
  }
  else {
    if (event.keyCode == 37 && ship.offsetLeft > 0) {
      moveLeft()
    }
    else if (event.keyCode == 39 && ship.offsetLeft < playingArea.offsetWidth - ship.offsetWidth) {
      moveRight()
    }
    else if (event.keyCode == 38 && Date.now() > lastMissileLaunched + 500) {
      launchMissile()
    }
  }
}

function startGame() {
  ship.style.display = `block`
  ship.style.left = `${playingArea.offsetWidth / 2 - ship.offsetWidth / 2}px`

  cloud.style.display = `none`
  plane.style.display = `none`
  bolt.style.display = `none`
  dynamite.style.display = `none`

  let missiles = playingArea.querySelectorAll(`.missile`)

  for (let missile of missiles) {
    missile.remove()
  }

  explosion.style.display = `none`
  playMessage.style.display = `none`

  gameStarted = true

  score = 0
  scoreValue.innerHTML = score

  lastMissileLaunched = 0

  intervalId = setInterval(gameLoop, 50)
}

function gameLoop() {
  moveCloud()
  movePlane()
  moveBolt()
  moveDynamite()
  moveMissiles()
}

function moveCloud() {
  if (cloud.style.display == `none`) {
    if (Math.floor(Math.random() * 20) == 0) {
      cloud.style.display = `block`
      cloud.style.left = `${-cloud.offsetWidth}px`
    }
  }
  else {
    cloud.style.left = `${cloud.offsetLeft + 10}px`

    if (cloud.offsetLeft >= playingArea.offsetWidth) {
      cloud.style.display = `none`
    }
    else if (bolt.style.display == `none` && Math.floor(Math.random() * 20) == 0) {
      bolt.style.display = `block`
      bolt.style.left = `${cloud.offsetLeft + cloud.offsetWidth / 2 - bolt.offsetWidth / 2}px`
      bolt.style.top = `${cloud.offsetTop + cloud.offsetHeight}px`
    }
  }
}

function movePlane() {
  if (plane.style.display == `none`) {
    if (Math.floor(Math.random() * 20) == 0) {
      plane.style.display = `block`
      plane.style.left = `${playingArea.offsetWidth}px`
    }
  }
  else {
    plane.style.left = `${plane.offsetLeft - 10}px`

    if (plane.offsetLeft <= -plane.offsetWidth) {
      plane.style.display = `none`
    }
    else if (dynamite.style.display == `none` && Math.floor(Math.random() * 20) == 0) {
      dynamite.style.display = `block`
      dynamite.style.left = `${plane.offsetLeft + plane.offsetWidth / 2 - dynamite.offsetWidth / 2}px`
      dynamite.style.top = `${plane.offsetTop + plane.offsetHeight}px`
    }
  }
}

function moveBolt() {
  if (bolt.style.display == `block`) {
    bolt.style.left = `${bolt.offsetLeft + 10}px`
    bolt.style.top = `${bolt.offsetTop + 10}px`

    if (bolt.offsetLeft >= playingArea.offsetWidth || bolt.offsetTop >= playingArea.offsetHeight) {
      bolt.style.display = `none`
    }
    else if (touching(ship, bolt)) {
      shipHit(bolt)
    }
  }
}

function moveDynamite() {
  if (dynamite.style.display == `block`) {
    dynamite.style.left = `${dynamite.offsetLeft - 10}px`
    dynamite.style.top = `${dynamite.offsetTop + 10}px`

    if (dynamite.offsetLeft <= -dynamite.offsetWidth || dynamite.offsetTop >= playingArea.offsetHeight) {
      dynamite.style.display = `none`
    }
    else if (touching(ship, dynamite)) {
      shipHit(dynamite)
    }
  }
}

function moveMissiles() {
  let missiles = playingArea.querySelectorAll(`.missile`)

  for (let missile of missiles) {
    missile.style.top = `${missile.offsetTop - 10}px`

    if (missile.offsetTop <= -missile.offsetHeight) {
      missile.remove()
    }
    else if (touching(missile, cloud)) {
      missileHit(missile, cloud)
    }
    else if (touching(missile, plane)) {
      missileHit(missile, plane)
    }
    else if (touching(missile, bolt)) {
      missileHit(missile, bolt)
    }
    else if (touching(missile, dynamite)) {
      missileHit(missile, dynamite)
    }
  }
}

function moveLeft() {
  ship.style.left = `${ship.offsetLeft - 10}px`

  if (touching(ship, bolt)) {
    shipHit(bolt)
  }
  else if (touching(ship, dynamite)) {
    shipHit(dynamite)
  }
}

function moveRight() {
  ship.style.left = `${ship.offsetLeft + 10}px`

  if (touching(ship, bolt)) {
    shipHit(bolt)
  }
  else if (touching(ship, dynamite)) {
    shipHit(dynamite)
  }
}

function launchMissile() {
  missile = document.createElement(`img`)
  missile.src = `missile.png`
  missile.classList.add(`missile`)
  missile.style.left = `${ship.offsetLeft + ship.offsetWidth / 2 - 8}px`
  missile.style.top = `${ship.offsetTop - 49}px`
  playingArea.appendChild(missile)

  lastMissileLaunched = Date.now()
}

function missileHit(missile, object) {
  missile.remove()
  object.style.display = `none`

  score++
  scoreValue.innerHTML = score
}

function shipHit(object) {
  object.style.display = `none`

  explosion.style.display = `block`
  explosion.style.left = `${ship.offsetLeft}px`

  ship.style.display = `none`

  playMessage.style.display = `block`
  playMessage.innerHTML = `Press enter to play again`

  gameStarted = false

  clearInterval(intervalId)
}

function touching(object1, object2) {
  let object1Left = object1.offsetLeft
  let object1Right = object1.offsetLeft + object1.offsetWidth
  let object1Top = object1.offsetTop
  let object1Bottom = object1.offsetTop + object1.offsetHeight

  let object2Left = object2.offsetLeft
  let object2Right = object2.offsetLeft + object2.offsetWidth
  let object2Top = object2.offsetTop
  let object2Bottom = object2.offsetTop + object2.offsetHeight

  let touchingHorizontally = object1Left <= object2Right && object1Right >= object2Left
  let touchingVertically = object1Top <= object2Bottom && object1Bottom >= object2Top

  return touchingHorizontally && touchingVertically
}