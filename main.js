"use strict";

var KEYS = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  P: 80,
};

var WIDTH = 10;
var FPS = 30;
var SPEED_PER_SEC = 5;


var shapes = [
  {
    color: 'blue',

    rotations: [

      //   =
      //   =
      //   ==
      function(ctx, x, y){
        ctx.fillRect(x, y, WIDTH, WIDTH*2);
        ctx.fillRect(x, y+(WIDTH*2), WIDTH*2, WIDTH);
      },

      //   ===
      //   =
      function(ctx, x, y){
        ctx.fillRect(x, y, WIDTH*3, WIDTH);
        ctx.fillRect(x, y+WIDTH, WIDTH, WIDTH);
      },

      //   ==
      //    =
      //    =
      function(ctx, x, y){
        ctx.fillRect(x, y, WIDTH*2, WIDTH);
        ctx.fillRect(x+WIDTH, y+WIDTH, WIDTH, WIDTH*2);
      },

      //      =
      //    ===
      function(ctx, x, y){
        ctx.fillRect(x+(WIDTH*2), y, WIDTH, WIDTH);
        ctx.fillRect(x, y+WIDTH, WIDTH*3, WIDTH);
      },
    ]
  },

  {
    color: 'yellow',

    rotations: [

      //   =
      //   ==
      //    =
      function (ctx, x, y){
        ctx.fillRect(x, y, WIDTH, WIDTH*2);
        ctx.fillRect(x+WIDTH, y+WIDTH, WIDTH, WIDTH*2);
      },

      //    ==
      //   ==
      function (ctx, x, y){
        ctx.fillRect(x+WIDTH, y, WIDTH*2, WIDTH);
        ctx.fillRect(x, y+WIDTH, WIDTH*2, WIDTH);
      },
    ]
  },

  {
    color: 'green',

    rotations: [
      //   =
      //   ==
      //   =
      function (ctx, x, y){
        ctx.fillRect(x, y, WIDTH, WIDTH*3);
        ctx.fillRect(x+WIDTH, y+WIDTH, WIDTH, WIDTH);
      },

      //    =
      //   ===
      function (ctx, x, y){
        ctx.fillRect(x+WIDTH, y, WIDTH, WIDTH);
        ctx.fillRect(x, y+WIDTH, WIDTH*3, WIDTH);
      },

      //    =
      //   ==
      //    =
      function (ctx, x, y){
        ctx.fillRect(x, y+WIDTH, WIDTH, WIDTH);
        ctx.fillRect(x+WIDTH, y, WIDTH, WIDTH*3);
      },

      //   ===
      //    =
      function (ctx, x, y){
        ctx.fillRect(x, y, WIDTH*3, WIDTH);
        ctx.fillRect(x+WIDTH, y+WIDTH, WIDTH, WIDTH);
      }
    ]
  },

  {
    color: 'red',

    rotations: [
      //   =
      //   =
      //   =
      //   =
      function(ctx, x, y){
        ctx.fillRect(x, y, WIDTH, WIDTH*4);
      },

      //   ====
      function(ctx, x, y){
        ctx.fillRect(x, y, WIDTH*4, WIDTH);
      },
    ]
  },

  {
    color: 'orange',

    rotations: [
      //   ==
      //   ==
      function(ctx, x, y){
        ctx.fillRect(x, y, WIDTH*2, WIDTH*2);
      },
    ]
  }
];


function Piece(ctx, shape, x, y){
  var currentRotationIndex = 0;

  function rotate(){
    console.log('rotate');
    currentRotationIndex = (currentRotationIndex + 1) % shape.rotations.length;
  }

  function draw(){
    ctx.fillStyle = shape.color;
    shape.rotations[currentRotationIndex](ctx, x, y);
  }

  function move(mx, my){
    x += mx;
    y += my;
    return y >= 400;
  }

  return {
    draw: draw,
    rotate: rotate,
    move: move,
  }
}


var Game = function(ctx){
  var currentKey;
  var currentPiece;
  var currentShape;

  function nextPiece(){
    shapes.push(currentShape);
    currentShape = shapes.shift();
    currentPiece = Piece(ctx, currentShape, 10, 10);
  }

  function draw(){
    ctx.clearRect(0,0,1000, 600);

    if (currentKey === KEYS.RIGHT){
      currentPiece.move(WIDTH, 0);
    } else if (currentKey === KEYS.LEFT){
      currentPiece.move(-WIDTH, 0);
    } else if (currentKey === KEYS.DOWN){
      currentPiece.move(0, WIDTH);
    } else if (currentKey === KEYS.UP){
      currentPiece.rotate();
      currentKey = undefined;
    }
    currentPiece.draw();
  }

  function keyDown(keyCode){
    currentKey = keyCode;
  }

  function keyUp(){
    currentKey = undefined;
  }

  function tick(){
    var isAtBottom = currentPiece.move(0, WIDTH);
    if (isAtBottom){
      nextPiece();
    }
  }

  currentShape = shapes.shift()
  nextPiece();

  return {
    draw: draw,
    keyDown: keyDown,
    keyUp: keyUp,
    tick: tick,
  }
}


function main(){
  var game;
  var canvas;

  document.onkeydown = function(e){
    game.keyDown(e.keyCode);
    if (KEYS[e.keyCode]){return false;}
  };
  document.onkeyup = function(e){game.keyUp()};

  canvas = document.getElementById('tutorial');
  if (canvas.getContext){
    var ctx = canvas.getContext('2d');
    game = Game(ctx);

    var x = 5;
    var y = 50;
    var s = 1;

    setInterval(game.draw, 1000/FPS);
    setInterval(game.tick, 1000/SPEED_PER_SEC);
  }
}
