const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

const maxAccel = 0.05;

// Refactor this
const starsCount = 50;
const asteroidsCount = 3;

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

class Bullet {
  constructor(x, y, d, accel) {
    this.ox = x;
    this.oy = y;

    this.x = x;
    this.y = y;
    this.rotation = d;
    this.distance = 0;
    this.accel = accel;

    this.vel = {x: 0, y: 0};
    this.a = {x: 0, y: 0};

    this.a.x = Math.sin(this.rotation * Math.PI / 180);
    this.a.y = Math.cos(this.rotation * Math.PI / 180);

    // Update Velcoity
    this.vel.x = (this.accel * this.a.x);
    this.vel.y = -(this.accel * this.a.y);
  }

  updatePosition() {
    this.x = (this.x + this.vel.x + width) % width;
    this.y = (this.y + this.vel.y + height) % height;

    const dx = this.x - this.ox;
    const dy = this.y - this.oy;

    this.distance = Math.sqrt(dx * dx + dy * dy); 
  }
  
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.translate(-this.x, -(this.y));

    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, 3, 3);
    ctx.restore();
  }
   
}

class SpaceShip {
  // TODO 
  constructor(x, y, rotation, size) {
    // velicoty vector
    this.vel = {x: 0, y:0};
    this.friction = 0.01;
    this.pos = {x: x, y: y};
    this.rotation = rotation;
    this.accel = 0;   
    this.a = {x: 0, y: 0};
    this.size = size;
  }

  setAccel(accel) {
    this.accel =  Math.min(maxAccel, this.accel + accel);   

    // Radians
    this.a.x = Math.sin(this.rotation * Math.PI / 180);
    this.a.y = Math.cos(this.rotation * Math.PI / 180);

    // Update Velcoity
    this.vel.x += (this.accel * this.a.x);
    this.vel.y -= (this.accel * this.a.y);
  }

  setVel() {
    var velMag = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
    if (velMag > 0.0) {
      this.vel.x -= this.friction * this.vel.x / velMag;
      this.vel.y -= this.friction * this.vel.y / velMag;
    }

    console.log(this.vel.x, this.vel.y);
  }

  clearAccel() {
    this.accel = 0;   
  }

  setRotation(d) {
    this.rotation = Math.abs((this.rotation + d + 360) % 360);
  }

  updatePosition() {
    // Update Position
    this.pos.x = (this.pos.x + this.vel.x) % width; 
    this.pos.y = (this.pos.y + this.vel.y) % height;
  }

  draw() {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.translate(-this.pos.x, -this.pos.y);

    ctx.beginPath();

    this.pos.x = (this.pos.x + canvas.width) % canvas.width;
    this.pos.y = (this.pos.y + canvas.height) % canvas.height;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.fillStyle = "black";

    ctx.moveTo(this.pos.x, this.pos.y - 16);
    ctx.lineTo(this.pos.x - 8, this.pos.y + 8);
    ctx.lineTo(this.pos.x + 8, this.pos.y + 8);
    ctx.lineTo(this.pos.x, this.pos.y - 16);
    ctx.stroke(); 
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }

  shoot() {
    // change bullet speed;
    const bullet = new Bullet(this.pos.x, this.pos.y, this.rotation, 2);
    return bullet;
  }

}

class Asteroid {
  // TODO
  constructor(x, y, rotation, accel, size) {
    this.x = x;  
    this.y = y;  
    this.accel = accel;
    this.vel = {x: 0, y: 0};
    this.a = {x: 0, y: 0};
    this.rotation = rotation;
    this.size = size;

    this.a.x = Math.sin(this.rotation * Math.PI / 180);
    this.a.y = Math.cos(this.rotation * Math.PI / 180);

    // Update Velcoity
    this.vel.x = (this.accel * this.a.x);
    this.vel.y = (this.accel * this.a.y);
  }

  updatePosition() {
    this.x = (this.x + this.vel.x + width) % width;
    this.y = (this.y + this.vel.y + height) % height;
  }
    
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.translate(-this.x, -this.y);

    ctx.strokeStyle = "white";
    ctx.lineWidth = this.size / 40;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
   
}


class Game {
  constructor(starsCount, ) {
    this.stars = [];
    this.asteroids = new Set();
    this.ship = new SpaceShip(width / 2, height / 2, 0, 10);
    this.end = false;
    this.bullets = new Set();
    this.accelOn = false;
    this.rotateLeft = false;
    this.rotateRight = false;

    // NOTE
    for (var i = 0; i < starsCount; ++i) {
      this.stars[i] = new Star(randomInt(0, width), randomInt(0, height));
    }

    for (var i = 0; i < asteroidsCount; ++i) {
      this.asteroids.add(new Asteroid(randomInt(0, width), randomInt(0, height), randomInt(0, 360), random(0.08, 1), 50)); 
    }

    document.addEventListener("keydown", (event) => { 
      switch (event.key) {
        case "ArrowUp": this.accelOn = true;
          break;
        case "ArrowRight": this.rotateRight = true;
          break;
        case "ArrowLeft": this.rotateLeft = true;
          break;
        case " ": this.bullets.add(this.ship.shoot());
          console.log(this.bullets);
          break;
      }
    });

    document.addEventListener("keyup", (event) => { 
      switch (event.key) {
        case "ArrowUp": this.accelOn = false;
          break;
        case "ArrowRight": this.rotateRight = false;
          break;
        case "ArrowLeft": this.rotateLeft = false;
          break;
      }
    });
  }

  draw() {
    for (const star of this.stars) {
      star.draw();
    }
    for (const asteroid of this.asteroids) {
      asteroid.updatePosition();
      asteroid.draw();
    }
    for (const bullet of this.bullets) {
      console.log(bullet);
      bullet.updatePosition();
      bullet.draw();
    }

    if (this.accelOn) {
      this.ship.setAccel(0.004);
    } else {
      this.ship.clearAccel();
    }

    if (this.rotateLeft) {
      this.ship.setRotation(-4);
    }

    if (this.rotateRight) {
      this.ship.setRotation(4);
    }

    this.ship.setVel();

    this.ship.updatePosition();
    this.ship.draw();
  }

  // Between ship and asteroids
  collisionDetect() {
    // check if ship is colliding with asteroids
    for (const asteroid of this.asteroids) {

      const dx = this.ship.pos.x - asteroid.x;
      const dy = this.ship.pos.y - asteroid.y;

      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.ship.size + asteroid.size) {
        this.end = true;
      }
    }

    for (const bullet of this.bullets) {
      for (const asteroid of this.asteroids) {
        const dx = bullet.x - asteroid.x;
        const dy = bullet.y - asteroid.y;

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < asteroid.size) {
          this.bullets.delete(bullet);
          const x = asteroid.x;
          const y = asteroid.y;
          const size = asteroid.size;
          this.asteroids.delete(asteroid);

          if (size > 12.5) {
            this.asteroids.add(new Asteroid(x, y, randomInt(0, 360), random(0.08, 1), size / 2)); 
            this.asteroids.add(new Asteroid(x, y, randomInt(0, 360), random(0.08, 1), size / 2)); 
          }
        }
      }
    } 
  } 

  removeBullets() {
    for (const bullet of this.bullets) {
      // Change this distance 
      if (bullet.distance > 300) {
        this.bullets.delete(bullet);
      }
    }
  } 
}

const loop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  game.draw();
  game.collisionDetect();
  game.removeBullets();

  if (game.end === false) {
    requestAnimationFrame(loop);
  }
};

const game = new Game(starsCount);

loop();
