/* Define Canvas */

var stage;
var centerX = 200;

/* Background */
  
var bgImg = new Image(); 
var bg; 
var bg2Img = new Image(); 
var bg2;

/* Player */

var pImg = new Image();
var player;
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
        {src: "person_fall.png", id: "fall"}
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
    player.x = centerX - 50;
    player.y = -100;
    
    
    score = new createjs.Text("0", "24px Arial", "#000000");
    score.maxWidth = 1000;  //fix for Chrome 17 
    score.x = 200; 
    score.y = 600; 
    
    stage.addChild(score, player);
    
    /* //TODO REMOVE
    //for testing canvas stuff
    var circle = new createjs.Shape();
    circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
      circle.x = 100;
      circle.y = -20;
      stage.addChild(circle);
    */
    startGame();
}
function startGame(){
    
    createjs.Ticker.addEventListener("tick", handleTick);
}

//TODO
function handleTick(event){
    if(!event.paused){
        stage.update();
    }
}