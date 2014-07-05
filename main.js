window.onload = function(){
    console.log("Javascript has succesfully loaded");
};

var myGame = new Phaser.Game(500,340);

var myState = {
    
    preload: function() {
        //anything to be done before the game starts

        myGame.load.image('player', 'assets/player.png');
        
        myGame.load.image('wallV', 'assets/wallVertical.png');
        myGame.load.image('wallH', 'assets/wallHorizontal.png');
        myGame.load.image('enemy', 'assets/enemy.png');
        myGame.load.image('coin', 'assets/coin.png');
    },
    
    create: function(){
        //create and draw the initial state of the game
        this.game.stage.backgroundColor= '#3498db';
        
        // Create the player
        this.player = myGame.add.sprite(myGame.world.centerX, myGame.world.centerY, 'player');
        
        // Start the physics engine
        myGame.physics.arcade.enable(this.player);

        // Create the world
        this.createWorld();

        // Set player properties
        this.player.anchor.setTo(0.5,0.5);
        
        this.player.body.gravity.y = 500;
        this.player.body.bounce.y = .2 
        
        
        // Create controls
        this.cursor = myGame.input.keyboard.createCursorKeys();
        
        // Display the coin
        this.coin = myGame.add.sprite(60, 140, 'coin');
        
        // Add physics
        myGame.physics.arcade.enable(this.coin);
        
        // center the anchor
        this.coin.anchor.set(0.5);
        
        // Create the score label
        this.scoreLabel = myGame.add.text(30, 30, 'score: 0',
                                          { font: '18px Arial', fill: '#ffffff'});
        
        // Initialise the score
        this.score = 0;
        
        // Create a group of enemies with arcade physics
        this.enemies = myGame.add.group();
        this.enemies.enableBody = true;
        
        // Create 10 enemies with the 'enemy' image in the group
        // The enemeies are "dead" by default, so they are not visible in the game
        this.enemies.createMultiple(10, 'enemy');
        
        myGame.time.events.loop(2200, this.addEnemy, this);
        
    },
    
    update: function(){
        
        //Check if player is outside the world
        
        if(!this.player.inWorld){
            this.playerDie();
        }
        
        
        myGame.physics.arcade.collide(this.player, this.walls);
        //Main game loop
        this.movePlayer();
        
        myGame.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
        
        
        //make the enemies and walls coollide
        myGame.physics.arcade.collide(this.enemies, this.walls);
        
        // Kill the player if they touch enemy
        myGame.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
        
    },    
    
    movePlayer: function() {
        
        //IF left arrow key
        if(this.cursor.left.isDown) {
            // Move the player to the left
            this.player.body.velocity.x = -200;
        }
        
        
        //if Right arrow Key
        else if(this.cursor.right.isDown) {
            // Move the player to the right
            this.player.body.velocity.x = 200;
        }
        /*else if(this.cursor.down.isDown) {
            // Move the player to the right
            this.player.body.velocity.y = 200;
        }  
        else if(this.cursor.up.isDown) {
            // Move the player to the right
            this.player.body.velocity.y = -360;
        }
        
        */
        //if none
        else{
            // Move the player to the left
            this.player.body.velocity.x = 0;
           // this.player.body.velocity.y = 0;
        }
        
        //if Up arrow key
        if(this.cursor.up.isDown && this.player.body.touching.down) {
            // Make the player jump
            this.player.body.velocity.y = -320;
        }
    },
    
    createWorld: function(){
        
        // Create a wall group with Arcade physics
        this.walls = myGame.add.group();
        this.walls.enableBody = true;
        
        // Create 10 walls 
        
        myGame.add.sprite(0, 0, 'wallV', 0, this.walls); // left wall
        myGame.add.sprite(480, 0, 'wallV', 0, this.walls); // Right wall
        
        myGame.add.sprite(0, 0, 'wallH', 0, this.walls); // Top Left
        myGame.add.sprite(300, 0, 'wallH', 0, this.walls); // top right
        myGame.add.sprite(0, 320, 'wallH', 0, this.walls); // Bottom left
        myGame.add.sprite(300, 320, 'wallH', 0, this.walls); // Bottom right
         
         
        myGame.add.sprite(-100, 160, 'wallH', 0, this.walls); // Middle left
        myGame.add.sprite(400, 160, 'wallH', 0, this.walls); // Middle right
         
         
        var middleTop = myGame.add.sprite(100, 80, 'wallH', 0, this.walls); 
         middleTop.scale.setTo(1.5, 1);
        var middleBottom = myGame.add.sprite(100, 240, 'wallH', 0, this.walls); 
        middleBottom.scale.setTo(1.5, 1);
        
        
        // Set all the walls to be immovable
        this.walls.setAll('body.immovable', true);
        
    },
    
    playerDie: function(){
        myGame.state.start('gstate');
    },
    
    takeCoin: function(player, coin) {
        // Increase the score by 5
        this.score +=5;
        
        // Update the score label
        this.scoreLabel.text = 'score: '+ this.score;
        
        //Change the coin position
        this.updateCoinPosition();
        
    },
    
    updateCoinPosition: function() {
        // Store all possible coin location in an array
        var coinPosition = [
            {x:140, y:60}, // Top row
            {x:360, y:60}, // Top row
            {x:60, y:140}, // Middle row
            {x:440, y:140}, // Middle row
            {x:130, y:300}, // Bottom row
            {x:370, y:300} // Bottom row
            
        ];
            
        //Remove the current coin position from the array
        // Otherwise the coin could appear in a wall :( 
        for (var i=0; i < coinPosition.length; i++) {
            if (coinPosition[i].x === this.coin.x) {
                coinPosition.splice(i, 1);
            }
        }
        
        // Randomly select a position from the array
        var newPosition = coinPosition[
            myGame.rnd.integerInRange(0, coinPosition.length-1)
        ];
        
        // Set the new position of the coin
        this.coin.reset(newPosition.x, newPosition.y);
    },

    addEnemy: function (){
        // Get the first dead enemy in the group
        var enemy = this.enemies.getFirstDead();
        
        // If there isn't a dead enemy, do nothing
        if (!enemy){
            return;
        }
        
        // Initialise the enemy
        enemy.anchor.setTo(0.5, 1);
        enemy.reset(myGame.world.centerX, 0);
        enemy.body.gravity.y = 500;
        enemy.body.velocity.x = 100 * Phaser.Math.randomSign();
        enemy.body.bounce.x = 1;
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
        
    }
    
    
};









myGame.state.add('gstate', myState, true);

/*



































*/