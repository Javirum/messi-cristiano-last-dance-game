"use strict";

function Game(ctx, canvas, callback) {
  this.ctx = ctx;
  this.size = {
    width: canvas.width,
    height: canvas.height
  };
	this.player1 = null;
	this.player2 = null;
  this.ball = null;
  this.score = 0;
  this.callback = callback;
  this.isEnded = false;
  this.winner = null;
	this.start();
	this.ballSpeed = 5;
}

Game.prototype.checkIfEnded = function () {
	var self = this;
		
  if (self.player1.score === 3) {
    self.isEnded = true;
    this.callback('player1');
	} else if (self.player2.score === 3) { 
		this.callback('player2')
	}
}

Game.prototype.clearCanvas = function() {
  var self = this;
  self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
  self.ctx.fillRect();
};

Game.prototype.draw = function() {
  var self = this;
  self.player1.draw();
  self.player2.draw();
  self.ball.draw();
};

Game.prototype.start = function() {
	var self = this;
	this.player1 = new Player(this.ctx, 150, 180, 20, 50, "left");
	this.player2 = new Player(this.ctx, 520, 180, 30, 50, "right");
	this.ball = new Ball(this.ctx, canvas.width, canvas.height);
  // self.player = new Player(self.canvasCTX);
  self.doFrame();
};

Game.prototype.doFrame = function() {
  var self = this;
	self.ctx.clearRect(0, 0, canvas.width, canvas.height);
	self.checkPlayersBounds();
	// Check Ball Bounds -> Ball vs canvas
	self.checkBallBounds();
	// self.detectBallColission();
	// Check Players Ball Collision -> Player vs ball
	self.draw();
	// self.ctx.drawImage(self.image, self.positionX, self.positionY)
	// self.ball.moveball();
	self.checkPlayerBallColission();
  self.checkIfEnded();
  this.update();

  window.requestAnimationFrame(function() {
    if (!self.isEnded) {
      self.doFrame();
    }
  });
};

// Game.prototype.checkCollisions = function () {
	
// 		var p1_ball_distance = getDistance(player1.positionX, player1.positionY, ball.positionX, ball.positionY) - player1.radius - ball.radius;
// 		if (p1_ball_distance < 0) {
// 			collide (ball, player1);
// 		}
// 		var p2_ball_distance = getDistance(player2.positionX, player2.positionY, ball.positionX, ball.positionY) - player2.radius - ball.radius;
// 		if (p2_ball_distance < 0) {
// 			collide (ball, player2);
// 		}
// 	}
	
	// function getDistance(x1,y1,x2,y2){
	// 	return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
	// }
	
	Game.prototype.checkPlayersBounds = function() {
		if(this.player1.positionX + this.player1.radius > canvas.width){
			this.player1.positionX = canvas.width - this.player1.radius;
			this.player1.positionX -= 1;
		}

		if(this.player1.positionX - this.player1.radius < 0){
			this.player1.positionX = 0 + this.player1.radius;
			this.player1.positionX += 1;
		}

		if(this.player1.positionY + this.player1.radius > canvas.height){
			this.player1.positionY = canvas.height - this.player1.radius;
			this.player1.positionY -= 1;
		}

		if(this.player1.positionY - this.player1.radius < 0){
			this.player1.positionY = 0 + this.player1.radius;
			this.player1.positionY += 1;
		}

		if(this.player2.positionX + this.player2.radius > canvas.width){
			this.player2.positionX = canvas.width - this.player2.radius;
			this.player2.positionX -= 1;
		}
		if(this.player2.positionX - this.player2.radius < 0){
			this.player2.positionX = 0 + this.player2.radius;
			this.player2.positionX += 1;
		}
		if(this.player2.positionY + this.player2.radius > canvas.height){
			this.player2.positionY = canvas.height - this.player2.radius;
			this.player2.positionY -= 1;
		}
		if(this.player2.positionY - this.player2.radius < 0){
			this.player2.positionY = 0 + this.player2.radius;
			this.player2.positionY += 1;
		}
	}

	Game.prototype.checkBallBounds= function() {

	if (this.ball.positionX + this.ball.radius > canvas.width) {
		// if (this.ball.positionY > 20 && this.ball.positionY < canvas.height - 20) {
		this.player1.score ++;
		this.reset();
		// this.ball.positionX = canvas.width - this.ball.radius;
		// this.ball.speedX = -this.ball.speedX; 
	}

	if (this.ball.positionX - this.ball.radius < 0) {
		this.player2.score ++;
		this.reset();
		// this.ball.positionX = 0 + this.ball.radius;
		// this.ball.speedX = -this.ball.speedX;
	}

	if (this.ball.positionY + this.ball.radius > canvas.height){
		this.ball.positionY = canvas.height - this.ball.radius;
		this.ball.speedY = -this.ball.speedY;
	}

	if (this.ball.positionY - this.ball.radius < 0) {
		this.ball.positionY = 0 + this.player1.radius;
		this.ball.speedY = -this.ball.speedY;
	}
	 }

	Game.prototype.checkPlayerBallColission= function () {
			var self = this;
		var player1LeftEdge = self.player1.positionX - self.player1.radius;
		var player1RightEdge = self.player1.positionX + self.player1.radius;
		var player1TopEdge = self.player1.positionY - self.player1.radius;
		var player1BottomEdge = self.player1.positionY + self.player1.radius;

		var player2LeftEdge = self.player2.positionX - self.player2.radius;;
		var player2RightEdge = self.player2.positionX + self.player2.radius;
		var player2TopEdge = self.player2.positionY - self.player1.radius;;
		var player2BottomEdge = self.player2.positionY + self.player2.radius;

		var ballLeftEdge = self.ball.positionX - self.ball.radius;
		var ballRightEdge = self.ball.positionX + self.ball.radius;
		var ballTopEdge = self.ball.positionY - self.ball.radius;
		var ballBottomEdge = self.ball.positionY + self.ball.radius;

		if (player1LeftEdge <= ballLeftEdge && ballLeftEdge <= player1RightEdge) {
			console.log('l')
			if (player1TopEdge <= ballTopEdge && ballTopEdge <= player1BottomEdge) {
				console.log('collision lt')
				self.ball.speedY = self.ballSpeed
				self.ball.speedX = self.ballSpeed
			} else if (player1TopEdge <= ballBottomEdge && ballBottomEdge <= player1BottomEdge) {
				console.log('collision lb')
				self.ball.speedY = -self.ballSpeed
				self.ball.speedX = self.ballSpeed
			}
		}
		
		else if (player1LeftEdge <= ballRightEdge && ballRightEdge <= player1RightEdge) {
			console.log('r')
			if (player1TopEdge <= ballTopEdge && ballTopEdge <= player1BottomEdge) {
				console.log('collision rt')
				self.ball.speedY = self.ballSpeed
				self.ball.speedX = -self.ballSpeed
			} else if (player1TopEdge <= ballBottomEdge && ballBottomEdge <= player1BottomEdge) {
					console.log('collision rb')
					self.ball.speedY = -self.ballSpeed
					self.ball.speedX = -self.ballSpeed
			}
		}

		if (player2LeftEdge <= ballLeftEdge && ballLeftEdge <= player2RightEdge) {
			console.log('l')
			if (player2TopEdge <= ballTopEdge && ballTopEdge <= player2BottomEdge) {
				console.log('collision lt')
				self.ball.speedY = self.ballSpeed
				self.ball.speedX = self.ballSpeed
			} else if (player2TopEdge <= ballBottomEdge && ballBottomEdge <= player2BottomEdge) {
				console.log('collision lb')
				self.ball.speedY = -self.ballSpeed
				self.ball.speedX = -self.ballSpeed
			}
		}
		
		else if (player2LeftEdge <= ballRightEdge && ballRightEdge <= player2RightEdge) {
			console.log('r')
			if (player2TopEdge <= ballTopEdge && ballTopEdge <= player2BottomEdge) {
				console.log('collision rt')
				self.ball.speedY = self.ballSpeed
				self.ball.speedX = -self.ballSpeed
			} else if (player2TopEdge <= ballBottomEdge && ballBottomEdge <= player2BottomEdge) {
					console.log('collision rb')
					self.ball.speedY = -self.ballSpeed
					self.ball.speedX = -self.ballSpeed
			}
		}

		

		}

	function collide (cir1, cir2) {
		var dx = (cir1.positionX - cir2.positionX) / (cir1.radius);
		var dy = (cir1.positionY - cir2.positionY) / (cir1.radius);
		cir2.speed = -dx;
		cir2.speed = -dy;
		cir1.speed = dx;
		cir1.speed = dy;
	}

	function getDistance(x1,y1,x2,y2){
		return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
	}

	Game.prototype.update = function () {
		var self = this;
		self.ball.move();
}

// Game.prototype.score = function () {
// 	if (this.ball.positionX + this.ball.radius <= 0) {
// 		// if (this.ball > 150 && this.ball < 350) {
// 		console.log('GOOOOOOOOOL')
// 		this.player2.score++
// 		reset();
// 	} 
// 	if (this.ball.positionX + this.ball.radius >= canvas.width) {
// 		// if (this.ball > 150 && this.ball < 350) {
// 		console.log('GOOOOOOOOOL')
// 		this.player1.score++
// 		reset();
// 	} 
// }



Game.prototype.reset = function () {
	
		this.player1.reset();
		this.player2.reset();
		this.ball.reset();
}

// Game.prototype.win = function () {
// 	if (player1.score === 3) {
// 		endGame();
// 	} 
	
// 	if (player2.score === 3) {
// 		endGame();
// }

		
	

// Game.prototype.handlelKeyUp = function() {

// }