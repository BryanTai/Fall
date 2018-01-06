/* Define Canvas */

var stage;
var CENTER_X = 200;
var CENTER_Y = 350;
var STAGE_WIDTH = 400;
var STAGE_HEIGHT = 700;

/* Background */
  
var bgImg = new Image(); 
var bg; 
var bg2Img = new Image(); 
var bg2;

/* Player */

var pImg = new Image();
var player;
var PLAYER_FALL_SPEED = 10;
var PLAYER_WALK_SPEED = 15;
var PLAYER_HEIGHT = 100; //Note that (0,0) is at top left corner of image
var PLAYER_HALF_HEIGHT = 50;
var PLAYER_FEET_HEIGHT = 90;
var PLAYER_WIDTH = 70;
var PLAYER_WIGGLE_ROOM = 5;
var preload;

var playerSprites = {
    images: ["people.png"],
    frames: {width:100,height:100},
    animations: {
        stand:0,
        left:1,
        right:2,
        fall:3
    }
};

var mouseTracerX = CENTER_X;

var floorsCompleted;

/* Sound */
var bipSoundID = "bip";

var score;

/* Walls */
var WALL_HEIGHT = 10;
var WALL_WIDTH = 400;
var WALL_HALF_WIDTH = 200;
var WALL_GAP = 80;
var wall_speed = 10;
var DESTROY_WALL_Y = -20;
var SPAWN_NEW_WALL_Y = 400; //Higher number means more walls

var walls = []; //Acts as a queue, walls[0] is the highest wall

//TODO Place both Images into a Container
class Wall {
    constructor(gapLeftX, y){
        this.leftWall = new createjs.Bitmap(preload.getResult("wall"));
        this.rightWall = new createjs.Bitmap(preload.getResult("wall"));
        this.gapLeftX = gapLeftX;
        this.gapRightX = this.gapLeftX + WALL_GAP;
        this.y = y;
        
        this.leftWall.x = this.gapLeftX - WALL_WIDTH;
        this.leftWall.y = y;
        this.rightWall.x = this.gapRightX;
        this.rightWall.y = y;
    }
    moveUp(){
        this.y -= wall_speed;
        this.leftWall.y -= wall_speed;
        this.rightWall.y -= wall_speed;
    }
    addToStage(){
        stage.addChild(this.leftWall);
        stage.addChild(this.rightWall);
    }
    
}

function Main(){
    
    /* Link Canvas */
    stage = new createjs.Stage("fallCanvas");
    
    stage.enableMouseOver(20);
    createjs.Ticker.framerate = 30;
    /* Sound */
    //createjs.Sound.registerSound("bip.wav", bipSoundID, 5);
    
    /* Sprites */
    //var spriteSheet = new createjs.SpriteSheet(playerSprites);
    var manifest = [
        {src: "person_idle.png", id: "idle"},
        {src: "person_left.png", id: "left"},
        {src: "person_right.png", id: "right"},
        {src: "person_fall.png", id: "fall"},
        {src: "wall.png", id: "wall"},
        {src: "gameover.png", id: "gameover"}
    ]
    preload = new createjs.LoadQueue(true, "assets/");
    preload.on("complete", handleComplete);
    preload.installPlugin(createjs.Sound);
    preload.loadFile({src:"sounds/bip.wav", id:"bip"});
    preload.loadManifest(manifest, true, "assets/images/");
}

function handleComplete(){
    createjs.Sound.play("bip");
    
    
    addGameView();
}

function addGameView(){
    //Start player off-screen, have them fall into course
    player = new createjs.Bitmap(preload.getResult("fall"));
    player.x = CENTER_X - 50;
    player.y = -PLAYER_HEIGHT + 10;
    player.falling = true;
    
    
    score = new createjs.Text("0", "24px Arial", "#000000");
    score.maxWidth = 1000;  //fix for Chrome 17 
    score.x = 200; 
    score.y = 0; 

    /*//TODO JUST FOR TESTING
    for (var i = 0; i < 4; i++){
        var testWall = new Wall(WALL_GAP * i , (i+1)*100);
        testWall.addToStage();
    }*/
    var firstWall = new Wall(150,600);//new Wall(randomGapX(), 600)
    walls.push(firstWall);
    firstWall.addToStage();
    
    stage.addChild(player,score);

    //TODO REMOVE
    //for testing canvas stuff
    /*var circle = new createjs.Shape();
    circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
      circle.x = CENTER_X - 50;
      circle.y = 100;
      stage.addChild(circle);*/
     
    startGame();
    //createjs.Tween.get(player)
    //    .to({y:200}, 1000)
    //    .call(startGame());
}
function startGame(){
    createjs.Touch.enable(stage);
    stage.addEventListener("stagemousemove", handleMouseMove);
    createjs.Ticker.addEventListener("tick", handleTick);
}

function handleTick(event){
    if(!event.paused){
        handleWallMovementAndCollisions();
        handlePlayerInput();
       
        stage.update();
    }
}

function spawnNewWall(){
    var newWall = new Wall(randomGapX(), 750)
    walls.push(newWall);
    newWall.addToStage();
}

function handleWallMovementAndCollisions(){
    var playerHandled = false;
    var playerFalling = true;
    var makeNewWall = false;

    for(var w = 0; w < walls.length; w++){
        var wall = walls[w];
        wall.moveUp();
        
        if(wall.y < SPAWN_NEW_WALL_Y + wall_speed && wall.y > SPAWN_NEW_WALL_Y - wall_speed){
            console.log("SPAWN NEW WALL");
            spawnNewWall();
        }
        
        //Player has already passed this wall
        var wallPassed = player.y + PLAYER_FEET_HEIGHT > wall.y;
        var wallTooFar = player.y + PLAYER_HEIGHT + PLAYER_FALL_SPEED< wall.y;
        if(wallPassed || wallTooFar){
            continue;
        }
        
        //Player can only touch one wall at a time. Skip checking the lower ones.
        if(playerHandled == false){
            if(areFeetTouchingWall(wall)){
                if(areSidesTouchingWall(wall)){
                    player.y = wall.y - PLAYER_HEIGHT;
                    playerFalling = false;
                }
                
                playerHandled = true;
            }
        }
    }
    
    if(player.y < 0 - PLAYER_HEIGHT) {
        gameOver();
    }
    
    if(playerFalling == true){
        movePlayerDown();
    }
    
    if (walls[0].y < DESTROY_WALL_Y){
        walls.shift();
        console.log("RIP WALL");
    }
}

function handleMouseMove(event){
    mouseTracerX = stage.mouseX;
}

function handlePlayerInput(){
    var playerCentreX = player.x + (PLAYER_WIDTH/2);
    if(playerCentreX < mouseTracerX - PLAYER_WALK_SPEED){
        player.x += PLAYER_WALK_SPEED;
    }else if(playerCentreX > mouseTracerX + PLAYER_WALK_SPEED){
        player.x -= PLAYER_WALK_SPEED;
    }
}

function gameOver(){
    //TODO
    console.log("DEAD");
    createjs.Ticker.paused = true;
    var gameoverScreen = new createjs.Bitmap(preload.getResult("gameover"));
    gameoverScreen.x = CENTER_X - 150;
    gameoverScreen.y = CENTER_Y - 150;
    stage.addChild(gameoverScreen);
    stage.update();
}

//just check lower half of player body
function areFeetTouchingWall(wall){
    var playerTopOfFeet = player.y; //+ PLAYER_HEIGHT - wall_speed - PLAYER_FALL_SPEED - 20;
    var playerBottomOfFeet = player.y + PLAYER_HEIGHT;
    return playerTopOfFeet < wall.y && playerBottomOfFeet >= wall.y;
}

function isLeftTouchingWall(wall){
    return player.x + PLAYER_WIGGLE_ROOM < wall.gapLeftX;
}

function isRightTouchingWall(wall){
    return player.x + PLAYER_WIDTH - PLAYER_WIGGLE_ROOM > wall.gapRightX;
}

function areSidesTouchingWall(wall){
    return isLeftTouchingWall(wall) || isRightTouchingWall(wall);
}

function movePlayerDown(){
    if (player.y < STAGE_HEIGHT - PLAYER_HEIGHT){ //about the bottom
        player.y += PLAYER_FALL_SPEED;
    }   
}

//for the forEach function
function moveWallUp(wall){
    wall.moveUp();
}

function randomGapX(){
    return Math.floor(Math.random() * (STAGE_WIDTH - WALL_GAP));
}