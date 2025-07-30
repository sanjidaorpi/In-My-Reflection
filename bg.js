//ripple effect
let circleX;
let circleY;
let circleSize;
let a = 255

// ripple vars   
circleX = 10;
circleY = 10;
circleSize = 0;

//ripples array
let ripples = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  stroke(255);
}

function draw() {
  clear();
  noFill();
  // random ripple effect
  if (frameCount % 30 === 0) {
    let randomX = random(width);
    let randomY = random(height);
    ripples.push(new Ripple(randomX, randomY));
  }
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    ripples[i].display();
    if (!ripples[i].isVisible()) {
      ripples.splice(i, 1);
    }
  }
}

class Ripple {

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 0;
    this.alpha = 255;
  }

  update() {
    this.size += 2;
    this.alpha -= 5;
  }

  display() {
    noFill();
    stroke(93, 178, 252, this.alpha);
    strokeWeight(1.5);
    circle(this.x, this.y, this.size); // Big circle
    circle(this.x, this.y, this.size * 0.75); // Medium circle
    circle(this.x, this.y, this.size * 0.5); // Small circle
  }

  isVisible() {
    return this.alpha > 0;
  }
  
}
