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
var messageText;

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

var scoreText;
var scoreAmount;

/* Walls */
var WALL_HEIGHT = 10;
var WALL_WIDTH = 400;
var WALL_HALF_WIDTH = 200;
var WALL_GAP = 80;
var wall_speed = 10;
var WALL_SPEED_MAX = 20;
var DESTROY_WALL_Y = -20;
var NEW_WALL_TRIGGER_Y = 650; //Higher number means more walls
var NEW_WALL_SPAWN_Y = 1000;
var currentWallIndex;

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
    
    
    scoreText = new createjs.Text("0", "32px Arial", "#000000");
    scoreText.maxWidth = 1000;  //fix for Chrome 17 
    scoreText.x = 200; 
    scoreText.y = 0; 
    scoreAmount = 0;

    var message = "COOL!"; //TODO load messages from a text doc
    messageText = new createjs.Text(message, "60px Arial", "#38FF33");
    messageText.maxWidth = 1000;  //fix for Chrome 17 
    messageText.x = CENTER_X;
    messageText.y = CENTER_Y;
    messageText.alpha = 0;
    messageText.textAlign = "center";

    var firstWall = new Wall(150,655);//new Wall(randomGapX(), 600)
    walls.push(firstWall);
    firstWall.addToStage();
    currentWallIndex = 0;
    
    stage.addChild(player, scoreText, messageText);

     
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
        player.falling = true;
        checkGameOver();
        moveWalls();
        checkCollisionAgainstCurrentWall();
        handlePlayerInput();
        movePlayerDown();
        updateCurrentWallIndex();
        destroyWall();
        //handleWallMovementAndCollisions();
       
        stage.update();
    }
}

function checkGameOver(){
    if(player.y < 0 - PLAYER_HEIGHT) {
        gameOver();
    }
}

var tickCount = 0;

function moveWalls(){
    tickCount++;
    for(var w = 0; w < walls.length; w++){
        var wall = walls[w];
        wall.moveUp();
        
        //if(wall.y < NEW_WALL_TRIGGER_Y + 20 && wall.y > NEW_WALL_TRIGGER_Y - 20){
        if(tickCount >= 20){
            spawnNewWall();
            tickCount = 0;
        }
    }
}

function spawnNewWall(){
    var newWall = new Wall(randomGapX(), NEW_WALL_SPAWN_Y)
    walls.push(newWall);
    newWall.addToStage();
}

function checkCollisionAgainstCurrentWall(){
    var currentWall = walls[currentWallIndex];
    var wallTooFar = player.y + PLAYER_HEIGHT + PLAYER_FALL_SPEED < currentWall.y;
    if(wallTooFar == true){
        return;
    }
    
    if(areFeetTouchingWall(currentWall)){
        if(areSidesTouchingWall(currentWall)){
            player.y = currentWall.y - PLAYER_HEIGHT;
            player.falling = false;
        }
        
        playerHandled = true;
    }
}

function updateCurrentWallIndex(){
    var currentWall = walls[currentWallIndex];
    //New walls spawn well off screen so currentWallIndex will stay in bounds
    if( player.y + PLAYER_FEET_HEIGHT > currentWall.y ){
        currentWallIndex++;
        increaseScore();
    }
}

function increaseScore(){
    scoreAmount++;
    scoreText.text = scoreAmount;
    //popUpMessage();
    if(scoreAmount % 5 == 0){ //set to 5 for testing, 10 for game
        wall_speed++;
        popUpMessage();
    }
}

function popUpMessage(){
//messageText.text = "SENSATIONAL!";
    createjs.Tween.get(messageText)
    .to({alpha:1}, 500, createjs.Ease.getPowInOut(2))
    .to({alpha:0}, 500, createjs.Ease.getPowInOut(2));
}

function destroyWall(){
    if (walls[0].y < DESTROY_WALL_Y){
        walls.shift();
        currentWallIndex--;
        //console.log("RIP WALL");
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
    console.log("DEAD");
    createjs.Ticker.paused = true;
    var gameoverScreen = new createjs.Bitmap(preload.getResult("gameover"));
    gameoverScreen.x = CENTER_X - 150;
    gameoverScreen.y = CENTER_Y - 150;
    
    gameoverScreen.addEventListener("mousedown", function(){window.location.reload();});
    
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
    if (player.falling == true && player.y < STAGE_HEIGHT - PLAYER_HEIGHT){
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