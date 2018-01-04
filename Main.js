/* Define Canvas */

var stage;
var CENTER_X = 200;
var WIDTH = 400;
var HEIGHT = 700;

/* Background */
  
var bgImg = new Image(); 
var bg; 
var bg2Img = new Image(); 
var bg2;

/* Player */

var pImg = new Image();
var player;
var PLAYER_FALL_SPEED = 15;
var PLAYER_HEIGHT = 100;
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

var floorsCompleted;

/* Sound */
var bipSoundID = "bip";

var score;

/* Walls */
var WALL_HEIGHT = 10;
var WALL_WIDTH = 400;
var WALL_HALF_WIDTH = 200;
var WALL_GAP = 80;
var wall_speed = 5;

var walls = [];

class Wall {
    constructor(gapLeftX, y){
        this.leftWall = new createjs.Bitmap(preload.getResult("wall"));
        this.rightWall = new createjs.Bitmap(preload.getResult("wall"));
        this.gapLeftX = gapLeftX;
        this.gapRightX = this.gapLeftX + WALL_GAP;
        
        this.leftWall.x = this.gapLeftX - WALL_WIDTH;
        this.leftWall.y = y;
        this.rightWall.x = this.gapRightX;
        this.rightWall.y = y;
    }
    moveUp(){
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
    
    /* Sound */
    //createjs.Sound.registerSound("bip.wav", bipSoundID, 5);
    
    /* Sprites */
    //var spriteSheet = new createjs.SpriteSheet(playerSprites);
    var manifest = [
        {src: "person_idle.png", id: "idle"},
        {src: "person_left.png", id: "left"},
        {src: "person_right.png", id: "right"},
        {src: "person_fall.png", id: "fall"},
        {src: "wall.png", id: "wall"}
    ]
    preload = new createjs.LoadQueue(true, "assets/");
    preload.on("complete", handleComplete);
    preload.installPlugin(createjs.Sound);
    preload.loadFile({src:"sounds/bip.wav", id:"bip"});
    preload.loadManifest(manifest, true, "assets/images/");
    
    createjs.Ticker.framerate = 30;
}

function handleComplete(){
    createjs.Sound.play("bip");
    
    
    addGameView();
}

function addGameView(){
    //Start player off-screen, have them fall into course
    player = new createjs.Bitmap(preload.getResult("fall"));
    player.x = CENTER_X - 50;
    player.y = -100;
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
    var firstWall = new Wall(randomGapX(), 600)
    walls.push(firstWall);
    firstWall.addToStage();
    
    stage.addChild(player,score);

    /*//TODO REMOVE
    //for testing canvas stuff
    var circle = new createjs.Shape();
    circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
      circle.x = 0;
      circle.y = 0;
      stage.addChild(circle);
     */
    startGame();
    //createjs.Tween.get(player)
    //    .to({y:200}, 1000)
    //    .call(startGame());
}
function startGame(){
    
    createjs.Ticker.addEventListener("tick", handleTick);
}

//TODO
function handleTick(event){
    if(!event.paused){
        
        walls.forEach(moveWallUp);
        
        //TODO detect collision with walls here
        
        
        
        if (player.falling == true && player.y < HEIGHT - PLAYER_HEIGHT){ //about the bottom
            player.y += PLAYER_FALL_SPEED;
        }   
        
        
        stage.update();
    }
}

function moveWallUp(wall){
    wall.moveUp();
}

function randomGapX(){
    return Math.floor(Math.random() * (WIDTH - WALL_GAP));
}