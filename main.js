"use strict";

var KEYS = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  P: 80,
};

var BS = 10; // block size
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
        ctx.fillRect(x, y, BS, BS*2);
        ctx.fillRect(x, y+(BS*2), BS*2, BS);
      },

      //   ===
      //   =
      function(ctx, x, y){
        ctx.fillRect(x, y, BS*3, BS);
        ctx.fillRect(x, y+BS, BS, BS);
      },

      //   ==
      //    =
      //    =
      function(ctx, x, y){
        ctx.fillRect(x, y, BS*2, BS);
        ctx.fillRect(x+BS, y+BS, BS, BS*2);
      },

      //      =
      //    ===
      function(ctx, x, y){
        ctx.fillRect(x+(BS*2), y, BS, BS);
        ctx.fillRect(x, y+BS, BS*3, BS);
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
        ctx.fillRect(x, y, BS, BS*2);
        ctx.fillRect(x+BS, y+BS, BS, BS*2);
      },

      //    ==
      //   ==
      function (ctx, x, y){
        ctx.fillRect(x+BS, y, BS*2, BS);
        ctx.fillRect(x, y+BS, BS*2, BS);
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
        ctx.fillRect(x, y, BS, BS*3);
        ctx.fillRect(x+BS, y+BS, BS, BS);
      },

      //    =
      //   ===
      function (ctx, x, y){
        ctx.fillRect(x+BS, y, BS, BS);
        ctx.fillRect(x, y+BS, BS*3, BS);
      },

      //    =
      //   ==
      //    =
      function (ctx, x, y){
        ctx.fillRect(x, y+BS, BS, BS);
        ctx.fillRect(x+BS, y, BS, BS*3);
      },

      //   ===
      //    =
      function (ctx, x, y){
        ctx.fillRect(x, y, BS*3, BS);
        ctx.fillRect(x+BS, y+BS, BS, BS);
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
        ctx.fillRect(x, y, BS, BS*4);
      },

      //   ====
      function(ctx, x, y){
        ctx.fillRect(x, y, BS*4, BS);
      },
    ]
  },

  {
    color: 'orange',

    rotations: [
      //   ==
      //   ==
      function(ctx, x, y){
        ctx.fillRect(x, y, BS*2, BS*2);
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


var Game = function(ctx, boardWidth, boardHeight){
  var currentKey;
  var currentPiece;
  var currentShape;

  function nextPiece(){
    shapes.push(currentShape);
    currentShape = shapes.shift();
    currentPiece = Piece(ctx, currentShape, 10, 10);
  }

  function draw(){
    ctx.clearRect(0, 0, boardWidth, boardHeight);

    if (currentKey === KEYS.RIGHT){
      currentPiece.move(BS, 0);
    } else if (currentKey === KEYS.LEFT){
      currentPiece.move(-BS, 0);
    } else if (currentKey === KEYS.DOWN){
      currentPiece.move(0, BS);
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
    var isAtBottom = currentPiece.move(0, BS);
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
  var boardWidth = 30*BS;
  var boardHeight = 50*BS;

  document.onkeydown = function(e){
    game.keyDown(e.keyCode);
    if (KEYS[e.keyCode]){return false;}
  };
  document.onkeyup = function(e){game.keyUp()};

  canvas = document.getElementById('tutorial');
  canvas.width = boardWidth;
  canvas.height = boardHeight;
  if (canvas.getContext){
    var ctx = canvas.getContext('2d');
    game = Game(ctx, boardWidth, boardHeight);

    var x = 5;
    var y = 50;
    var s = 1;

    setInterval(game.draw, 1000/FPS);
    setInterval(game.tick, 1000/SPEED_PER_SEC);
  }
}
