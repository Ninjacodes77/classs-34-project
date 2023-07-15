var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Events = Matter.Events;

var engine;
var world;
var ground;
var box;
var balls = [];
var score = 0;
var ballInterval = 2000; // Time interval between ball appearances in milliseconds
var lastBallTime = 0;

function setup() {
  var canvas = createCanvas(800, 600);
  engine = Engine.create();
  world = engine.world;

  // Create invisible boundary walls
  var wallOptions = {
    isStatic: true,
    render: {
      visible: false
    }
  };
  var leftWall = Bodies.rectangle(0, height / 2, 10, height, wallOptions);
  var rightWall = Bodies.rectangle(width, height / 2, 10, height, wallOptions);
  var topWall = Bodies.rectangle(width / 2, 0, width, 10, wallOptions);
  var bottomWall = Bodies.rectangle(width / 2, height, width, 10, wallOptions);

  World.add(world, [leftWall, rightWall, topWall, bottomWall]);

  // Create the ground
  var groundOptions = {
    isStatic: true
  };
  ground = Bodies.rectangle(width / 2, height - 10, width, 20, groundOptions);
  World.add(world, ground);

  // Create a box
  var boxOptions = {
    restitution: 0.5
  };
  box = Bodies.rectangle(width / 2, 200, 80, 80, boxOptions);
  World.add(world, box);

  // Register collision event
  Events.on(engine, 'collisionStart', collision);

  Engine.run(engine);
}

function draw() {
  background(220);
  rectMode(CENTER);

  // Draw the ground
  fill(128);
  rect(ground.position.x, ground.position.y, width, 20);

  // Draw the box
  fill(255);
  rect(box.position.x, box.position.y, 80, 80);

  // Create new balls at intervals
  if (millis() - lastBallTime > ballInterval) {
    var ballOptions = {
      restitution: 0.8
    };
    var ball = Bodies.circle(random(width), 0, 30, ballOptions);
    World.add(world, ball);
    balls.push(ball);
    lastBallTime = millis();
  }

  // Update and draw the balls
  for (var i = balls.length - 1; i >= 0; i--) {
    var ball = balls[i];
    fill(255, 0, 0);
    ellipse(ball.position.x, ball.position.y, 60, 60);

    // Check if ball touches the ground
    if (ball.position.y > height) {
      World.remove(world, ball);
      balls.splice(i, 1);
      score--;
    }
  }

  // Display the score
  fill(0);
  textSize(20);
  text("Score: " + score, 20, 30);
}

function collision(event) {
  var pairs = event.pairs;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    if (pair.bodyA === box || pair.bodyB === box) {
      var ball = pair.bodyA === box ? pair.bodyB : pair.bodyA;
      if (balls.includes(ball)) {
        World.remove(world, ball);
        balls.splice(balls.indexOf(ball), 1);
        score++;
      }
    } else if (
      (pair.bodyA === ground && balls.includes(pair.bodyB)) ||
      (pair.bodyB === ground && balls.includes(pair.bodyA))
    ) {
      score--;
    }
  }
}

function keyPressed() {
  // Move the box with arrow keys
  var force = { x: 0, y: 0 };
  if (keyCode === LEFT_ARROW) {
    force.x = -0.05;
  } else if (keyCode === RIGHT_ARROW) {
    force.x = 0.05;
  } else if (keyCode === UP_ARROW) {
    force.y = -0.05;
  } else if (keyCode === DOWN_ARROW) {
    force.y = 0.05;
  }
  Matter.Body.applyForce(box, box.position, force);
}
