var p1, database;
var position,position2;
var p2;
var p1animation,p2animation;
var gameState=0;
var p1Score;
var p2Score;
var flag=0;
function preload()
{
    //Loading the animations
    p1anim =loadAnimation("assets/player1a.png","assets/player1b.png","assets/player1a.png");
    p2anim =loadAnimation("assets/player2a.png","assets/player2b.png","assets/player2a.png");
}

function setup()
{
    database = firebase.database();
    
    createCanvas(displayWidth-100,displayHeight-150);

    //Creating Red Player 1
    p1 = createSprite(200,displayHeight/2,10,10);
    p1.addAnimation("walkp1",p1anim);
    p1.scale = 0.5;
    p1.setCollider("circle", 0,0,70);

    //Adding Reset Button from DOM
    reset=createButton("Restart");
    reset.position(displayWidth-150,20);
    
    //Retrieving Player1 Position From Database
    var player1Position = database.ref('player1/position');
    player1Position.on("value", function (data){
        pos = data.val();
        p1.x = pos.x;
        p1.y = pos.y;
    }); 

    //Creating Yellow Player2
    p2 = createSprite(displayWidth-200,displayHeight/2,10,10);
    p2.addAnimation("walkp2",p2anim);
    p2.scale = -0.5
    p2.setCollider("circle", 0,0,70)

    //Retrieving Player2 Position From Database
    var player2Position = database.ref('player2/position');
    player2Position.on("value", function (data){
      pos2 = data.val();
      p2.x = pos2.x;
      p2.y = pos2.y;
    });


    //Retrieving GameState From Database
    gameState = database.ref('gameState/');
    gameState.on("value",function(data){
      gameState = data.val();
    });

    //Retrieving Player1 Score From Database
    
    p1Score = database.ref('p1Score/');
    p1Score.on("value", function(data){
      p1Score = data.val();
    });

    //Retrieving Player2Score From Database
    
    p2Score = database.ref('p2Score/');
    p2Score.on("value",function(data){
      p2Score = data.val();
    });
    flag=0;

    
 }

function draw()
{
    background("white");
    stroke("red");
    textSize(10);
    topY=540;
    LeftX=10;
    text("Instructions",LeftX,topY);
    text("Press Space key to Toss and start the game",LeftX,topY+10);
    text("Toss winning player raids the other(defender) player using direction keys",LeftX,topY+20);
    text("Defender Player can only move up and down using 'W' and 'D' keys",LeftX,topY+30);
    text("Raid is successful if the raider touches defender player",LeftX,topY+40);
    text("A succesful raid will give 10 points to raider and deduct 10 from defender",LeftX,topY+50);
    text("A failed raid will give 5 points to defender and deduct 5 from raider",LeftX,topY+60);
    text("Winner is declared as soon as any player scores 20 points",LeftX,topY+70);
    //When Game Is Starting
    if(gameState === 0)
    {
      //For the toss
      if(keyDown("space"))
      {
        rand = Math.round(random(1,2));
        //If Red player wins
        if(rand === 1)
        {
          //change the gamestate in the database
          database.ref('/').update({
            'gameState': 1  
          })
          gameState=1;
        }

        //If Yellow player wins
        if(rand === 2)
        {
          //change the gamestate in the database
          database.ref('/').update({
            'gameState': 2  
          })
          gameState=2;
        }
      }
    }
    if (flag!==3)
    flag=gameState;
     
    //if have to toss again
    if(flag===0)
    {
      stroke("purple");
      textSize(25);
      text("Press Space To Toss",500,80); 
      
        database.ref('player1/position').update({
          'x': 150,
          'y': 300  
        })

        database.ref('player2/position').update({
          'x': 1150,
          'y': 300  
        })

    }
    
 
 
    //if red player wins the toss
    if(flag===1)
    {
      stroke("red");
      textSize(20);
      text("Red Wins the Toss",500,80);
      textSize(16);   
      text("Use Arrow Keys To Move The Red Player and W and D to move the Yellow Player",350,100); 
     
    } 

    //if yelllow player wins the toss
    if(flag===2)
    {
      stroke("yellow");
      textSize(20);
      text("Yellow Wins the Toss",500,80); 
      textSize(16);
      text("Use Arrow Keys To Move The Yellow Player and W and D to move the Red Player",350,100);
    }

    //if game has ended
    if(flag===3)
    {
      stroke("green");
      textSize(20);
      text("Game Has Ended",600,80); 
      textSize(16);
      text("Press Restart Button To Play Again",550,100);
      textSize(40)
      if(p1Score > p2Score)
      {
        fill("red");
        text("Red Player won the game : "+p1Score, 400,300)
      }
      else
      {
        fill("yellow");
        text("Yellow Player won the game : "+p2Score, 400,300)
      }
    
    }

    //for red player movement
  if (gameState === 1)
  {
    if(keyDown(LEFT_ARROW)){
      writePosition(-5,0);
    }
    else if(keyDown(RIGHT_ARROW)){
      writePosition(5,0);
    }
    else if(keyDown(UP_ARROW)){
      writePosition(0,-5);
    }
    else if(keyDown(DOWN_ARROW)){
      writePosition(0,+5);
    }
    else if(keyDown("w")){
      writePosition2(0,-5);
    }
    else if(keyDown("d")){
      writePosition2(0,+5);
    }

      //if red player touches the extreme end without touching the player, its a foul
     if(p1.x > 1100)
     {
       database.ref('/').update({
         'p1Score': p1Score - 5 ,
         'p2Score': p2Score + 5 ,
         'gameState': 0  

       })
       flag=0;
      }
      
      // if red player touches the yellow player, he wins
    if(p1.isTouching(p2))
    {
      database.ref('/').update({
        'gameState': 0  ,
        'p1Score': p1Score + 10 ,
        'p2Score': p2Score - 10 
      })
      flag=0;
      //alert("Yellow Lost The Game")
    }
    
    
  }

  // if game ends
  if((p1Score>=20 || p2Score>=20))
  {
    flag=3;
  }

  // yellow player movement
  if(gameState === 2)
  {
    if(keyDown(LEFT_ARROW)){
        writePosition2(-5,0);
      }
      else if(keyDown(RIGHT_ARROW)){
        writePosition2(5,0);
      }
      else if(keyDown(UP_ARROW)){
        writePosition2(0,-5);
      }
      else if(keyDown(DOWN_ARROW)){
        writePosition2(0,+5);
      }
      else if(keyDown("w")){
        writePosition(0,-5);
      }
      else if(keyDown("d")){
        writePosition(0,+5);
      }

      // if yellow plyer touches the left portion without touching the player, it is a foul
       if(p2.x < 150){
         database.ref('/').update({
           'p1Score': p1Score + 5, 
           'gameState': 0,
           'p2Score': p2Score - 5   
         })
         flag=0;
       }

       //if yellow player touches thered player, yellow wins
      if(p2.isTouching(p1)){
        database.ref('/').update({
          'gameState': 0  ,
          'p1Score': p1Score - 10,
          'p2Score': p2Score + 10  
        })
        flag=0;
        //alert("Red Lost The Game");
      }
      
      
    }
    //putting the score
      textSize(15)
    text("RED: "+p1Score,350,15);
    text("YELLOW: "+p2Score,750,15);
    
    // reset functionality
    reset.mousePressed(function(){
      gameState=0;
      flag=0;
      database.ref('/').update({
        p1Score: 0,
        p2Score: 0,
        gameState: 0,
        
      });

    });
 
    
    drawLine(200,"red");
    drawLine(displayWidth/2,"black");
    drawLine(1050,"yellow");
 
    drawSprites();
  
}

function writePosition(x,y){
  //for restricting the player to cross the edges
  if(pos.x+x>0 && pos.x+x<1300 & pos.y+y>0 && pos.y+y<600)
  {
  database.ref('player1/position').set({
    'x': pos.x + x ,
    'y': pos.y + y
  })
}
}

function writePosition2(x,y){
   //for restricting the player to cross the edges
  if(pos2.x+x>0 && pos2.x+x<1300 & pos2.y+y>0 && pos2.y+y<600)
  {
  database.ref('player2/position').set({
    'x': pos2.x + x ,
    'y': pos2.y + y
  })
}
}

function drawLine(x,colour)
{
    for(var i = 0; i<600; i=i+20){
      stroke(colour);
      line (x,i,x,i+10)
      
    }
}
