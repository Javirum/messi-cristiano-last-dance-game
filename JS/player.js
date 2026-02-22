"use strict";

function Player(
  ctx,
  positionX,
  positionY,
  initialPositionX,
  initialPositionY,
  side
) {
  this.ctx = ctx;
  this.positionX = positionX;
  this.positionY = positionY;
  this.initialPositionX = positionX;
  this.initialPositionY = positionY;
  this.radius = 20;
  this.arcStartAngle = 0;
  this.speed = 25;
  this.score = 0;
  this.side = side;

//   this.image = new Image;
//   this.image.src = '../images/messi-canvas.png';

//   this.image = new Image;
//   this.image.src = '../images/Cristiano-Ronaldo-PNG-HD.png';
}

Player.prototype.draw = function() {
  var self = this;
  if (self.side === 'left') {
    self.ctx.drawImage(self.getImages('images/cristiano.png'), self.positionX -10, self.positionY - 50, 50, 80);
  } else {
    self.ctx.drawImage(self.getImages('images/messi.png'), self.positionX - 10, self.positionY -55, 50, 80);
  }  
  self.ctx.beginPath();
//   self.ctx.arc(self.positionX, self.positionY, self.radius, self.arcStartAngle, 2 * Math.PI);
  // self.ctx.fillRect(self.positionX - self.radius, self.positionY - self.radius, self.radius * 2, self.radius * 2);
  self.ctx.fill();
  self.ctx.closePath();

};

Player.prototype.getImages = function (filepath) {
    var self = this;
    var img = new Image();
    img.src = filepath;
    return img;
}

// Player.prototype.playerImage = function () {
//     var self = this;
//     if (self.ctx.side === 'left') {
//         self.ctx.drawImage(cristiano, 33, 71, 104, 124, 21, 20, 87, 104);
//     } else {self.ctx.drawImage(messi, 20, 20)};
// }


Player.prototype.moveUp = function() {
  var self = this;
  self.positionY -= self.speed;
};

Player.prototype.moveDown = function() {
  var self = this;
  self.positionY += self.speed;
};

Player.prototype.moveRight = function() {
  var self = this;
  self.positionX += self.speed;
};

Player.prototype.moveLeft = function() {
  var self = this;
  self.positionX -= self.speed;
};

Player.prototype.drawScore = function() {
  var self = this;
  self.font = "16px Verdana";
  self.fillText(self.score, 10, 50);
};

Player.prototype.reset = function() {
    this.positionX = this.initialPositionX;
    this.positionY = this.initialPositionY;
};
