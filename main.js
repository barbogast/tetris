"use strict";

// http://stackoverflow.com/a/1527820
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var KEYS = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  P: 80,
};

var FPS = 30;
var TICKS_PER_SEC = 3;


var FIELD_WIDTH = 10;
var FIELD_HEIGHT = 17;
var BLOCK_SIZE = 20;
var COLORS = {
  1: 'yellow',
  2: 'red',
  3: 'green',
  4: 'blue',
}


// Converts a string representation of a shape into an array
// representation.
// The return value is an array of block coordinates. Each block
// coordinate is an array of the horizontal and vertical distance to the
// center of the block.
// The string representation must be an array of strings with equal
// length. The strings may contain 'X', 'C' and blanks. 'C' marks the
// center of the block. The resulting array will contain an inner array
// for each 'X': [horizontalDistanceToCenter, verticalDistanceToCenter]
// Example:
// [
//   '  X  ',
//   '  C  ',
//   '  XX '
// ]
//
// will become
// [
// [0, -1]
// [0,  0]
// [1,  0]
// [1,  1]
// ]

function convertShape(shape){
  var centerX;
  var centerY;
  var previousLength;
  for(var i=0; i<shape.length; i++){
    var line = shape[i];

    if(previousLength !== undefined && line.length !== previousLength){
      alert('Error: shape has lines with different lengths');
    }
    previousLength = line.length;

    var idx = line.indexOf('C');
    if(idx >= 0){
      if(centerX !== undefined){
        alert("Error: shape has two 'C'");
      }
      centerX = idx;
      centerY = i;
    }
  }

  if(centerX === undefined){
    alert('Error: could not find center of shape');
  }

  var shapeArray = [];
  for(var y=0; y<shape.length; y++){
    for(var x=0; x < shape[y].length; x++){
      if (shape[y][x] === 'X' || shape[y][x] === 'C'){
        shapeArray.push([x-centerX, y-centerY])
      }
    }
  }
  return shapeArray;
}


var SHAPES = [{
  color: 'green',
  rotations: [[
    '  X   ',
    '  CX  ',
    '  X   ',
  ],[
    '  XCX  ',
    '   X   ',
  ],[
    '   X  ',
    '  XC  ',
    '   X  ',
  ],[
    '   X   ',
    '  XCX  ',
  ]],
  initialRotation: 0,
  initialYOffset: -1,
},{
  color: 'blue',
  rotations: [[
    '  X   ',
    '  C   ',
    '  XX  ',
  ],[
    '  XCX  ',
    '  X    ',
  ],[
    '  XX  ',
    '   C  ',
    '   X  ',
  ],[
    '    X  ',
    '  XCX  ',
  ]],
  initialRotation: 0,
  initialYOffset: -1,
},{
  color: 'aqua',
  rotations: [[
    '   X  ',
    '   C  ',
    '  XX  ',
  ],[
    '  X    ',
    '  XCX  ',
  ],[
    '  XX  ',
    '  C   ',
    '  X   ',
  ],[
    '  XCX  ',
    '    X  ',
  ]],
  initialRotation: 0,
  initialYOffset: -1,
},{
  color: 'yellow',
  rotations: [[
    '   CX  ',
    '  XX   ',
  ],[
    '  X   ',
    '  XC  ',
    '   X  ',
  ]],
  initialRotation: 0,
  initialYOffset: 0,
},{
  color: 'purple',
  rotations: [[
    '  XC   ',
    '   XX  ',
  ],[
    '   X  ',
    '  XC  ',
    '  X   ',
  ]],
  initialRotation: 0,
  initialYOffset: -1
},{
  color: 'red',
  rotations: [[
    '  X  ',
    '  C  ',
    '  X  ',
    '  X  ',
  ],[
    '  XXCX  ',
  ]],
  initialRotation: 0,
  initialYOffset: -1,
},{
  color: 'orange',
  rotations: [[
    '  CX  ',
    '  XX  ',
  ]],
  initialRotation: 0,
  initialYOffset: 0,
}];


for(var i=0; i<SHAPES.length; i++){
  for(var j=0; j<SHAPES[i].rotations.length; j++){
    SHAPES[i].rotations[j] = convertShape(SHAPES[i].rotations[j]);
  }
}


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

  function moveTo(x, y){
    currentCenter.x = x;
    currentCenter.y = y;
  }

  function getColor(){
    return shape.color;
  }

  return {
    draw: draw,
    remove: remove,
    rotate: rotate,
    move: move,
    moveTo: moveTo,
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
      // We need to check the field bounds since at the game and a
      // partly hidden piece could be added
      if(x >= 0 && x < FIELD_WIDTH && y > 0 && y < FIELD_HEIGHT){
        content[y][x] = piece.getColor();
      }
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

    for(var y=FIELD_HEIGHT-1; y>=0; y--){
      var isComplete = true;
      for(var x=0; x<FIELD_WIDTH; x++){
        if(content[y][x] === undefined){
          isComplete = false;
          break;
        }
      }
      if(isComplete){
        content.splice(y, 1);
        count += 1;
      }
    }
    for(var i=0; i<count; i++){
      content.splice(0, 0, Array(FIELD_WIDTH));
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

function updateMessage(resolvedLines, gameOver){
  var p = document.getElementById('message');
  var msg = 'Dissolved lines: ' + resolvedLines;
  if(gameOver){
    msg = 'Game over. ' + msg;
  }
  p.innerHTML = msg;
}

function Preview(){
  var canvas = document.getElementById('preview');
  canvas.width = canvas.height = BLOCK_SIZE * 7;
  var ctx = canvas.getContext('2d');

  function update(piece){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    piece.moveTo(3, 3);
    piece.draw(ctx);
  }

  return {update: update};
}


function PieceBox(preview){
  var nextShapeIndex = getRandomInt(0, SHAPES.length-1);

  function nextPiece(){
    var currentShapeIndex = nextShapeIndex;
    if(SHAPES.length >= 2){
      while(nextShapeIndex === currentShapeIndex){
        nextShapeIndex = getRandomInt(0, SHAPES.length-1);
      }
    }
    preview.update(Piece(SHAPES[nextShapeIndex]));
    return Piece(SHAPES[currentShapeIndex]);
  }

  return {nextPiece: nextPiece};
}


function main(){
  var preview = Preview();
  var piecebox = PieceBox(preview);

  var fieldCanvas = document.getElementById('gamefield');
  fieldCanvas.width = FIELD_WIDTH * BLOCK_SIZE;
  fieldCanvas.height = FIELD_HEIGHT * BLOCK_SIZE;
  var ctx = fieldCanvas.getContext('2d');

  var currentKey;
  document.onkeydown = function(e){
    currentKey = e.keyCode;
    if (KEYS[e.keyCode]){return false;}
  };
  document.onkeyup = function(e){
    currentKey = undefined;
  };

  var field = Field();
  var lastTick = new Date();
  var dissolvedLines = 0;
  var piece = piecebox.nextPiece();
  piece.draw(ctx);
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
        dissolvedLines += field.removeCompleteLines();
        field.draw(ctx);
        piece = piecebox.nextPiece();
        var gameOver = false;
        piece.eachBlock(function(x, y){
          if(field.isFilled(x, y)){
            clearInterval(intervalId);
            gameOver = true;
          }
        });
        updateMessage(dissolvedLines, gameOver);
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
