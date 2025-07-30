// Config
const Config = {
  starsCount: 50,
  asteroidsCount: 3,
  accel: 30,
  rotation: 12,
  maxAccel: 15,
  bulletMaxDistance: 500,
  ship: { size: 10, friction: 0.01, maxVelocity: 100 },
  asteroid: { initialSize: 50, minSize: 12.5, speedRange: [0.08, 1] }
}

// Util
const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const random = (min, max) => {
    return Math.random() * (max - min) + min;
}

class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  copy() {
    return new Vector2(this.x, this.y);
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  scale(s) {
    return new Vector2(this.x * s, this.y * s);
  }

  magnitude() { 
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const m = this.magnitude() || 1; // why this ? 
    return new Vector2(this.x / m, this.y / m);
  }

  static fromAngle(deg) {
    const rad = deg * Math.PI / 180;
    return new Vector2(Math.sin(rad), Math.cos(rad));
  }
}

const wrap = (value, max) => {
  return (value + max) % max;
}

// Game
class Star {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, 2, 2);
  }
};

class Asteroid {
  constructor(x, y, rotation, accel, size) {
    this.pos = new Vector2(x, y);
    this.rotation = rotation;
    this.size = size;

    this.vel = Vector2.fromAngle(rotation).scale(accel);
  }

  update(dt, canvas) {
    this.pos = this.pos.add(this.vel);

    this.pos.x = wrap(this.pos.x, canvas.width);
    this.pos.y = wrap(this.pos.y, canvas.height);
  }
    
  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.translate(-this.pos.x, -this.pos.y);

    ctx.strokeStyle = "white";
    ctx.lineWidth = this.size / 40;

    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
};


class Bullet {
  constructor(position, rotation) {
    this.pos = position.copy();
    this.direction = Vector2.fromAngle(rotation);
    this.velocity = this.direction.scale(Config.maxAccel * 40);
    this.distanceTraveled = 0;
  }

  update(dt, canvas) {
    this.pos.x += this.velocity.x * dt;
    this.pos.y -= this.velocity.y * dt;

    const delta = this.velocity.scale(dt).magnitude();
    this.distanceTraveled += delta;

    this.pos.x = (this.pos.x + canvas.width) % canvas.width;
    this.pos.y = (this.pos.y + canvas.height) % canvas.height;
  }

  draw(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(this.pos.x, this.pos.y, 3, 3);
  }

  isExpired() {
    return this.distanceTraveled > Config.bulletMaxDistance;
  }
};


class SpaceShip {
  constructor(x, y, rotation, Config) {
    // get some data from config
    this.vel = new Vector2();
    this.friction = Config.ship.friction;
    this.pos = new Vector2(x, y);
    this.rotation = rotation;
    this.size = Config.ship.size;;
    this.maxVel = Config.ship.maxVelocity;
  }

  setRotation(deg) {
    this.rotation += deg;
  }

  setAccel(accel) {
    const a = Vector2.fromAngle(this.rotation);

    this.vel.x += accel * a.x;
    this.vel.y -= accel * a.y;
    
    const mag = this.vel.magnitude();
    if (mag > this.maxVel) {
      this.vel = this.vel.normalize().scale(this.maxVel);
    }
  }

  clearAccel() {
    this.accel = 0;
  }

  update(dt, canvas) {
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    this.pos.x = (this.pos.x + canvas.width) % canvas.width;
    this.pos.y = (this.pos.y + canvas.height) % canvas.height;
  }

  draw(canvas, ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.translate(-this.pos.x, -(this.pos.y));

    ctx.beginPath();

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
    return new Bullet(this.pos, this.rotation);
  }
};


class Game {
  constructor(ctx, canvas, Config) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.config = Config;

    this.isGameOver = false;

    this.stars = [];

    this.accelOn = false;
    this.rotateRight = false;
    this.rotateLeft = false;

    this.accelOn = false;
    this.rotateLeft = false;
    this.rotateRight = false;

    this.bullets = new Set();
    this.asteroids = new Set(); 

    for (var i = 0; i < this.config.starsCount; ++i) {
      this.stars[i] = new Star(randomInt(0, this.canvas.width), randomInt(0, this.canvas.height));
    }

    for (var i = 0; i < this.config.asteroidsCount; ++i) {
      this.asteroids.add(new Asteroid(randomInt(0, canvas.width), randomInt(0, canvas.height), randomInt(0, 360), random(0.08, 1), 50)); 
    }

    console.log(this.asteroids);

    this.ship = new SpaceShip(canvas.width / 2, canvas.height / 2, 0, Config);

    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp": this.accelOn = true; break;
        case "ArrowLeft": this.rotateLeft = true; break;
        case "ArrowRight": this.rotateRight = true; break;
        case " ": this.bullets.add(this.ship.shoot()); break;
      }
    });

    document.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "ArrowUp": this.accelOn = false; break;
        case "ArrowLeft": this.rotateLeft = false; break;
        case "ArrowRight": this.rotateRight = false; break;
      }
    });

  }

  // In handleInput()
  handleInput() {
    if (this.accelOn) this.ship.setAccel(this.config.accel);
    if (this.rotateLeft) this.ship.setRotation(-this.config.rotation);
    if (this.rotateRight) this.ship.setRotation(this.config.rotation);
  }

  cleanupEntities() {
    this.bullets.forEach(b => {
      if (b.isExpired())
        this.bullets.delete(b);
    });
  }

  checkCollisions() {
    // check if ship is colliding with asteroids
    
    this.asteroids.forEach(asteroid => {
      const distance = this.ship.pos.add(asteroid.pos.scale(-1)).magnitude();
      if (distance < this.ship.size + asteroid.size) {
        this.isGameOver = true;
      }
    });

    // Check if bullet is hitting asteroids
    for (const bullet of this.bullets) {
      for (const asteroid of this.asteroids) {

        const distance = bullet.pos.add(asteroid.pos.scale(-1)).magnitude();

        if (distance < asteroid.size) {
          this.bullets.delete(bullet);
          const x = asteroid.pos.x;
          const y = asteroid.pos.y;
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

  update(dt) {
    this.handleInput();
    this.ship.update(dt, this.canvas);
    this.bullets.forEach(b => b.update(dt, this.canvas));
    this.asteroids.forEach(a => a.update(dt, this.canvas));
    this.cleanupEntities();
    this.checkCollisions();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.stars.forEach(s => s.draw(this.ctx));
    this.ship.draw(this.canvas, this.ctx);
    this.bullets.forEach(b => b.draw(this.ctx));
    this.asteroids.forEach(a => a.draw(this.ctx));
  }

  startLoop() {
    // Understand this
    let lastTime = performance.now(); 
    const frame = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      this.update(dt);
      this.render();
      if (!this.isGameOver) {
        requestAnimationFrame(frame);
      }
    }
    requestAnimationFrame(frame);
  }
};


// Main
document.addEventListener("DOMContentLoaded", (event) => { 
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");
  const game = new Game(ctx, canvas, Config);

  game.startLoop();
})

