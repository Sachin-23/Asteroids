const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

// Refactor this
const starsCount = 50;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function random(min, max) {
    return Math.random() * (max - min + 1) + min;
}

class Star {
  constructor(x, y) {
    this.x = x; 
    this.y = y; 
  }
  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, 2, 2);
  }
}

class SpaceShip {
  // TODO 
  constructor(x, y, rotation) {
    // velicoty vector
    this.vel = {x: 0, y:0};
    this.pos = {x: x, y: y};
    this.rotation = rotation;
    this.accel = 0;   
  }

  setAccel(accel) {
    this.accel += accel;   
  }

  clearAccel() {
    this.accel = 0;   
  }

  setRotation(d) {
    this.rotation = (this.rotation + d) % 360;
  }

  draw() {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.translate(-this.pos.x, -this.pos.y);

    ctx.beginPath();

    this.pos.x = (this.pos.x + canvas.width) % canvas.width;
    this.pos.y = (this.pos.y + canvas.height) % canvas.height;

    ctx.moveTo(this.pos.x, this.pos.y - 16);
    ctx.lineTo(this.pos.x - 8, this.pos.y + 8);
    ctx.lineTo(this.pos.x + 8, this.pos.y + 8);
    ctx.lineTo(this.pos.x, this.pos.y - 16);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke(); 
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }
}

class Asteroid {
  // TODO
}


class Game {
  constructor(starsCount, ) {
    this.stars = [];
    this.ship = new SpaceShip(width / 2, height / 2, 0);

    // NOTE
    for (var i = 0; i < starsCount; ++i) {
      this.stars[i] = new Star(randomInt(0, width), randomInt(0, height));
    }

    document.addEventListener("keydown", (event) => { 
      switch (event.key) {
        case "ArrowUp": this.ship.setAccel(0.05);
          break;
        case "ArrowRight": this.ship.setRotation(5);
          break;
        case "ArrowLeft": this.ship.setRotation(-5);
          break;
      }
    });

    document.addEventListener("keyup", (event) => { 
      switch (event.key) {
        case "ArrowUp": this.ship.clearAccel();
      }
    });
  }

  draw() {
    for (const star of this.stars) {
      star.draw();
    }
    this.ship.draw();
  }
}

const loop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  game.draw();

  requestAnimationFrame(loop);
};

const game = new Game(starsCount);

loop();
