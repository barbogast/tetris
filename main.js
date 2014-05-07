"use strict";

var KEYS = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  P: 80,
};

var FPS = 30;
var SPEED_PER_SEC = 5;


var FIELD_WIDTH = 40;
var FIELD_HEIGHT = 80;
var BLOCK_SIZE = 10;
var COLORS = {
  1: 'yellow',
  2: 'red',
  3: 'green',
  4: 'blue',
}


var shapes = [{
  color: 'green',

  // Array of the various possible rotations of the shape. Each rotation
  // if an array of offsets. Each offset is an array of the x offset and
  // the y offset of the center.
  rotations: [
    //   1
    //   c2
    //   3
    [[ 0, -1],  // 1
     [ 0,  0],  // center
     [ 1,  0],  // 2
     [ 0,  1]], // 3

    //    2
    //   1c3
    [[ 0,  1],  // 2
     [-1,  0],  // 1
     [ 0,  0],  // center
     [ 1,  0]], // 3

    //    3
    //   2c
    //    1
    [[ 0, -1],  // 3
     [-1,  0],  // 2
     [ 0,  0],  // center
     [ 0,  1]], // 1

    //   3c1
    //    2
    [[-1,  0],  // 3
     [ 0,  0],  // center
     [ 1,  0],  // 1
     [ 0, -1]], // 2
  ],
  initialRotation: 0,
  initialYOffset: -1,
},{
  color: 'blue',
  rotations: [
    //   1
    //   c
    //   23
    [[0, -1],  // 1
     [0,  0],  // center
     [0,  1],  // 2
     [1,  1]], // 3

    //   2c1
    //   3
    [[-1, 0],  // 2
     [ 0, 0],  // center
     [ 1, 0],  // 1
     [-1, 1]], // 3

    //   32
    //    c
    //    1
    [[-1, -1],  // 3
     [ 0, -1],  // 2
     [ 0,  0],  // center
     [ 0,  1]], // 1

    //      3
    //    1c2
    [[ 1, -1],  // 3
     [-1,  0],  // 1
     [ 0,  0],  // center
     [ 1,  0]], // 2
  ],
  initialRotation: 0,
  initialYOffset: -1,
},{
  color: 'yellow',
  rotations: [
    //    c1
    //   23
    [[ 0,  0],  // center
     [ 1,  0],  // 1
     [-1,  1],  // 2
     [ 0,  1]], // 3

    //   1
    //   c3
    //    2
    [[ 0, -1],  // 1
     [ 0,  0],  // center
     [ 1,  0],  // 3
     [ 1,  1]]  // 2

  ],
  initialRotation: 0,
  initialYOffset: 0,
},{
  color: 'red',
  rotations: [
    //   1
    //   c
    //   2
    //   3
    [[ 0, -1],  // 1
     [ 0,  0],  // center
     [ 0,  1],  // 2
     [ 0,  2]], // 3

    //   32c1
    [[ -2, 0],  // 3
     [ -1, 0],  // 2
     [  0, 0],  // center
     [  1, 0]], // 1
    ],
    initialRotation: 0,
    initialYOffset: -1,
},{
  color: 'orange',
  rotations: [
    //   c1
    //   23
    [[ 0,  0],  // center
     [ 1,  0],  // 1
     [ 0,  1],  // 2
     [ 1,  1]],  // 3
    ],
    initialRotation: 0,
    initialYOffset: 0,
}]

function Piece(shape){
  var currentRotationIndex = 0;
  var currentCenter = {
    x: Math.floor(FIELD_WIDTH/2),
    y: shape.initialYOffset
  };

  function eachBlock(handler){
    var offsets = shape.rotations[currentRotationIndex];
    var x, y, stopIteration;
    for(var i=0; i<offsets.length; i++){
      x = currentCenter.x+offsets[i][0];
      y = currentCenter.y+offsets[i][1];
      stopIteration = handler(x, y);
      if (stopIteration === false){
        break;
      }
    }
  }

  function draw_private(ctx, color){
    var x, y;
    ctx.fillStyle = color;
    eachBlock(function(x, y){
      ctx.fillRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    });
  }

  function draw(ctx){
    draw_private(ctx, shape.color);
  }

  function remove(ctx){
    draw_private(ctx, 'white');
  }

  function rotate(field){
    // store the current rotation
    var oldRotationIndex = currentRotationIndex;

    // rotate
    currentRotationIndex = (currentRotationIndex + 1) % shape.rotations.length;

    // for each block in the rotated piece
    eachBlock(function(x, y){
      // if the block is already filled on the field
      if (field.isFilled(x, y)){
        // try to move the piece one block to the right
        var wasMoved = move(field, 1, 0);
        // if there is no space
        if (!wasMoved){
          // try to move the piece on block to the left
          wasMoved = move(field, -1, 0);
          // if there still is no space
          if (!wasMoved){
            // revert the rotation
            currentRotationIndex = oldRotationIndex;
          }
        }
        // no more blocks need to be checked at this point: either the
        // piece was moved to a valid position or the rotation was
        // reverted
        return false;
      }
    });
  }

  function move(field, xOffset, yOffset){
    var oldX = currentCenter.x;
    var oldY = currentCenter.y;
    currentCenter.x += xOffset;
    currentCenter.y += yOffset;

    var wasMoved = true;
    eachBlock(function(x, y){
      if(field.isFilled(x, y)){
        currentCenter.x = oldX;
        currentCenter.y = oldY;
        wasMoved = false;
      }
    });
    return wasMoved;
  }

  function getColor(){
    return shape.color;
  }

  return {
    draw: draw,
    remove: remove,
    rotate: rotate,
    move: move,
    getColor: getColor,
    eachBlock: eachBlock
  };
}


function Field(){
  var content = [];
  var content = Array(FIELD_HEIGHT);
  for(var i=0; i< FIELD_HEIGHT; i++){
    content[i] = Array(FIELD_WIDTH);
  }

  function draw(ctx){
    for(var y=0; y<FIELD_HEIGHT; y++){
      for(var x=0; x<FIELD_WIDTH; x++){
        if(content[y][x]){
          ctx.fillStyle = content[y][x];

        } else {
          ctx.fillStyle = 'white';
        }
        ctx.fillRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }

  function addPiece(piece){
    piece.eachBlock(function(x, y){
      content[y][x] = piece.getColor();
    });
  }

  function isFilled(x, y){
    if(x < 0 || x > FIELD_WIDTH-1 || y > FIELD_HEIGHT-1){
      return true;
    }

    if(x >= 0 && x < FIELD_WIDTH && y >= 0 && y < FIELD_HEIGHT){
      return content[y][x] !== undefined;
    } else {
      return false;
    }
  }

  function removeCompleteLines(){
    var count = 0;
    for(var y=0; y<FIELD_HEIGHT; y++){
      var isComplete = true;
      for(var x=0; x<FIELD_WIDTH; x++){
        if(content[y][x] === undefined){
          isComplete = false;
          break;
        }
      }
      if(isComplete){
        count += 1;
        content.splice(y+1, 1);
        content.splice(0, 0, Array(FIELD_WIDTH));
      }
    }
    return count;
  }

  return {
    draw: draw,
    addPiece: addPiece,
    isFilled: isFilled,
    removeCompleteLines: removeCompleteLines,
  };
}

function updateMessage(resolvedLines){
  var p = document.getElementById('message');
  p.innerHTML = 'Dissolved lines: ' + resolvedLines;
}

function main(){

  var currentShape;
  var field = Field();

  function nextPiece(){
    if(currentShape){
      shapes.push(currentShape);
    }
    currentShape = shapes.shift();
    currentShape.currentRotationIndex = 0;
    return Piece(currentShape);
  }
  var piece = nextPiece();

  var currentKey;
  document.onkeydown = function(e){
    currentKey = e.keyCode;
    if (KEYS[e.keyCode]){return false;}
  };
  document.onkeyup = function(e){
    currentKey = undefined;
  };

  var canvas;
  canvas = document.getElementById('gamefield');
  canvas.width = FIELD_WIDTH * BLOCK_SIZE;
  canvas.height = FIELD_HEIGHT * BLOCK_SIZE;
  if (canvas.getContext){
    var ctx = canvas.getContext('2d');
    piece.draw(ctx);

    var lastTick = new Date();
    var intervalId = setInterval(function(){
      var goDown = false;
      var currentTick = new Date();
      if (currentTick - lastTick > 1000 / TICKS_PER_SEC){
        goDown = true;
        lastTick = currentTick;
      }

      if (goDown || currentKey === KEYS.DOWN){
        piece.remove(ctx);
        var wasMoved = piece.move(field, 0, 1);
        if (!wasMoved){
          field.addPiece(piece);
          resolvedLines += field.removeCompleteLines();
          updateMessage(resolvedLines);
          field.draw(ctx);
          piece = nextPiece();
          piece.eachBlock(function(x, y){
            if(field.isFilled(x, y)){
              clearInterval(intervalId);
            }
          });
        } else {
          piece.draw(ctx);
        }
      } else if (currentKey === KEYS.LEFT){
        piece.remove(ctx);
        piece.move(field, -1, 0);
        piece.draw(ctx);
      } else if (currentKey === KEYS.RIGHT){
        piece.remove(ctx);
        piece.move(field, 1, 0);
        piece.draw(ctx);
      } else if (currentKey === KEYS.UP){
        piece.remove(ctx);
        piece.rotate(field);
        piece.draw(ctx);
      }
      currentKey = undefined;
    }, 1000/FPS);
  }
}
