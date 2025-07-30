
// Program state
let program_state = false;
let complete = false;

//Questions
let questionIndex = 0;
let questions = ['What would inner peace look like for you?','How have you grown as a person?', 'What are you taking for granted in your life?', 
                'How can you live in a way that is more true to yourself?', ' '];

// Last page message

// Answer collection
let answers = [];
let currQuestion = questions[questionIndex];
let lineX, lineY;
let earDist = 0;

// Font and settings for text (question and answers)
let font;
let points = [];
let r = 3;
let angle = 0;
let questionDisplayed = false;
let capture;
let textOffset = 0;
const xSpeed = 8;
const ySpeed = 0.085;
const amplitude = 10;
const letterSpacing = 10;
let questionX;

// Answers
const textScrollSpeed = 1;
const textWaveSpeed = 0.08;
const textAmplitude = 10;
const textLetterSpacing = 10;
let textPositionX = 50;
let textTotalLength = 0;
let scrollingText = 'ooooooooooooooooooooooooooooooo';

let letterY = 0;
let incr = -1

// Body pose
let pose;
let poses = [];
let faceXFound = false;
//ripple effect
let circleX;
let circleY;
let circleSize;
let a = 255

let move1 = 20
let move2 = 50 
let move3 = 100
let move1Speed = 1.3
let move2Speed = 1.7
let move3Speed = 1.5

// Ripples array
let ripples = [];

//start button
let startButton;
let startPixels;
let saveButton;

// Audio recognition
let speak_mode = false;
let spoken;
let recognizedText= "";

// Sound fx
let music;
let cam_sound;

// Body Segmentation: https://editor.p5js.org/MOQN/sketches/fJOjbzZNi
let segmenter;
let segmentationData = [];
let bodyBuffer;

// Images
let mic_off, mic_on, micX, micY;
let prevX, prevY;
let next, nextX, nextY;
let centerX, centerY;

let projFont;
// -------- preload the assetss ----------
function preload() {
  music = loadSound('./audio/music.mp3');
  cam_sound = loadSound('./audio/cam_sound.mp3');
  bodyPose = ml5.bodyPose({flipped: true});
  font = loadFont('./fonts/inconsolata.ttf');
  mic_off = loadImage('./images/mic_off.png');
  mic_on = loadImage('./images/mic_on.png');
  prev = loadImage('./images/prev.png');
  next = loadImage('./images/next.png');
  projFont = loadFont('fonts/LilitaOne-Regular.ttf')
}
// --------- setup function -----------
function setup() {
  var cnv = createCanvas(840, 580);
  cnv.style('display', 'block');
  cnv.parent('canvas-container');
  imageMode(CENTER);
  textAlign(LEFT);

  textFont(projFont)

  // For textWave drawing answers
  textTotalLength = textWidth(scrollingText) + textLetterSpacing * (scrollingText.length - 1);

  // Button UI
  micX = (width / 2) - 35;
  micY = height - 25;
  prevX = 70;
  prevY = height - 25;
  nextX = (width / 2) + 35;
  nextY = height - 25;

  // ripple vars   
  circleX = 10;
  circleY = 10;
  circleSize = 0;

  move1Speed = random(1,2)
  move2Speed = random(1,2)
  move3Speed = random(1,2)

  // start button
  startButton = createButton('  START  ');
  startButton.parent('canvas-container'); 
  startButton.position(windowWidth / 2-55, height / 2+80); 
  startButton.mousePressed(() => {
    program_state = true; 
    startButton.hide(); 
  });

  // Text
  questionX = width + 10;
  answerX = width;
  // Capturing capture for pixelated
  capture = createCapture(VIDEO, { flipped: true});
  // Mask capture
  cam = createCapture(VIDEO, { flipped: true}, camReady);

  startPixels = createGraphics(width, height);
  
  // Make capture pixelated, use this to control how pixelated capture should be
  capture.size(138, 140);
  cam.size(640, 640);
  capture.hide();
  cam.hide();

  bodyPose.detectStart(capture, gotPoses);
  noStroke();
  centerX = cam.width / 2;
  centerY = cam.height / 2;

  spoken = new p5.SpeechRec('en-US', showResult);
  spoken.onResult = showResult;

for (let i = 0; i < 5; i++) {
  answers.push(scrollingText); // Default dots for each question
}


  // Sound fx
  // if (isLoaded(music)) {
  //   music.loop();
  // }
}


// callback helper function
function gotPoses(results) {
  poses = results;
}

//  ---------- draw function -------
function draw() {
background(173, 223, 247);
  noStroke();



  // --------- project in progress ------------
  if (program_state == true) {
    // allows the capture to be pixelated
    capture.loadPixels();
    getSegmentation();
    
      // --------- pixelated background ------------
    // get the size of the pixels to draw
    let pixelSizeX = width / capture.width;
    let pixelSizeY = height / capture.height;

    // get the colors for each pixel referenced from the Coding Train : https://www.youtube.com/watch?v=55iwMYv8tGI 
    for (let i = 0; i < capture.width; i++) {
      for (let j = 0; j < capture.height; j++) {
        let pixelIndex = (i + j * capture.width) * 4;
        let r = capture.pixels[pixelIndex + 0];
        let g = capture.pixels[pixelIndex + 1];
        let b = capture.pixels[pixelIndex + 2];

        // oscillation for rippling effect along y-axis: https://p5js.org/reference/p5/sin/
        let osc = 1.5 * sin(i * 0.3 + frameCount * 0.2);

        // make fill color blue
        fill(r, g+25, b+120);

        // make each pixel an ellipse
        rect(i * pixelSizeX, j * pixelSizeY + osc, pixelSizeX, pixelSizeY);
      }
    }

    // Body segmentation and body pose
    noStroke();
    textSize(15);
    let gridSize = 4;
    faceXFound = false;

    // --------- body segmentation ------------
    if (poses.length > 0) {
      let leftEarX = poses[0].left_ear.x * (width / capture.width);
      let leftEarY = poses[0].left_ear.y * (height / capture.height);
      let rightEarX = poses[0].right_ear.x * (width / capture.width);
      let rightEarY = poses[0].right_ear.y * (height / capture.height);
      earDist = rightEarX - leftEarX;
      // fill(0, 0, 0);
      // ellipse(rightEarX, rightEarY, 10, 10);
      // ellipse(leftEarX, leftEarY, 10, 10);
      lineX = leftEarX;
      earDist = rightEarX - leftEarX;
      faceXFound = true;
  }
    
    push();
    translate(width-10, -10); // Move to the right edge
    scale(-1.3, 1.3); // Flip horizontally
    // masked background
    for (let y = 0; y < cam.height; y += gridSize) {
      for (let x = 0; x < cam.width; x += gridSize) {
        let index = (x + y * cam.width) * 4;

        if (segmentationData[index] < 245) {
          let distance = dist(x, y, centerX, centerY);
          let alpha1 = map(distance, 0, centerX, 0, 150); // map to 50
          let alpha2 = map(distance, centerX, width, 150, 0); // map to 50
          fill(144, 213, 255, (alpha1 + alpha2 )/2);
          //ellipse(x, y, 8);
          rectMode(CENTER);
          rect(x, y, pixelSizeX, pixelSizeY);
        }
      }
    }
    pop();

    // ---------- reflection complete -----------
    if (complete) {

      showButton();
    }
  } else {
     
    // ------------ Start screen ---------------
    for (var x = 0; x < width; x += width / 138) {
      for (var y = 0; y < height; y += height / 140) {
        stroke(144, 213, 255);
        strokeWeight(0.5);
        line(x, 0, x, height);
        line(0, y, width, y);
      }
	  }
    fill(16, 58, 87);
    textSize(40)  
    text("In", move1,200)
    text("My", move2,300)
    text("Reflection", move3,400)

    move1 +=  move1Speed;
    move2 += move2Speed;
    move3 += move3Speed;

    if (move1 > width +20){
      move1 = random(-50,-20) 
      move1Speed = random(1,2)

    }
    if (move2 > width +20){
      move2 = random(-50,-20) 
      move2Speed = random(1,2)      
    }
    if (move3 > width +20){
      move3 = random(-100,-50) 
      move3Speed = random(1,2)
    }

  }

    // Random ripple effect
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
  

  // ------------------- Answers Text Wrap Around---------------
  angleMode(RADIANS);
  textSize(20);
  fill(16, 58, 87);

  // Determine which text to display
  if (complete) {
    // When complete, display all answers dynamically
    for (let i = 1; i < answers.length; i++) {
      scrollingText = answers[i]
      textTotalLength = textWidth(scrollingText) + textLetterSpacing * (scrollingText.length);
      let letterY = (i) * 100; // Fixed line spacing

      drawCompleteText(textPositionX + 50, letterY);
      drawCompleteText(textPositionX - textTotalLength + 50, letterY);
    }
  } else {
    // Before complete, display the current question's answer dynamically
    for (let i = 0; i < 5; i++) {
      textTotalLength = textWidth(scrollingText) + textLetterSpacing * (scrollingText.length);
      let letterY = (i + 1) * 100; // Fixed line spacing

      drawScrollingText(textPositionX, letterY);
      drawScrollingText(textPositionX - textTotalLength, letterY);
    }
  }

  textPositionX += textScrollSpeed;
  if (textPositionX > textTotalLength) {
    textPositionX = 0;
  }

  textSize(30);
  fill(0);
  noStroke();

  // ----------- Borders and buttons ------------
  fill(255);
  noStroke();
  rect(0, 0, 50, height);
  rect(width - 50, 0, width, height);
  rect(0, 0, width, 50);
  rect(0, height - 50, width, height);

  if (complete){
    fill(0)
    textSize(30)
    let date = new Date();
    date = date.toDateString().slice(4);
    text( 'M y   R e f l e c t i o n ', 280, 40);
    textSize(15);
    text(date, width - textWidth(date) - 15, 35);
    fill(255)
    rect(0, height - 50, width, height);
  }

  // Only show buttons and question if started or not done
    if (program_state == true && !complete) {
      image(next, nextX, nextY, 12, 12);
      if (speak_mode == false) {
      image(mic_off, micX, micY, 20, 20);
    } else if (!complete) {
      image(mic_on, micX, micY, 20, 20);
    }

    noFill();
    strokeWeight(1.5);
    stroke(0);
    ellipse(micX, micY, 30, 30);
    ellipse(nextX - 1.5, nextY, 30, 30);

    // Question display animation
    textSize(30);
    fill(0);
    noStroke();

    let currentX = questionX;
    let question_length = 0;
    
    // --------- display questions ------------
    // console.log( currQuestion)
    for (let i = 0; i < currQuestion.length; i++) {
      const letter = currQuestion[i];
      const letter_width = textWidth(letter);
      let extra_space = 0;
      if (letter == 'i' || letter === 'l' || letter === 'I' || letter === 'L') {
        extra_space = 4
      }
      const letter_offset = i * letterSpacing;
      question_length += extra_space + letter_width + letterSpacing;
      const letterY = 35 + sin((frameCount - letter_offset) * ySpeed) * amplitude;
      text(letter, currentX, letterY);
      currentX += letter_width + letterSpacing + extra_space;
    }

    questionX -= xSpeed;
    if (questionX < -question_length) {
      questionX = width + 10;
    }
  }

}


// --------- answers text ------------
function drawScrollingText(startX, letterY) {
  let currentX = startX;
  let space_made = false;
  for (let i = 0; i < scrollingText.length; i++) {
    let letter = scrollingText[i];
    const letterOffset = i * textLetterSpacing;
    let letterWidth = textWidth(letter);
    const currentY = 35 + sin((frameCount - letterOffset) * textWaveSpeed) * textAmplitude + letterY;
    if (faceXFound && currentX >= lineX && !space_made) {
      currentX += earDist;
      space_made = true;
    }
    
    text(letter, currentX, currentY);
    currentX += letterWidth + textLetterSpacing;
  }
}

function drawCompleteText(startX, letterY){
  let currentX = startX;
  for (let i = 0; i < scrollingText.length; i++) {
    let letter = scrollingText[i];
    const letterOffset = i * textLetterSpacing;
    let letterWidth = textWidth(letter);
    const currentY = 35 + sin((frameCount - letterOffset) * textWaveSpeed) * textAmplitude + letterY;
    text(letter, currentX, currentY);
    currentX += letterWidth + textLetterSpacing;
  }
}

// --------- change question functions  ------------

function nextQuestion() {
  if (questionIndex < questions.length-1) {
    questionX = width + 10;
      questionIndex += 1; 
      currQuestion = questions[questionIndex];
  } else {
    questionX = width + 10;
    complete = true; 
  }
}

// --------- moused pressed funtion -----------------
function mousePressed() {
  // create ripples when mouse pressed
  ripples.push(new Ripple(mouseX, mouseY));

  // mic and next "buttons"
  if (dist(mouseX, mouseY, prevX, prevY) < 20) {
    speak_mode = false;
  }

  if ((dist(mouseX, mouseY, nextX, nextY) < 20)) {
    speak_mode = false;
    nextQuestion();
  }

  if (dist(mouseX, mouseY, micX, micY) < 20) {
    speak_mode = !speak_mode;
    if (speak_mode) {
      music.pause();
      spoken.start();
      showResult()
    } else {
     //if (isLoaded(music)) {
        music.play();
      //}
      spoken.stop();
    }
  }

  let rectX = width / 2;
  let rectY = height / 2;
  let rectWidth = 80;
  let rectHeight = 50;

  if (mouseX >= rectX && mouseX <= rectX + rectWidth &&
    mouseY >= rectY && mouseY <= rectY + rectHeight ) { 
    program_state = true;
  }
}

// ---------- get the spoken text -------------
function showResult() {
  recognizedText = spoken.resultString; 
  // console.log("Recognized Text:", recognizedText);

  if (speak_mode) {
    const tempText = recognizedText; 
    answers[questionIndex] = tempText; 
  } else {
    scrollingText = recognizedText;
  }
  
  textTotalLength = textWidth(scrollingText) + textLetterSpacing * (scrollingText.length);
    // console.log("Answers:", answers);

}



// -------- ripple object ----------------
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


// ---------- Save canvas ------------

function showButton() {
  fill(0);
  saveButton = createButton('Save');
  saveButton.position(width+(width/2), height+12); 
  saveButton.mousePressed(() => {
    saveButton.hide(); 
    cam_sound.play();
    saveCanvas();
  });
}
function saveCanvas(){
  save('myReflection', 'png');
}


// --------------------------- Body Segmentation functions: https://editor.p5js.org/MOQN/sketches/fJOjbzZNi -----

function camReady() {
  console.log("Webcam Ready!");
  loadBodySegmentationModel();
}

async function loadBodySegmentationModel() {
  const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
  const segmenterConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation'
    // or 'base/node_modules/@mediapipe/selfie_segmentation' in npm.
  };
  segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
  console.log("Model Loaded!");
}

async function getSegmentation() {
  if (segmenter == undefined) return;

  const segmentationConfig = {
    flipHorizontal: false
  };
  const segmentation = await segmenter.segmentPeople(cam.elt, segmentationConfig);

  if (segmentation.length > 0) {
    let result = await segmentation[0].mask.toImageData();
    segmentationData = result.data;
  }
}

