'use strict'

function Ball (ctx) {
    this.ctx = ctx;
    this.positionX = canvas.width / 2;
    this.positionY = canvas.height / 2;
    this.radius = 10;
    this.arcStartAngle = 0,
    this.speedX = 0;
    this.speedY = 0;
    this.decel = 0.1;
}

Ball.prototype.draw = function () {
    var self = this;
    // self.ctx.clearRect(0, 0, canvas.width, canvas.height);
    self.ctx.drawImage(self.getBall('images/ball.png'), self.positionX -10, self.positionY - 7, 20, 20);
    // self.ctx.fillRect (self.position.x, self.position.y, self.size.width, self.size.height);
    self.ctx.beginPath();
    // self.ctx.arc(self.positionX, self.positionY, self.radius, self.arcStartAngle, 2 * Math.PI);
    self.ctx.fill();
    self.ctx.closePath();
  };

  Ball.prototype.getBall = function (filepath) {
    var self = this;
    var img = new Image();
    img.src = filepath;
    return img;
}   

// Ball.prototype.move = function() {
//     var self = this;
//     if (self.speedX > 0) {
//         self.speedX * -0.5;
//         self.speedY * -0.5;
//         self.positionY += self.speedY;
//         self.positionX += self.speedX;
//     }
   
// }

// Ball bounce

Ball.prototype.move = function () {
    
    var self = this;
	if (self.speedX !== 0) {
		if (self.speedX > 0) {
			self.speedX -= self.decel;
			if (self.speedX < 0) self.speedX = 0;
		} else {
			self.speedX += self.decel;
			if (self.speedX > 0) self.speedX = 0;
		}
	}
    
    if (self.speedY !== 0) {
        
        if(self.speedY > 0) {
			self.speedY -= self.decel;
			if (self.speedY < 0) self.speedY = 0;
		} else {
			self.speedY += self.decel;
			if(self.speedY > 0) self.speedY = 0;
		}
	}
	self.positionX += self.speedX;
	self.positionY += self.speedY;
}

Ball.prototype.reset = function() {
    this.positionX = canvas.width / 2;
    this.positionY = canvas.height / 2;
    this.speedX = 0;
    this.speedY = 0;
};

// Ball.prototype.score = function () {    
//     var self = this;
//     if (self.positionX + self.radius <= 0) {
//     console.log('touch left side')
//     if(self.positionY > 150 && self.positionY < 350) {
//     player1.score++;
//     reset();
//     return;
// }
// }

// ball.x = canvas.width - ball.size;
// ball.xVel *= -1.5;
// }

// if(self.positionX - self.radius < 0) {
// if(self.positionY > 150 && self.positionY < 350){
//     player2.score++;
//     reset();
    
// }
// }
