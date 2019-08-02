var playArea
var ctx
var obstacle = new Image()
obstacle.src = 'images/obstacle.png'
var livesLeft = 3
var score = 0
var hiScore = 0
var enemyStartX = 30
var enemyStartY = 120

var updateID
var enemyMoveID
var enemyFireID
var init = function () {
  playArea = document.getElementById('playArea')
  ctx = playArea.getContext('2d')
  updateID = setInterval(update, 1000 / 30)
  enemyLoc(enemyStartX, enemyStartY)
  enemyMoveID = setInterval(enemyMovement, 1000)
  enemyFireID = setInterval(enemyFire, Math.random() * 5000)
}
window.onload = init
window.addEventListener('keydown', action, false)
window.addEventListener('keyup', action, false)

var player = new Image()
player.src = 'images/player.png'
var playerX = 250
var playerY = 500
function update () {
  ctx.clearRect(0, 0, playArea.width, playArea.height)
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, playArea.width, playArea.height)
  ctx.drawImage(player, playerX, playerY)
  displayScoreAndLives()
  displayObstacles()
  displayEnemies()
  endConditions()
};

var fireX
var fireY
function obstacleCollision (fireX, fireY) {
  obstacleData = ctx.getImageData(0, playArea.height - 170,
    playArea.width, obstacle.height)
  // Converting fire coordinates to pixel location within obstacleData
  const firePix = ((fireY - (playArea.height - 170)) * playArea.width) + fireX

  // Checking if there is green pixel (i.e. obstacle) right above or below
  const pixelAbove = firePix - playArea.width * 4
  const pixelBelow = firePix + playArea.width * 4 * 5
  // if the green color value above any laser pixel is >250
  for (var laserPix = 1; laserPix < 6; laserPix++) {
    if (obstacleData.data[(pixelAbove + laserPix) * 4 + 1] > 250) {
      return [fireX, fireY]
      // Or below
    } else if (obstacleData.data[(pixelBelow + laserPix) * 4 + 1] > 250) {
      return [fireX, fireY + 10]
    }
  }
  return false
}

var obstacleData
var collisionCoord = []
function displayObstacles () {
  const obstacles = new Image()
  // Create new canvas for dynamic obstacle images
  var obstacleCanvas = document.createElement('canvas')
  obstacleCanvas.width = playArea.width
  obstacleCanvas.height = obstacle.height
  const obstacleCtx = obstacleCanvas.getContext('2d')
  ctx.drawImage(obstacle, 70, playArea.height - 170)
  ctx.drawImage(obstacle, 195, playArea.height - 170)
  ctx.drawImage(obstacle, 320, playArea.height - 170)
  ctx.drawImage(obstacle, 445, playArea.height - 170)
  ctx.fillStyle = '#000000'
  // Wherever a collision has been recorded, add black circle
  for (var arr = 0; arr < collisionCoord.length; arr++) {
    ctx.beginPath()
    ctx.arc(collisionCoord[arr][0], collisionCoord[arr][1],
      15, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }
  obstacleData = ctx.getImageData(0, playArea.height - 170,
    playArea.width, obstacle.height)
  if (obstacleCollision(enemyFireX, enemyFireY) ||
        obstacleCollision(fireX, fireY)) {
    if (obstacleCollision(enemyFireX, enemyFireY)) {
      collisionCoord.push(obstacleCollision(enemyFireX, enemyFireY))
      clearInterval(enemyFireFramesID)
      enemyFiring = false
    } else {
      collisionCoord.push(obstacleCollision(fireX, fireY))
      clearInterval(fireFrames)
      firing = false
    }
  }
  obstacleCtx.putImageData(obstacleData, 0, 0)
  const obstacleSource = obstacleCanvas.toDataURL()
  obstacles.src = obstacleSource
  ctx.drawImage(obstacles, 0, playArea.height - 170, playArea.width,
    obstacle.height)
}

function displayScoreAndLives () {
  ctx.font = '30px Space-Invaders'
  ctx.fillStyle = 'white'
  ctx.fillText(livesLeft, 10, playArea.height - 10)
  ctx.font = '25px Space-Invaders'
  ctx.fillText('CREDIT   INF', playArea.width - 200,
    playArea.height - 10)
  ctx.fillText('SCORE <1>', 10, 30)
  ctx.fillText('HI-SCORE', playArea.width / 2.6, 30)
  ctx.fillText('SCORE <2>', playArea.width - 155, 30)
  ctx.fillText(score, 60, 70)
  ctx.fillText(hiScore, playArea.width / 2.1, 70)
  let iconX = 45
  for (var i = 0; i < livesLeft - 1; i++) {
    ctx.drawImage(player, iconX, playArea.height - 43)
    iconX += 60
  }
}

var enemyRows = 5
var enemyColumns = 10
var enemyCoord = []
var nextEnemyX
var nextEnemyY
function enemyLoc (enemyX, enemyY) {
  for (var y = 1; y <= enemyRows; y++) {
    // If this is the first row then start at enemyY position
    if (y === 1) {
      nextEnemyY = enemyY
    } else {
      // Else go to next row
      nextEnemyY += enemy1A.height + 10
    }
    for (var x = 1; x <= enemyColumns; x++) {
      // If this is the first column of enemies, start at enemyX
      if (x === 1) {
        nextEnemyX = enemyX
      } else {
        // Else go to next column
        nextEnemyX += enemy1A.width + 5
      }
      enemyCoord.push([nextEnemyX, nextEnemyY,
        nextEnemyX + enemy1A.width,
        nextEnemyY + enemy1A.height])
    }
    // Reset nextEnemyX before moving to next row
    nextEnemyX = enemyX
  }
};

var rightDirection = true
var downDirection = false
var aMode = true
function enemyMovement () {
  // Grabbing X coordinates of where outtermost enemies are
  var mostLeftX = enemyCoord[0][0]
  var mostRightX = enemyCoord[enemyCoord.length - 1][0]
  for (var enemy = 0; enemy < enemyCoord.length; enemy++) {
    if (enemyCoord[enemy][0] < mostLeftX) {
      mostLeftX = enemyCoord[enemy][0]
    };
    if (enemyCoord[enemy][0] > mostRightX) {
      mostRightX = enemyCoord[enemy][0]
    };
  }
  // If enemies have reached bottom of canvas
  if (enemyCoord[enemyCoord.length - 1][1] + enemy1A.height > playArea.height) {
    return
  }
  // If there is enough room for the enemies to move to the right
  if (mostRightX + enemy1A.width < playArea.width - enemy1A.width &&
        rightDirection) {
    for (var arr = 0; arr < enemyCoord.length; arr++) {
      enemyCoord[arr][0] = enemyCoord[arr][0] + enemy1A.width
      enemyCoord[arr][2] = enemyCoord[arr][2] + enemy1A.width
    };
    // Else if direction is towards left and there is enough room
  } else if (!rightDirection && mostLeftX - enemy1A.width > 0) {
    // If there is room in the left direction, execute below
    if (mostLeftX > enemy1A.width) {
      for (arr = 0; arr < enemyCoord.length; arr++) {
        enemyCoord[arr][0] = enemyCoord[arr][0] - enemy1A.width
        enemyCoord[arr][2] = enemyCoord[arr][2] - enemy1A.width
      }
    }
    // If direction is towards right and there is no room
    // or if direction is towards left and there is no room
    // default to going down
  } else {
    downDirection = true
  }
  if (downDirection) {
    // If there is room to the right, go right
    if (mostRightX + enemy1A.width < playArea.width - enemy1A.width) {
      rightDirection = true
    } else {
      // Else go left
      rightDirection = false
    }
    for (arr = 0; arr < enemyCoord.length; arr++) {
      // Go down
      enemyCoord[arr][1] = enemyCoord[arr][1] + enemy1A.height
      enemyCoord[arr][3] = enemyCoord[arr][3] + enemy1A.height
    }
    // Only go down once
    downDirection = false
  }
  if (aMode) {
    aMode = false
  } else {
    aMode = true
  }
}
var enemy1A = new Image()
enemy1A.src = 'images/enemy1A.png'
var enemy1B = new Image()
enemy1B.src = 'images/enemy1B.png'

var enemy2A = new Image()
enemy2A.src = 'images/enemy2A.png'
var enemy2B = new Image()
enemy2B.src = 'images/enemy2B.png'

var enemy3A = new Image()
enemy3A.src = 'images/enemy3A.png'
var enemy3B = new Image()
enemy3B.src = 'images/enemy3B.png'

function displayEnemies () {
  for (var arr = 0; arr < enemyCoord.length; arr++) {
    if (scoreSystem[arr] === 30) {
      ctx.drawImage((aMode) ? enemy1A : enemy1B, enemyCoord[arr][0],
        enemyCoord[arr][1])
    } else if (scoreSystem[arr] === 20) {
      ctx.drawImage((aMode) ? enemy2A : enemy2B, enemyCoord[arr][0],
        enemyCoord[arr][1])
    } else if (scoreSystem[arr] === 10) {
      ctx.drawImage((aMode) ? enemy3A : enemy3B, enemyCoord[arr][0],
        enemyCoord[arr][1])
    };
  };
}

var scoreSystem = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
  20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
  10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
  10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
function collision (fireX, fireY) {
  for (var arr = 0; arr < enemyCoord.length; arr++) {
    const enemy = enemyCoord[arr]
    const enemyX = enemy[0]
    const enemyY = enemy[1]
    const enemyXMax = enemy[2]
    const enemyYMax = enemy[3]
    if (enemyX <= fireX + laserWidth && fireX <= enemyXMax &&
            enemyY <= fireY && fireY <= enemyYMax) {
      // if laser within enemy coordinates, remove enemy
      // coordinates and prevent being displayed again
      score += Number(scoreSystem.splice(enemyCoord.indexOf(enemy), 1))
      enemyCoord.splice(enemyCoord.indexOf(enemy), 1)
      if (score > hiScore) {
        hiScore = score
      }
      return true
    }
  }
}

function playerCollision (enemyFireX, enemyFireY) {
  if (playerX <= enemyFireX && enemyFireX <= playerX + player.width &&
        playerY <= enemyFireY && enemyFireY <= playerY + player.height) {
    return true
  }
}

function endConditions () {
  // endConditions victory condition is met when no enemies (and their Coord)
  // are left
  if (enemyCoord.length === 0) {
    nextLevel()
    return true
    // If player dies, reset appropriate variables
  } else if (enemyCoord[enemyCoord.length - 1][3] >= playerY ||
             playerCollision(enemyFireX, enemyFireY)) {
    // Stop any traveling lasers
    clearInterval(enemyFireFramesID)
    // Reset laser interval
    clearInterval(enemyFireID)
    enemyFireID = setInterval(enemyFire, Math.random() * 5000)
    level = 1
    enemyCoord = []
    scoreSystem = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
      20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
      20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
      10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
      10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
    // Reset obstacles, i.e. no collisions with obstacles
    collisionCoord = []
    fireX = undefined
    fireY = undefined
    enemyFireX = undefined
    enemyFireY = undefined
    enemyFiring = false
    enemyLoc(30, 90 + (level * 30))
    if (livesLeft <= 1) {
      clearInterval(updateID)
      livesLeft = 0
      setInterval(gameOver, 1000 / 30)
    } else if (livesLeft > 1) {
      // enemyFireX = 50;
      // enemyFireY = 150;
      livesLeft -= 1
      retry()
    }
    return true
  }
  return false
}

var level = 1
function nextLevel () {
  clearInterval(enemyFireFramesID)
  clearInterval(enemyFireID)
  enemyFireID = setInterval(enemyFire, Math.random() * 5000)
  enemyCoord = []
  scoreSystem = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
    20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
    10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
    10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
  collisionCoord = []
  fireX = undefined
  fireY = undefined
  enemyFireX = undefined
  enemyFireY = undefined
  enemyFiring = false
  level++
  enemyLoc(30, 90 + (level * 30))
  clearInterval(enemyMoveID)
  enemyMoveID = setInterval(enemyMovement, 1000)
  rightDirection = true
  downDirection = false
}

function gameOver () {
  ctx.clearRect(0, 0, playArea.width, playArea.height)
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, playArea.width, playArea.height)
  ctx.drawImage(player, playerX, playerY)
  clearInterval(enemyFireID)
  clearInterval(enemyMoveID)
  displayObstacles()
  displayScoreAndLives()
}

function retry () {
  level = 1
  clearInterval(enemyMoveID)
  enemyMoveID = setInterval(enemyMovement, 1000)
  rightDirection = true
  downDirection = false
  score = 0
}

var movementID = 0
function action (event) {
  if (event.type === 'keydown') {
    switch (event.keyCode) {
      case 37:
        if (!movementID) {
          movementID = setInterval(function () {
            // If player isn't at the edge of the playArea
            if (playerX > 0) {
              playerX -= 5
            }
          }, 1000 / 30)
        }
        break
      case 39:
        if (!movementID) {
          movementID = setInterval(function () {
            if (playerX < playArea.width - player.width) {
              playerX += 5
            }
          }, 1000 / 30)
        }
        break
      case 32:
        fire()
        break
      default:
        break
    }
  } else if (event.type === 'keyup') {
    switch (event.keyCode) {
      case 37:
      case 39:
        clearInterval(movementID)
        movementID = 0
        break
    };
  };
}

var firing = false
var laserWidth = 5
var laserHeight = 5
var fireFrames
function fire () {
  // Can only have one laser firing at a time
  if (!firing) {
    firing = true
    fireY = playerY + 10
    fireX = playerX + 22
    fireFrames = setInterval(function () {
      // If laser is no longer in playArea you can shoot again
      if (fireY < 100) {
        clearInterval(fireFrames)
        firing = false
      }
      // Laser moves upwards and new coordinates are stored
      fireY -= 2
      ctx.clearRect(fireX, fireY, laserWidth, laserHeight)
      // If collision occurs laser no longer moves and you can
      // fire again
      if (collision(fireX, fireY)) {
        clearInterval(fireFrames)
        firing = false
      }
      // If game session has ended laser stops
      if (endConditions()) {
        clearInterval(fireFrames)
        firing = false
      }
    }, 1000 / 300)
  };
}

var enemyFiring = false
var enemyFireX
var enemyFireY
var enemyFireFramesID
function enemyFire () {
  if (enemyCoord.length > 0) {
    if (!enemyFiring) {
      enemyFiring = true
      const fireLoc = Math.floor(Math.random() * enemyCoord.length)
      enemyFireX = enemyCoord[fireLoc][0] + 10
      enemyFireY = enemyCoord[fireLoc][1] + 10
      enemyFireFramesID = setInterval(enemyFireFrames, 1000 / 300)
    };
  };
}
function enemyFireFrames () {
  if (enemyFireY > playArea.height) {
    clearInterval(enemyFireFramesID)
    enemyFiring = false
  }
  if (endConditions()) {
    clearInterval(enemyFireFramesID)
    enemyFiring = false
  }
  enemyFireY += 1
  ctx.clearRect(enemyFireX, enemyFireY, laserWidth, laserHeight)
};
