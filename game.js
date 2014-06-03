/* JavaScript for Gremma Invasion index.html 
 * Grace Lin and Emma Hsueh
 * Feb 7, 2013
 */


var canvas;
var context;
var backColour = "rgba(0, 0, 0, 0.9)";
var moveColour = "rgba(20, 10, 80, 0.9)";
var villains = [];
var missiles = [];
var lives = [];
var dangos = [];
var dspeed = 10;    // how much a dango moves each time

var posx = 210;     // starting position for top left villain
var posy = 75;
var direction = 1;  // starting direction for all villains

var gunX = 512;     // initial position of gun
var numlives = 3;
var interval = 1;
var levelSpeed = 200;
var score = 0;

// change how fast the villains, missiles, and dangos move
// the smaller the speed, the faster they move
var villainSpeed = levelSpeed;
var missileSpeed = 10;
var dangoSpeed = 5;

//initialize gun
var gun = new Image();
gun.src = "gun_1.png";

// no spam shots
var d = new Date();
var prevShot = d.getTime();
var startTime; // time the game started

var refreshIntervalId;


/* DEFINE "CLASS"
 * Life
 * Villain
 * Missile 
 * Dango
 */

 /* class Life */
 function Life(x, y) {
    this.x = x;
	this.y = y;
	this.totoro = new Image();
	this.totoro.src = "life_0.png";
		
	// when die, draw all available frames
	this.die = function() {
        context.clearRect(this.x, this.y, 55, 55);
		context.fillStyle = backColour;
		context.fillRect(this.x, this.y, 55, 55);	
	};
}


/* class Missile */
function Missile(initX) {
    this.x = initX;
    this.y = 650;
    var img = new Image();
    img.src = "missile.png";
    this.draw = function() { context.drawImage(img, this.x, this.y); };
    this.move = function () { 
        this.y -= 20; };
}

/* class Villain */
function Villain(file, x, y) {
    this.x = x;
    this.y = y;
    this.name = file;
    this.v = new Image();
    this.v.src = file;
    
    this.draw = function() { 
        context.drawImage(this.v, this.x, this.y); };
    
    this.move = function () {
        if (moveRight) {
            this.y += 50;
        } else if (moveLeft) {
            this.y += 50;
        } else { // we didn't meet an edge
            this.x += 25 * direction;
        }
    }
}


/* class Dango */
function Dango(intX, intY) {
	this.x = intX+25;
	this.y = intY+50;
    var img = new Image();
    img.src = "dango.png";
    this.draw = function() { context.drawImage(img, this.x, this.y, 20, 20); };
    this.move = function() { this.y += dspeed };
}


/* FUNCTIONS */
 
/* remove dead missiles and villains from their lists */
function cleanUp() {
    var temp_missiles = [];
    var temp_villains = [];
    var temp_dangos = [];
    
    var i;
    for (i=0; i<missiles.length; i++) {
        if (missiles[i] != null) {
            temp_missiles.push(missiles[i]);
        }
    }
    for (i=0; i<villains.length; i++) {
        if (villains[i] != null) {
            temp_villains.push(villains[i]);
        }
    }
	for (i=0; i<dangos.length; i++) {
        if (dangos[i] != null) {
            temp_dangos.push(dangos[i]);
        }
    }
    if (missiles.length != temp_missiles.length) {
        missiles = temp_missiles;
    }
    if (villains.length != temp_villains.length) {
        villains = temp_villains;
    }
    if (dangos.length != temp_dangos.length) {
    	dangos = temp_dangos;
	}
}


// draw frame i of explosion at coordinates (x, y)
function explosion(i, x, y) {
    var exp = new Image();
    exp.src = "exp_" + i + ".png";
    for (var j=0; j < 200; j++) {
        context.drawImage(exp, x, y);
    }
    return;
}


// for this missile at index i, check if it hits a villain
function hit(i) {
    var missile = missiles[i];
    for (var j=0; j < villains.length; j++) {
        var villain = villains[j];
        if (villain == null) { // dead villain but not yet cleared
            return;
        }
        // we hit a villain?
        if (missile.x+12 >= villain.x && missile.x+12 <= villain.x+50
         && missile.y >= villain.y    && missile.y <= villain.y+50) {
            villains[j] = null;
            missiles[i] = null;
            context.clearRect(villain.x, villain.y, 50, 50);
            context.fillStyle = moveColour;
            context.fillRect(villain.x, villain.y, 50, 50);
            
            // draw explosion
            for (var f=1; f < 4; f++) {
                explosion(f, villain.x, villain.y);
            }
            draw = false;
            
            //increment score
            switch(villain.name) {
                case "villain_noface.png":
                    score += 10; break;
                case "villain_gluttony.png":
                    score += 15; break;
                case "villain_bowser.png":
                    score += 20; break;
                case "villain_buu.png":
                    score += 25; break;
            }
            return;
        }
    }
}


function randomFromTo() {
    var from = 0;
    var to   = 5000;
    return Math.floor(Math.random() * (to - from + 1) + from);
}


// to all the villains in a direction at once
var moveLeft;
var moveRight;


/* draw everything on canvas */
function drawAll() {
    context.clearRect(200, 64, 660, 637);
    context.fillStyle = moveColour;
    context.fillRect(200, 64, 660, 637);
    
    // --------- drawing villains --------- //
    moveLeft = false; moveRight = false;
    var villainMove = false;
    if (villainSpeed != 0) {
            villainSpeed--;
    } else {
        villainSpeed = levelSpeed;
        villainMove = true;
    }

    // loop to check if we need to move down and reverse directions
    if (villainMove == true) {
        for (var i=0; i<villains.length; i++) {
            var villain = villains[i];
            if (villain.x + 25*direction < 210) {
                moveRight = true;
                direction = 1;
                break;
            } else if (villain.x + 25*direction > 800) {
                moveLeft = true;
                direction = -1;
                break;
    }   }   }
    
    for (var i=0; i<villains.length; i++) {
        var villain = villains[i];
        // does this villain shoot?
        var shoot = randomFromTo();
        if (shoot == 0) { // modify frequency of shots from villains here
            var dango = new Dango(villain.x, villain.y);
            dangos.push(dango);
        }
        
        if (villainMove == true) {
            villain.move(); }
        villain.draw();
        
        // endGame if villain reaches bottom
        if (villain.y >= 650) {
            pause(); gg();
            return;
            lives--;
        }
    }

    // --------- drawing missiles --------- //
    var missileMove = false;
    if (missileSpeed != 0) {
            missileSpeed--;
    } else {
        missileSpeed = 10;
        missileMove = true;
    }
    
    draw = true;
    for (i=0; i<missiles.length; i++) {
        var missile = missiles[i];
        if (missile.y < 75) {
            missiles[i] = null;
            draw = false;
            continue; 
        }
        hit(i);
        
        if (draw == true) {
            if (missileMove == true) {
                missile.move(); }
            missile.draw();
        }
    }
    
    // --------- drawing dangos --------- //
    var dangoMove = false;
    if (dangoSpeed != 0) {
            dangoSpeed--;
    } else {
        dangoSpeed = 5;
        dangoMove = true;
    }
    
    for (var i=0; i<dangos.length; i++) { 
		var dango = dangos[i];
        if (dangoMove) {
            dango.move();
        }
        
        // out of range
        if (dango.y > 680) {
            if (dango.x >= gunX-4 && dango.x <= gunX+53) {
                dangos[i] = null;
                if (lives.length == 1) {
                    lives[lives.length-1].die();
                    gg();
                    return;
                } else {
                    lives[lives.length-1].die();
                    lives.pop(); draw = false;
                }
            }
            dangos[i] = null;
            draw = false;
            continue;
        } else { // within villains' movement range
            dango.draw();
        }
	}
    
    context.clearRect(0, 0, 290, 60);
    context.fillStyle = backColour;
    context.fillRect(0, 0, 290, 60);
    
    // scoring
    context.font = "30pt Georgia";
    context.textAlign = "left";
    context.fillStyle = "#FFFFFF";
    context.fillText("Score: " + score, 15, 45);
    
    if (draw == false) { 
        cleanUp(); }
    
    if (villains.length == 0) {
        win(); return;
    }
}


function reset() {
    posx = 210; posy = 75; direction = 1; 
    villains = []; missiles = []; dangos = []; lives = [];
    numlives = 3; life_frames = 0; gunX = 512;
}


/* start screen */
function prelude() {
    context.fillStyle = backColour;
    context.fillRect(0, 0, 1024, 768);
	  
	context.font = "60pt Georgia";
    context.textAlign = "center";
    context.fillStyle = "#FFFFFF";
    context.fillText("GREMMA INVASION", 512, 200);
	context.font = "30pt Georgia";
    context.fillText("<LEFT> to move gun left", 512, 300);
    context.fillText("<RIGHT> to move gun left", 512, 350);
    context.fillText("<SPACE> to shoot gun", 512, 400);
    context.fillText("<ENTER> to start!", 512, 450);
    
	context.font = "20pt Georgia";
    context.fillText("Points:    NoFace = 10   Gluttony = 15", 512, 550);
    context.fillText("Bowser = 20   Buu = 25", 540, 580);
    
	context.font = "30pt Georgia";
    context.fillText("IF THIS IS YOUR FIRST LOAD OF THE GAME,", 512, 650);
    context.fillText("PLEASE REFRESH THE PAGE.", 512, 700);
    context.fillText("See README for details.", 512, 750);

	window.onkeydown = function(e) {
		if (e.keyCode == 13) { // hit enter: start game
            context.fillStyle = backColour;
            context.fillRect(0, 0, 1024, 768);
			home();
		}
	}
}


function home() {
    context.clearRect(0, 0, 1024, 768);
    // whole screen
    context.fillStyle = backColour;
    context.fillRect(0, 0, 1024, 768);
    
    // moving box
    context.clearRect(200, 64, 660, 721);
    context.fillStyle = moveColour;
    context.fillRect(200, 64, 660, 721);
    
    context.lineWidth = 1;
    context.strokeStyle = "red";
    context.strokeRect(199, 63, 662, 722);
    
    context.drawImage(gun, 512, 705);
    
    var i;
    
    for (i=4; i >= 0; i--) {
        var v1 = new Villain("villain_buu.png",      posx+i*70, posy);
        villains.push(v1);
    }
    for (i=4; i >= 0; i--) {
        var v2 = new Villain("villain_bowser.png",   posx+i*70, posy+60);
        villains.push(v2);
    }
    for (i=4; i >= 0; i--) {
        var v3 = new Villain("villain_gluttony.png", posx+i*70, posy+120); 
        villains.push(v3);
    }
    for (i=4; i >= 0; i--) {
        var v4 = new Villain("villain_noface.png",   posx+i*70, posy+180);
        villains.push(v4);
    }
    start();
}


function start() {
    var d = new Date();
    startTime = d.getTime();
    
	for ( i = 0; i < numlives ; i ++) {
		var life = new Life(875+48*i, 5);
		lives.push(life);
		context.drawImage(life.totoro, life.x, life.y);
	}
    
    refreshIntervalId = window.setInterval("drawAll()", interval);
    
    // interactive: move gun and shoot on keydown
    window.onkeydown = function(e) {
        
        function clearGun() {
            context.clearRect(200, 700, 660, 85);
            context.fillStyle = moveColour;
            context.fillRect(200, 700, 660, 85);
        }
        
        switch(e.keyCode) {
            // space bar
            case 32:
                var d = new Date();
                var curShot = d.getTime();
                if (curShot - prevShot > 500) {
                    prevShot = curShot;
                    var m = new Missile(gunX);
                    missiles.push(m);
                }
                break;
             
             // left arrow
            case 37:
                clearGun();
                context.drawImage(gun, 
                    gunX > 220 ? gunX -= 10 : gunX, 705);
                break;
             
            // right arrow
            case 39:
                clearGun(); 
                context.drawImage(gun,
                    gunX < 795 ? gunX += 10 : gunX, 705);
                break;
            default:
                var Gun = new Image();
                Gun.src = "gun_1.png";
                context.drawImage(Gun, gunX, 705);
        }
    }
}


function pause() {
    window.clearInterval(refreshIntervalId);
}


/* stop game */
function gg() {
    context.font = "100pt Georgia";
    context.textAlign = "center";
    
    context.fillStyle = "#FF0000";
    context.fillText("GAME OVER", 503, 304);
    
    context.fillStyle = "#FFFFFF";
    context.fillText("GAME OVER", 500, 300);
    pause();
    moregame();
}


function endGame() {
    context.font = "60pt Georgia";
    context.textAlign = "center";
    
    context.fillStyle = "#FF0000";
    context.fillText("Congratulations!", 503, 404);
    context.fillText("You beat the game!!", 503, 474);
    
    context.fillStyle = "#FFFFFF";
    context.fillText("Congratulations!", 500, 400);
    context.fillText("You beat the game!!", 500, 470);
    moregame();
}


/* countdown to new game */
function NewGameTimer(i) {
    if (i == 0) {
        home();
        return;
    }
    context.clearRect(450, 420, 100, 105);
    context.fillStyle = moveColour;
    context.fillRect(450, 420, 100, 105);

    context.font = "70pt Georgia";
    context.textAlign = "center";
    
    context.fillStyle = "#FF0000";
    context.fillText(i, 503, 504);
    
    context.fillStyle = "#FFFFFF";
    context.fillText(i, 500, 500);
}


/* level won */
function win() {
    context.font = "100pt Georgia";
    context.textAlign = "center";
    context.fillStyle = "#FF0000";
    context.fillText("ALL CLEAR!!", 503, 304);
    
    context.fillStyle = "#FFFFFF";
    context.fillText("ALL CLEAR!!", 500, 300);
    
    // start game on next level...
    pause(); reset();
    levelSpeed -= 50;
    if (levelSpeed <= 0) {
        endGame();
        return;
    }
    
    context.font = "60pt Georgia";
    context.textAlign = "center";
    context.fillStyle = "#FF0000";
    context.fillText("Game starting in...", 515, 404);
    
    context.fillStyle = "#FFFFFF";
    context.fillText("Game starting in...", 512, 400);

    NewGameTimer(3);
    setTimeout("NewGameTimer(2)", 1000);
    setTimeout("NewGameTimer(1)", 2000);
    setTimeout("NewGameTimer(0)", 3000);
    return;
}


/* to restart game */
function moregame() {
    // bold
	context.font = "50pt Georgia";
    context.textAlign = "center";
    context.fillStyle = "#FF0000";
    context.fillText("Press Enter to Play Again!", 515, 604);
    
    context.fillStyle = "#FFFFFF";
    context.fillText("Press Enter to Play Again!", 512, 600);
	window.onkeydown = function(e) {	
		if (e.keyCode == 13) { //reload the page
            levelSpeed = 200; score = 0; 
            reset();
            home();
		}
	}
}


/* it all starts here! */
canvas = document.getElementById("spaceCanvas");
context = canvas.getContext("2d");
prelude();