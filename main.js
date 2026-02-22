'use strict'

var middle = document.getElementById("middle-bun");
var icon = document.getElementById("complete-icon");
var menu = document.querySelector(".menu-list");


var deleteMiddle = function() {
    middle.classList.toggle("hidden-bun");
    updateTransition();
    menuTransition();
}

icon.addEventListener('click', deleteMiddle);
    
function updateTransition() {
    var top = document.querySelector("div.top-burguer");
    var bottom = document.querySelector("div.bottom-burguer");
    top.classList.toggle("rotate-top") 
    bottom.classList.toggle("rotate-bottom");
  }

function displayMenu() {
    menu.classList.toggle("menu-hidden");
}  

icon.addEventListener('click', displayMenu);

function menuTransition() {
    menu.classList.toggle("slide-menu");
}

icon.addEventListener('click', menuTransition);

function createHtml(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div.children[0];
  } 


// // Canvas //
 
    var container;
    

function main () {
    var container;
    var button;
    var instructions;
    var gameHistory;
    var contact;
    var canvas;
    var canvasSize = {
        width: 686,
        height: 343
    }
    var coverImg;
    var header;
    var game = null;
    var cristiano = document.getElementById('cristiano');
    var backButton;
    var instructionsHeader;
    var listInstructions;
    var gameHistory;
    var contact;
    var player1Inst;
    var player1Commands;
    var player2Commands;
    var player2Inst;
    var instructionsContainer;
    var stadiumImg;
    var messiWins;
    var cristianoWins;
    var mBackButton;
    var cBackButton;
    var cristiano;
    var messi;
    var cristianoImg;
    var messiImg;
    var stadium;
    var score;
    var scoreC;
    var scoreM;
    var golC;
    var golM;
    
   

    function buildSplash () {
        container = document.getElementById('game-container')
        button = document.createElement('button');
        button.setAttribute('id', 'btn-start');
        button.innerText = 'Kick Off!'
        container.appendChild(button);
        button.addEventListener('click', handleStartClick);
        instructions = document.getElementById('instructions')
        instructions.addEventListener('click', handleInstructionsClick);
        // gameHistory = document.getElementById('id','game-history');
        // gameHistory.addEventListener('click', handleHistoryClick);
        // contact = document.getElementById('id', 'contact');
        // contact.addEventListener('click', handleContactClick)
    }

    // Destroys Splash Screen 

    function handleStartClick() {
        coverImg = document.getElementById('messiCristiano');
        header = document.getElementById('title');
        button.removeEventListener('click', handleStartClick);
        button.remove();
        coverImg.remove();
        header.remove();
        buildGame();
    }

    function handleInstructionsClick() {
        coverImg = document.getElementById('messiCristiano');
        header = document.getElementById('title');
        button.removeEventListener('click', handleStartClick);
        instructions.removeEventListener('click', handleInstructionsClick);
        button.remove();
        coverImg.remove();
        header.remove();
        instructionsPage();
    }

    function instructionsPage() {
        // InstImg = document.backgroundImage = "url (/images)";
        backButton = document.createElement('button');
        backButton.setAttribute('id', 'back-button');
        backButton.innerText = 'Back';
        container.appendChild(backButton);
        backButton.addEventListener('click', buildSplash);
        instructionsHeader = document.createElement('h1');
        instructionsHeader.innerText = 'Instructions';
        container.appendChild(instructionsHeader);

        instructionsContainer = document.createElement('div');
        instructionsContainer.setAttribute('id', 'inst-container');
        instructionsHeader.appendChild(instructionsContainer);
       
        player1Inst = document.createElement('ul');
        player1Inst.setAttribute('id', 'instructions-list');
        player1Inst.innerText = 'Plaver 1:';
        instructionsContainer.appendChild(player1Inst);
        player1Commands = document.createElement('li');
        player1Commands.setAttribute('class', 'player1-instructions-list');
        player1Commands.innerText = 'Move up: W';
        player1Inst.appendChild(player1Commands);
        player1Commands = document.createElement('li');
        player1Commands.setAttribute('class', 'player1-instructions-list');
        player1Commands.innerText = 'Move down: S';
        player1Inst.appendChild(player1Commands);
        player1Commands = document.createElement('li');
        player1Commands.setAttribute('class', 'player1-instructions-list');
        player1Commands.innerText = 'Move left: A';
        player1Inst.appendChild(player1Commands);
        player1Commands = document.createElement('li');
        player1Commands.setAttribute('class', 'player1-instructions-list');
        player1Commands.innerText = 'Move right: D';
        player1Inst.appendChild(player1Commands);
       
        player2Inst = document.createElement('ul');
        player2Inst.setAttribute('id', 'instructions-list-2');
        player2Inst.innerText = 'Plaver 2:';
        player1Commands.appendChild(player2Inst);
        player2Commands = document.createElement('li');
        player2Commands.setAttribute('class', 'player2-instructions-list');
        player2Commands.innerText = 'Move up: I';
        player2Inst.appendChild(player2Commands);
        player2Commands = document.createElement('li');
        player2Commands.setAttribute('class', 'player2-instructions-list');
        player2Commands.innerText = 'Move down: K';
        player2Inst.appendChild(player2Commands);
        player2Commands = document.createElement('li');
        player2Commands.setAttribute('class', 'player2-instructions-list');
        player2Commands.innerText = 'Move left: L';
        player2Inst.appendChild(player2Commands);
        player2Commands = document.createElement('li');
        player2Commands.setAttribute('class', 'player2-instructions-list');
        player2Commands.innerText = 'Move right: J';
        player2Inst.appendChild(player2Commands);

    }

    function handleHistoryClick() {
        coverImg = document.getElementById('messiCristiano');
        header = document.getElementById('title');
        button.removeEventListener('click', handleStartClick);
        instructions.removeEventListener('click', handleInstructionsClick);
        button.remove();
        coverImg.remove();
        header.remove();
        gameHistoryPage();
    }

    function handleContactClick() {
        coverImg = document.getElementById('messiCristiano');
        header = document.getElementById('title');
        button.removeEventListener('click', handleStartClick);
        instructions.removeEventListener('click', handleInstructionsClick);
        button.remove();
        coverImg.remove();
        header.remove();
        contactPage();
    }

    // Game Screen

    function buildGame(){
        stadium = document.createElement('div');
        stadium.setAttribute('id', 'stadium-img');
        container.appendChild(stadium);

        stadiumImg = document.createElement('img');
        stadiumImg.setAttribute('src', './images/stadium.png');
        stadiumImg.setAttribute('height', '650')
        stadiumImg.setAttribute('width', '1600')
        stadium.appendChild(stadiumImg);
    
        canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'canvas');
        canvas.setAttribute('width', canvasSize.width)
        canvas.setAttribute('height', canvasSize.height)
        container.appendChild(canvas);
        
        container.setAttribute('color', 'black');
        scoreC = document.createElement('h2');
        scoreC.setAttribute('id', 'cristiano-score');
        scoreC.innerText = 'Cristiano';
        container.appendChild(scoreC);

        scoreM = document.createElement('h2');
        scoreM.setAttribute('id', 'messi-score');
        scoreM.innerText = 'Messi';
        container.appendChild(scoreM);

        golC = document.createElement('h2');
        golC.setAttribute('id', 'cristiano-gol');
        golC.innerText = '0';
        container.appendChild(golC);

        golM = document.createElement('h2');
        golM.setAttribute('id', 'messi-gol');
        golM.innerText = '0';
        container.appendChild(golM);


        // cristiano.remove();
        // messi.remove();

        // stadiumImg = document.createElement('img');
        // stadiumImg.setAttribute('id', 'stadium');
        // stadiumImg.setAttribute('src', '../module-one-first-project/images/willian-justen-de-vasconcellos-587601-unsplash.jpg')
        // // canvas.setAttribute('width', '100%')
        // // canvas.setAttribute('height', '100%')
        // container.appendChild(stadiumImg);
        playGame();
    }

    // function playGame() {
    //     var canvasCTX = canvas.getContext('2d');
    //     game = new Game (canvasCTX, canvas, endGame);
    //     gameTime = setTimeout(function() {
    //         endGame();
    //     }, 1000);
    // }

    function handleKeyUp (event) {
        // var self = this;
      
        if (event.key === 'w') {
          game.player1.moveUp();
        }
        else if (event.key === 's') {
          game.player1.moveDown();
        }
        else if (event.key === 'a') {
            game.player1.moveLeft();
        }
        else if (event.key === 'd') {
            game.player1.moveRight();
        }

        if (event.key === 'i') {
            game.player2.moveUp();
          }
        else if (event.key === 'k') {
            game.player2.moveDown();
          }
        else if (event.key === 'j') {
              game.player2.moveLeft();
          }
        else if (event.key === 'l') {
              game.player2.moveRight();
          }
      }

    //   function keyDictionary() {
    //     document.onkeyup = function(e){
    //         if(e.keyCode === 87){
    //             wDown = false;
    //         }
    //         if(e.keyCode === 65){
    //             aDown = false;
    //         }
    //         if(e.keyCode === 68){
    //             dDown = false;
    //         }
    //         if(e.keyCode === 83){
    //             sDown = false;
    //         }
    //         if(e.keyCode === 38){
    //             upDown = false;
    //         }
    //         if(e.keyCode === 37){
    //             leftDown = false;
    //         }
    //         if(e.keyCode === 40){
    //             downDown = false;
    //         }
    //         if(e.keyCode === 39){
    //             rightDown = false;
    //         }
    //     }
        
    //     document.onkeydown = function(e){
    //         if(e.keyCode === 87){
    //             wDown = true;
    //         }
    //         if(e.keyCode === 65){
    //             aDown = true;
    //         }
    //         if(e.keyCode === 68){
    //             dDown = true;
    //         }
    //         if(e.keyCode === 83){
    //             sDown = true;
    //         }
    //         if(e.keyCode === 38){
    //             upDown = true;
    //         }
    //         if(e.keyCode === 37){
    //             leftDown = true;
    //         }
    //         if(e.keyCode === 40){
    //             downDown = true;
    //         }
    //         if(e.keyCode === 39){
    //             rightDown = true;
    //         }
    //     }
    //   }
    
      function playGame() {
    
        var canvasCtx = canvas.getContext('2d');
    
        game = new Game(canvasCtx, canvas, endGame);
        // var gameTime = setTimeout(function() {
        //     endGame();
        // }, 1000);
    
        window.addEventListener('keydown', handleKeyUp)
    
      }

    // Destroys Game

    function endGame(winner) {
        canvas.remove();
        if (winner === 'player1') {
            cristianoWins();
        } else {
            messiWins();
        }
        // game = null;
        buildGameOver();
    }

    // Builds restart screen

    function buildGameOver(){
        button = document.createElement('button');
        button.setAttribute('id', 'btn-over');
        button.innerText = 'RESTART!'
        container.appendChild(button);
        button.addEventListener('click', destroyGameOver);
    }

    function messiWins() {
        stadium.remove();
        scoreC.remove();
        scoreM.remove();
        golM.remove();
        golC.remove();
        messi = document.createElement('div');
        messi.setAttribute('id', 'messi-wins');
        container.appendChild(messi);


        messiImg = document.createElement('img');
        messiImg.setAttribute('src', 'https://media.giphy.com/media/xUA7aT4k7JLXH71zG0/giphy.gif');
        messiImg.setAttribute('height', '700')
        messiImg.setAttribute('width', '1300')
        messi.appendChild(messiImg);
    
        mBackButton = document.createElement('button');
        mBackButton.setAttribute('id', 'C-back-button');
        mBackButton.innerText = 'RESTART!'
        messi.appendChild(mBackButton);
        mBackButton.addEventListener('click', buildGame);
    }

    function cristianoWins() {
        stadium.remove();
        scoreC.remove();
        scoreM.remove();
        golM.remove();
        golC.remove();
        
        cristiano = document.createElement('div');
        cristiano.setAttribute('id', 'cristiano-wins');
        container.appendChild(cristiano);

        cristianoImg = document.createElement('img');
        cristianoImg.setAttribute('src', 'https://media.giphy.com/media/xT1XGVp95GDPgFYmUE/giphy.gif');
        cristianoImg.setAttribute('height', '800')
        cristianoImg.setAttribute('width', '1300')
        cristiano.appendChild(cristianoImg);
    
        cBackButton = document.createElement('button');
        cBackButton.setAttribute('id', 'C-back-button');
        cBackButton.innerText = 'RESTART!'
        cristiano.appendChild(cBackButton);
        cBackButton.addEventListener('click', buildGame);
    }

    function destroyGameOver() {
        button.remove();
        // gameOver.remove();
        buildGame()
    }
        
    buildSplash()
}

window.addEventListener('load', main);

