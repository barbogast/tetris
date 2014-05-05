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
  color: 'blue',

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
}]

function Piece(shape){
  var currentRotationIndex = 0;
  var currentCenter = {
    x: Math.floor(FIELD_WIDTH/2),
    y: shape.initialYOffset
  };

  function eachCurrentOffset(handler){
    var offsets = shape.rotations[currentRotationIndex];
    for(var i=0; i<offsets.length; i++){
      handler(offsets[i]);
    }
  }

  function draw(ctx, remove){
    var x, y, color;
    if (remove){
      ctx.fillStyle = 'white';
    } else {
      ctx.fillStyle = shape.color;
    }
    eachCurrentOffset(function(offset){
      x = currentCenter.x + offset[0];
      y = currentCenter.y + offset[1];
      ctx.fillRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    });
  }

  function rotate(){
    currentRotationIndex = (currentRotationIndex + 1) % shape.rotations.length;
  }

  function move(xOffset, yOffset){
    currentCenter.x += xOffset;
    currentCenter.y += yOffset;
  }

  return {
    draw: draw,
    rotate: rotate,
    move: move
  };
}

function drawField(ctx, field){
  for(var y=0; y<FIELD_HEIGHT; y++){
    for(var x=0; x<FIELD_WIDTH; x++){
      if(field[y][x]){
        ctx.fillStyle = COLORS[field[y][x]];
        ctx.fillRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}




function main(){
  var field = Array(FIELD_HEIGHT);
  for(var i=0; i< FIELD_HEIGHT; i++){
    field[i] = Array(FIELD_WIDTH);
  }

  var currentShape;

  function nextShape(){
    if(currentShape){
      currentShape.push(shapes);
    }
    currentShape = shapes.shift();
    currentShape.currentRotationIndex = 0;

  }
  nextShape();
  var piece = Piece(currentShape);

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
    piece.draw(ctx, false);

    setInterval(function(){
      drawField(ctx, field);
      if (currentKey){
        piece.draw(ctx, true);
        if (currentKey === KEYS.RIGHT){
          piece.move(1, 0);
        } else if (currentKey === KEYS.LEFT){
          piece.move(-1, 0);
        } else if (currentKey === KEYS.DOWN){
          piece.move(0, 1);
        } else if (currentKey === KEYS.UP){
          piece.rotate();
          currentKey = undefined;
        }
        piece.draw(ctx, false);
      }
    }, 1000/FPS);

    setInterval(function(){
      piece.draw(ctx, true);
      piece.move(0, 1);
      piece.draw(ctx, false);
    }, 1000/1);//SPEED_PER_SEC);
  }
}
