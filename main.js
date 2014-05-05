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
    var x, y;
    for(var i=0; i<offsets.length; i++){
      x = currentCenter.x+offsets[i][0];
      y = currentCenter.y+offsets[i][1];
      handler(x, y);
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

  function rotate(){
    var oldRotationIndex = currentRotationIndex;
    currentRotationIndex = (currentRotationIndex + 1) % shape.rotations.length;

    // Revert the rotation to the old index if the new rotation would
    // mean that a part of the piece would be below zero
    eachBlock(function(x, y){
      if (y > FIELD_HEIGHT){
        currentRotationIndex = oldRotationIndex;
      }
    });

    // If the new rotation means that the piece would be beyond the
    // left/right border the piece is moved on into the middle
    eachBlock(function(x, y){
      if(x < 0){
        move(1, 0);
      } else if (x > FIELD_WIDTH-1){
        move(-1, 0);
      }
    });
  }

  function move(field, xOffset, yOffset){
    var oldX = currentCenter.x;
    var oldY = currentCenter.y;
    currentCenter.x += xOffset;
    currentCenter.y += yOffset;

    var touches = false;
    eachBlock(function(x, y){
      if(field.isFilled(x, y)){
        currentCenter.x = oldX;
        currentCenter.y = oldY;
        touches = true;
      }
    });
    return touches;
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
          ctx.fillRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
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

  return {
    draw: draw,
    addPiece: addPiece,
    isFilled: isFilled
  };
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
  canvas = document.getElementById('tutorial');
  canvas.width = FIELD_WIDTH * BLOCK_SIZE;
  canvas.height = FIELD_HEIGHT * BLOCK_SIZE;
  if (canvas.getContext){
    var ctx = canvas.getContext('2d');
    piece.draw(ctx);

    var lastTick = new Date();
    setInterval(function(){
      var goDown = false;
      var currentTick = new Date();
      if (currentTick - lastTick > 1000 / TICKS_PER_SEC){
        goDown = true;
        lastTick = currentTick;
      }

      if (goDown || currentKey === KEYS.DOWN){
        piece.remove(ctx);
        var touched = piece.move(field, 0, 1);
        if (touched){
          field.addPiece(piece);
          field.draw(ctx);
          piece = nextPiece();
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
        piece.rotate();
        piece.draw(ctx);
        currentKey = undefined;
      }
    }, 1000/FPS);
  }
}
