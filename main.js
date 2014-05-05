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
  currentRotationIndex: 0,
  blocks: 3
}]


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

function drawShape(ctx, shape, center, color){
  var offsets = shape.rotations[shape.currentRotationIndex];
  var x;
  var y;
  for(var i=0; i<offsets.length; i++){
    x = center.x + offsets[i][0];
    y = center.y + offsets[i][1];
    ctx.fillStyle = color;
    ctx.fillRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }
}

function rotateShape(shape){
  shape.currentRotationIndex = (shape.currentRotationIndex + 1) % shape.rotations.length;
}

function main(){
  var field = Array(FIELD_HEIGHT);
  for(var i=0; i< FIELD_HEIGHT; i++){
    field[i] = Array(FIELD_WIDTH);
  }

  var currentShape;
  var currentShapeCenter;

  function nextShape(){
    if(currentShape){
      currentShape.push(shapes);
    }
    currentShape = shapes.shift();
    currentShapeCenter = {x: Math.floor(FIELD_WIDTH/2), y: 1-currentShape.initialHeight};
  }
  nextShape();


  var canvas;

  canvas = document.getElementById('tutorial');
  canvas.width = FIELD_WIDTH * BLOCK_SIZE;
  canvas.height = FIELD_HEIGHT * BLOCK_SIZE;
  if (canvas.getContext){
    var ctx = canvas.getContext('2d');
    drawShape(ctx, currentShape, currentShapeCenter, currentShape.color);

    setInterval(function(){
      drawField(ctx, field);
    }, 1000/FPS);

    setInterval(function(){
      drawShape(ctx, currentShape, currentShapeCenter, 'white');
      rotateShape(currentShape);
      currentShapeCenter.y += 1;
      drawShape(ctx, currentShape, currentShapeCenter, currentShape.color);
    }, 1000/1);//SPEED_PER_SEC);
  }
}
