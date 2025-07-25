const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

const maxVel = 8;

// Refactor this
const starsCount = 50;
const asteroidsCount = 2;

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
    this.a = {x: 0, y: 0};
  }

  setAccel(accel) {
    this.accel += accel;   

    // Radians
    this.a.x = Math.sin(this.rotation * Math.PI / 180);
    this.a.y = Math.cos(this.rotation * Math.PI / 180);

    // Update Velcoity
    this.vel.x += (this.accel * this.a.x);
    this.vel.y += (this.accel * this.a.y);

    this.vel.x = Math.min(maxVel, this.vel.x);
    this.vel.y = Math.min(maxVel, this.vel.y);
  }

  clearAccel() {
    this.accel = 0;   
  }

  setRotation(d) {
    this.rotation = Math.abs((this.rotation + d + 360) % 360);
  }

  updatePosition() {
    // Update Position
    this.pos.x += this.vel.x; 
    this.pos.y -= this.vel.y;
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

  shoot() {
    // TODO
    // Shoot using the current rotation distance should be the width
    // Create a new class for Bullets
  }
}

class Asteroid {
  // TODO
  constructor(x, y, rotation) {
    this.x = x;  
    this.y = y;  
    this.rotation = rotation;
  }
    
  draw() {
    // ctx.save();
    // ctx.translate(this.x, this.y);
    // ctx.rotate((this.rotation * Math.PI) / 180);
    // ctx.translate(-this.x, -this.y);
    //
    // ctx.beginPath();
    // ctx.fillStyle = "white";
    // ctx.fillRect(this.x, this.y, 4, 4);
    // ctx.restore();
  }
   
}


class Game {
  constructor(starsCount, ) {
    this.stars = [];
    this.asteroids = [];
    this.ship = new SpaceShip(width / 2, height / 2, 0);

    // NOTE
    for (var i = 0; i < starsCount; ++i) {
      this.stars[i] = new Star(randomInt(0, width), randomInt(0, height));
    }

    for (var i = 0; i < asteroidsCount; ++i) {
      this.asteroids[i] = new Asteroid(randomInt(0, width), randomInt(0, height), randomInt(0, 360)); 
    }

    document.addEventListener("keydown", (event) => { 
      switch (event.key) {
        case "ArrowUp": this.ship.setAccel(0.08);
          break;
        case "ArrowRight": this.ship.setRotation(10);
          break;
        case "ArrowLeft": this.ship.setRotation(-10);
          break;
        case "Space": this.ship.shoot();
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
    for (const asteroid of this.asteroids) {
      asteroid.draw();
    }
    this.ship.updatePosition();
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
