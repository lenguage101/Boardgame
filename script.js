let gameSquares = [];
let arrayForPlayers = [];
let currentPlayer;
let displayCurrentPlayer;

//Makes sure the Dom is ready to go and waits for everything to render
$( document ).ready(() => {
    //Creates the grid and proportionally divides each squares
    class Grid {
        constructor(){
            this.inputNumber;
            this.pixelWidth;
            this.pixelHeight;
        }
        updatePixelWidthAndHeight() {
            this.inputNumber = Math.floor(Number($('#inputNumber').val()));
            this.pixelWidth = canvas.width / this.inputNumber;
            this.pixelHeight = canvas.height / this.inputNumber;
       }
    }
    //Creates the Square class to be used for basis of the grid
    class Square {
        constructor(url, x, y, width, height, item) {
            this.url = null;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.item = item;
            this.white = true;
        }  
        draw() {
            // pixelWidth = canvas.width / inputNumber;
            // pixelHeight = canvas.height / inputNumber;
            if (this.white) {
                c.fillStyle = 'rgba(255, 255, 255, 1)';             
            } else {
                c.fillStyle = 'rgba(211, 211, 211, 1)';
            }
            c.fillRect(this.x * grid.pixelWidth, this.y * grid.pixelHeight, this.width, this.height);
        }
    }
    //Creates the Player class
    class Player {
        constructor(url, x, y, width, height, item){ 
            this.url = url;
            this.x = x;
            this.y = y; 
            this.width = width;
            this.height = height;
            this.item = item;
            this.weapon = null;
            this.weaponToDrop = () => {};
            this.wasWeaponOnSquare = false;
        }
        playerInfo(life) {
            this.life = life;
            this.attackedLifePoints = 0; 
            this.attack = () => {
               let updatedAttackedLifePoints = this.weapon.damage;
               return updatedAttackedLifePoints;
            };
            this.defend = () => {
                this.attackedLifePoints = this.attackedLifePoints / 2;
                return this.attackedLifePoints;
            };
        }
        draw() {
            drawingImage(this.url, this.x, this.y, this.width, this.height);
        }
    }
    //Creates the Weapon class
    class Weapon {
        constructor(url, x, y, width, height, item) {
            this.url = url;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.item = item;
        } 
        weaponInfo(damage, name) {
            this.damage = damage;
            this.name = name;
        }
        draw() {
            drawingImage(this.url, this.x, this.y, this.width, this.height);
        }
    }
    //Creates the Blocked class
    class Blocked {
        constructor(url, x, y, width, height, item) {
            this.url = url;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.item = item;
        }  
        draw() {
            drawingImage(this.url, this.x, this.y, this.width, this.height);
        }
    }

    let loadRemaining = 0;
    let loadImage = (src, alt) => {
        loadRemaining++;
        let newImage = new Image();
        newImage.src = src;
        newImage.alt = alt;
        newImage.onload = () => loadRemaining--;
        return newImage;
    }
    //Pictures for players
    let luigi = loadImage('photos/lugi-player-1.PNG', 'Luigi');
    let mario = loadImage('photos/mario-player-2.PNG', 'Mario');
    let players = [luigi, mario];
    //Default weapon for each player
    let luigiDefault = loadImage('photos/luigi-default.JPG', 'mushroom');
    let marioDefault = loadImage('photos/mario-default.JPG', 'mushroom');
    let playerDefaultWeapon = [luigiDefault, marioDefault];

    //Pictures for weapons
    let knife = loadImage('photos/knife.JPG', 'knife');
    let handgun = loadImage('photos/handgun.JPG', 'handgun');
    let molotov = loadImage('photos/molotov-cocktail.JPG', 'molotov');
    let machineGun = loadImage('photos/machine-gun.JPG', 'machine-gun');
    let weapons = [knife, handgun, molotov, machineGun];
    //Weapon's attack damage
    let weaponDamage = 20;
    let addDamage = 10; 
    //How many weapons to display in the game
    let minusOneWeapon = 1;
    let minusTwoWeapons = 2;

    //Picture for unavailable block
    let block = loadImage('photos/unavailable.JPG', 'unavailable');
    let blockArray = [block];
    //How many unavailable blocks to display in the game
    let increaseBlockedLength = 3;
    let addBlocks = 4;
    let addDoubleBlocks = addBlocks * 2;
    
    //Item information
    const ITEM_ZERO = 0;
    const ITEM_PLAYER = 1;
    const ITEM_WEAPON = 2;
    const ITEM_UNAVAILABLE = 3;

    //Canvas Info
    let canvas = $('canvas')[0];
    canvas.width = Math.round(window.innerHeight * .80);
    canvas.height = Math.round(window.innerHeight* .80);
    let c = canvas.getContext('2d');

    let button = $('#buttonGrid');
     
    let grid = new Grid();
    let drawingImage = (url, x, y, width, height) => c.drawImage(url, x * grid.pixelWidth, y * grid.pixelHeight, width, height);
    //Click event to checks if the input is a valid number within the parameters 
    //If true create the square and push into gameSquares array
    //Else output a message to do so 
    button.click(() => {
        gameSquares = [];
        arrayForPlayers = [];
        grid.updatePixelWidthAndHeight();
        //Checks if the input's value is between 7 and 10
        if (grid.inputNumber >= 7 && grid.inputNumber <= 10) {  
            for (let i = 0; i < grid.inputNumber; i++){
                gameSquares.push([]);
                let x = i;    
                let y = 0;      
                for (let j = 0; j < grid.inputNumber; j++){
                    y=j;
                    gameSquares[i].push(new Square(null, x, y, grid.pixelWidth, grid.pixelHeight, ITEM_ZERO));  
                    gameSquares[i][j].white = isWhite(x, y);
                }  
            }
            initalizeGrid();
            statusForPlayers();
        } else {
            $('.message').addClass('displaying').html('Please enter a number between 7 and 10');
            return;
        } 
    })  
    //KeyPress event handler
    $('body').on('keypress', (event) => {
        if (arrayForPlayers.length === 2) {
            let nearby = checksIfPlayersAreNearby();
            let gameOver = ((arrayForPlayers[0].life <= 0) || (arrayForPlayers[1].life <= 0)) ? true : false; 
            if (gameOver) {
                let winningPlayer = arrayForPlayers[0].life <= 0 ? 'Mario' : 'Luigi';
                // statusForPlayers();
                $('.message').addClass('displaying').html('Game Over! ' + winningPlayer + ' is the winner. Click the `New Grid` Button to start another game!');
                return;
            } else if (nearby) {
                let fightingDecision = attackOrDefend();
                if (fightingDecision === 1) {
                    let defendingPlayer = currentPlayer === arrayForPlayers[0] ? arrayForPlayers[1] : arrayForPlayers[0];
                    let updatedAttackedLifePoints = currentPlayer.attack(currentPlayer);
                    defendingPlayer.attackedLifePoints = updatedAttackedLifePoints; 
                } else if (fightingDecision === 2) {
                    currentPlayer.defend();
                }
                currentPlayer.life = currentPlayer.life - currentPlayer.attackedLifePoints;  
                statusForPlayers();
                endingOfTurn();
                gameOver = ((arrayForPlayers[0].life <= 0) || (arrayForPlayers[1].life <= 0)) ? true : false;             
                if (gameOver) {
                    let winningPlayer = arrayForPlayers[0].life <= 0 ? 'Mario' : 'Luigi';
                    $('.message').addClass('displaying').html('Game Over! ' + winningPlayer + ' is the winner. Click the `New Grid` Button to start another game!');
                }
            } else {
                //Triggers event handler when 'w', 's', 'a', or 'd' is pressed
               movePlayer(event.keyCode, gameSquares.length, gameSquares); 
            }
        }
    })
    // Checks players x's and y's coordinates are next to each other 
    let checksIfPlayersAreNearby = () => {
        if (arrayForPlayers.length === 2) {
            let playerOne = arrayForPlayers[0];
            let playerTwo = arrayForPlayers[1];
            let nearby;
            if ((Math.abs(playerOne.x - playerTwo.x) === 0 && Math.abs(playerOne.y - playerTwo.y) === 1) ||
                (Math.abs(playerOne.y - playerTwo.y) === 0 && Math.abs(playerOne.x - playerTwo.x) === 1)) {
                nearby = true;
            } else {
                nearby = false;
            }
            return nearby;
        }
    }
    //Choose whether to 'attack' or 'defend'
    let attackOrDefend = () => {
        let numberOfSpaces = prompt(displayCurrentPlayer + '. Would you like to attack or defend? Press "1" for attack or "2" for defend' );
        let fightingDecision;
        let oneOrTwo = parseInt(numberOfSpaces);
        if (oneOrTwo !== 1 && oneOrTwo !== 2) {
            fightingDecision = attackOrDefend(); 
        } else {
            fightingDecision = oneOrTwo;
        } 
        return fightingDecision;
    }
    //Determines if a square is white or gray
    let isWhite = (x, y) => {
        let white;
        white = x % 2 === 0 ? white = false : true;
        white = y % 2 === 1 ? white = !white : white; 
        return white;
    }
    //Creates the grid
    let initalizeGrid = () => {
        //Number of randomized Classes increases based on the size of the grid
        squared = Math.pow(gameSquares.length, 2);
        let newPlayerLength = players.length;
        let newWeaponLength;
        let newBlockLength = blockArray.length * increaseBlockedLength;
        displayCurrentPlayer = 'Mario';
        if (squared === 49) {
           newWeaponLength = weapons.length - minusTwoWeapons;
        } else if (squared <= 99) {
           newWeaponLength = weapons.length - minusOneWeapon;
           newBlockLength = newBlockLength + addBlocks;
        } else if (squared === 100) {
           newWeaponLength = weapons.length;
           newBlockLength = newBlockLength + addDoubleBlocks;     
        }  
        randomizeAllClasses(newWeaponLength, newBlockLength, newPlayerLength);
        $('.message').addClass('displaying').html('Current Player: ' + displayCurrentPlayer);             
        animate();
    }
    //Run a for loop and randomizes the Weapon, Blocked, and Player Classes
    let randomizeAllClasses = (weaponsArrLength, blockedArrLength, playersArrLength) => {
        for (let j = 0; j < weaponsArrLength; j++) {
            randomized(j, weapons, new Weapon(), weaponDamage, ITEM_WEAPON, weapons[j].alt);        
        }
        for (let j = 0; j < blockedArrLength; j++) {
            randomized(1, blockArray, new Blocked(), null, ITEM_UNAVAILABLE);
        }
        for (let j = 0; j < playersArrLength; j++) {
            randomized(j, players, new Player(), null, ITEM_PLAYER); 
        }
    }
    //Places an item randomly on the grid
    let randomized = (randomNum, img, placeSomething, damage, item, name) => {    
        for (let i = randomNum; i <= randomNum; i++) {
            let x = Math.floor(Math.random() * gameSquares.length);
            let y = Math.floor(Math.random() * gameSquares.length);  
            //Checks if the two players coordinates don't neighbor each other
            if (arrayForPlayers.length === 1) {
                let playerOne = arrayForPlayers[0];
                let nearby = true;
                while (nearby) {
                    if ((Math.abs(playerOne.x - x) === 0 && Math.abs(playerOne.y - y) === 1) ||
                        (Math.abs(playerOne.y - y) === 0 && Math.abs(playerOne.x - x) === 1)) {
                        nearby = nearby;
                        x = Math.floor(Math.random() * gameSquares.length);
                        y = Math.floor(Math.random() * gameSquares.length);
                    } else {
                        nearby = !nearby;
                    }
                }
            }
            //If the item is 0 then change it to a Number between 1 and 3 for since each number 
            //represents different Classes for Player, Weapon, and Blocked.
            if (gameSquares[x][y].item === ITEM_ZERO) {
                createNewClassOnSquare(placeSomething, x, y, item);
                if (placeSomething.item === ITEM_UNAVAILABLE) {
                   placeSomething.url = img[0];
                } else if (placeSomething.item === ITEM_WEAPON) {  
                    damage = damage + addDamage * i;
                    name = name;
                    placeSomething.weaponInfo(damage, name);
                    placeSomething.url = img[i];
                } else {
                    placeSomething.url = img[i];
                    placeSomething.playerInfo(100);
                    placeSomething.weapon = new Weapon(playerDefaultWeapon[i], x, y, grid.pixelWidth, grid.pixelHeight, ITEM_WEAPON);
                    placeSomething.weapon.weaponInfo(10, 'mushroom');
                    arrayForPlayers.push(placeSomething);
                    currentPlayer = placeSomething;
                }
            }
            //Else run through it again to find an available Square 
            else {
                i--;
            }
        }
    }
    //Helper function to add properties to any Class
    let updateSquareInfoProperties = (placeSomething, x, y, item) => {
        placeSomething.x = x;
        placeSomething.y = y;
        placeSomething.width = grid.pixelWidth;
        placeSomething.height = grid.pixelHeight;
        placeSomething.item = item;
    }
    //Create new Class on assigned Squares and uses the previous Square's properties for the Class' properties 
    let createNewClassOnSquare = (placeSomething, x, y, item) => {
        gameSquares[x][y] = placeSomething;
        updateSquareInfoProperties(placeSomething, x, y, item);
    } 
    //Moves player in cardinal directions
    let movePlayer = (keyCode) => {
        let noChange = 0;
        switch (keyCode) {
            case 119:
            let up = verifyCorrectNumberOfSpaces();
            determinesWhichDirection(up, noChange, -up);
            break;
            case 115: 
            let down = verifyCorrectNumberOfSpaces();
            determinesWhichDirection(down, noChange, down);
            break;
            case 97: 
            let left = verifyCorrectNumberOfSpaces();
            determinesWhichDirection(left, -left, noChange);
            break;
            case 100: 
            let right = verifyCorrectNumberOfSpaces();
            determinesWhichDirection(right, right, noChange);
            break;
        }
    }
    //Check if '0' was pressed and if not then moves to the corresponding location
    let determinesWhichDirection = (num, leftRight, upDown) => {
        let zero = 0;
        if (num === zero) {
            $('.message').html('Current Player: ' + displayCurrentPlayer + '<p>You have chosen 0 to return.</p>');
            return;
        } else {
            updatePlayerLocation(leftRight, upDown);
        }
    }
    //Prompts user for spaces between 1 and 3
    let verifyCorrectNumberOfSpaces = () => {
        let numberOfSpaces = prompt(displayCurrentPlayer + '. How many spaces would you like to move? Enter a number between 1 and 3 or pressed `0` to return' );
        let num;
        let parseNumberOfSpaces = parseInt(numberOfSpaces);
        if (parseNumberOfSpaces === 0) {
            num = 0;
        } else if (parseNumberOfSpaces !== 1 && parseNumberOfSpaces !== 2 && parseNumberOfSpaces !== 3) {
            num = verifyCorrectNumberOfSpaces(); 
        } else {
            num = parseNumberOfSpaces;
        } 
        return num;
    }
    //Updates the Player to the assigned location
    let updatePlayerLocation = (horizontal, vertical) => verifyPath(currentPlayer.x, currentPlayer.y, horizontal, vertical);
    //Checks to see the path is blocked
    let verifyPath = (x, y, horizontal, vertical) => {
        let verifyClearPath;
        let newX = x + horizontal;
        let newY = y + vertical;
        verifyClearPath = horizontal === 0 ? vertical : verifyClearPath;
        verifyClearPath = vertical === 0 ? horizontal : verifyClearPath; 
        for (let z = 1; z <= Math.abs(verifyClearPath); z++) {
            //Current player can not cross if there is an unavailable block, player, or weapon in its path
            if ((verifyClearPath < 0 && verifyClearPath === horizontal) && (gameSquares[x - z] === undefined) || 
                (verifyClearPath > 0 && verifyClearPath === horizontal) && (gameSquares[x + z] === undefined) ||
                (verifyClearPath < 0 && verifyClearPath === vertical) && (gameSquares[newX][y - z] === undefined) || 
                (verifyClearPath > 0 && verifyClearPath === vertical) && (gameSquares[newX][y + z] === undefined)) {
                $('.message').html('Current Player: ' + displayCurrentPlayer + '<p>Going out of bounds is not allowed.</p>');
                return;
            }
            else if (
               ((verifyClearPath < 0 && verifyClearPath === horizontal) && (gameSquares[x - z][newY].item === ITEM_UNAVAILABLE)) || 
               ((verifyClearPath > 0 && verifyClearPath === horizontal) && (gameSquares[x + z][newY].item === ITEM_UNAVAILABLE)) || 
               ((verifyClearPath < 0 && verifyClearPath === vertical) && (gameSquares[newX][y - z].item === ITEM_UNAVAILABLE)) ||
               ((verifyClearPath > 0 && verifyClearPath === vertical) && (gameSquares[newX][y + z].item === ITEM_UNAVAILABLE)) ) {
                displayIncorrectPathMessageForBlockedSquares();
                return;
            } else if (
               ((verifyClearPath < 0 && verifyClearPath === horizontal) && (gameSquares[x - z][newY].item === ITEM_PLAYER)) || 
               ((verifyClearPath > 0 && verifyClearPath === horizontal) && (gameSquares[x + z][newY].item === ITEM_PLAYER)) || 
               ((verifyClearPath < 0 && verifyClearPath === vertical) && (gameSquares[newX][y - z].item === ITEM_PLAYER)) ||
               ((verifyClearPath > 0 && verifyClearPath === vertical) && (gameSquares[newX][y + z].item === ITEM_PLAYER)) ) {
                displayIncorrectPathMessageForPlayer();
                return; 
            } else if (
               ((verifyClearPath < 0 && verifyClearPath === horizontal) && (gameSquares[x - z][newY].item === ITEM_WEAPON)) || 
               ((verifyClearPath > 0 && verifyClearPath === horizontal) && (gameSquares[x + z][newY].item === ITEM_WEAPON)) || 
               ((verifyClearPath < 0 && verifyClearPath === vertical) && (gameSquares[newX][y - z].item === ITEM_WEAPON)) ||
               ((verifyClearPath > 0 && verifyClearPath === vertical) && (gameSquares[newX][y + z].item === ITEM_WEAPON)) ) {
                if (z === (Math.abs(verifyClearPath))) {
                    takeNewWeaponAndUpdateWeaponToDrop(x, y, newX, newY);
                } else {
                    displayIncorrectPathMessageForWeapons();
                }      
                return;
            }
        }
        if (gameSquares[newX][newY] !== undefined && gameSquares[newX][newY].item === ITEM_ZERO ) {                      
            let newSquare = new Square();
            if (x === currentPlayer.weaponToDrop.x && y === currentPlayer.weaponToDrop.y) {
                updateSquareInfo(currentPlayer.weaponToDrop, x, y, x, y, currentPlayer.weaponToDrop.url, currentPlayer.weaponToDrop.item);
                currentPlayer.x = newX;
                currentPlayer.y = newY; 
                gameSquares[newX][newY] = currentPlayer;
                gameSquares[x][y] = currentPlayer.weaponToDrop;
                currentPlayer.wasWeaponOnSquare = false;
            } else {
                updateSquareInfo(newSquare, x, y, gameSquares[x][y].x, gameSquares[x][y].y, null, ITEM_ZERO);
                currentPlayer.x = gameSquares[newX][newY].x;
                currentPlayer.y = gameSquares[newX][newY].y; 
                gameSquares[newX][newY] = currentPlayer;
                gameSquares[x][y] = newSquare;
                currentPlayer.wasWeaponOnSquare = false;
            }
            statusForPlayers();
            endingOfTurn();
        }       
    }
    //Displays message for incorrect path for blocked squares
    let displayIncorrectPathMessageForBlockedSquares = () => {
        $('.message').html('Current Player: ' + displayCurrentPlayer 
                          + '<p>Hopping over unavailable blocks is not allowed. Please choose an available path.</p>');
    }    
    //Display message for incorrect path of players
    let displayIncorrectPathMessageForPlayer = () => {
        $('.message').html('Current Player: ' + displayCurrentPlayer 
                         + '<p>Hopping over another player is not allowed. Please choose an available path.</p>');
    }
    //Display message for incorrect path of weapons
    let displayIncorrectPathMessageForWeapons = () => {
        $('.message').html('Current Player: ' + displayCurrentPlayer 
                         + '<p>Hopping over weapons is not allowed. Please choose an available path.</p>');
    }
    //Take properties of new weapon and drop previous weapon
    let takeNewWeaponAndUpdateWeaponToDrop = (previousX, previousY, newX, newY) => {
        let oldWeapon = currentPlayer.weapon;       
        let newWeapon = gameSquares[newX][newY];
        let newSquare = new Square(); 
        if (currentPlayer.weaponToDrop instanceof Weapon) {
            if (currentPlayer.wasWeaponOnSquare) {
                updateSquareInfo(currentPlayer.weaponToDrop, previousX, previousY, previousX, previousY, currentPlayer.weaponToDrop.url, currentPlayer.weaponToDrop.item);
                gameSquares[newX][newY] = currentPlayer;
                gameSquares[previousX][previousY] = currentPlayer.weaponToDrop;   
            } else {
                updateSquareInfo(newSquare, previousX, previousY, previousX, previousY, null, ITEM_ZERO);
                gameSquares[newX][newY] = currentPlayer;
                gameSquares[previousX][previousY] = newSquare;
            }
        } else {
            updateSquareInfo(newSquare, previousX, previousY, previousX, previousY, null, ITEM_ZERO);
            gameSquares[newX][newY] = currentPlayer;
            gameSquares[previousX][previousY] = newSquare;
        } 
        oldWeapon.x = newX;
        oldWeapon.y = newY;  
        currentPlayer.x = newX;
        currentPlayer.y = newY; 
        currentPlayer.weaponToDrop = oldWeapon;
        currentPlayer.weapon = newWeapon;
        currentPlayer.wasWeaponOnSquare = gameSquares[previousX][previousY] === Square ? false : true;
        statusForPlayers();
        endingOfTurn();
    }
    //Update or create a class and its class' properties    
    let updateSquareInfo = (classInfo, previousX, previouxY, newX, newY, img, item) => {
        let placeSomething;
        if (item === ITEM_ZERO) {
            placeSomething = classInfo;
            placeSomething.white = isWhite(previousX, previouxY);
        } else if (item === ITEM_WEAPON){
            placeSomething = classInfo;
        } else {
           placeSomething = classInfo[previousX][previouxY];
           placeSomething.url = img;
        }
        updateSquareInfoProperties(placeSomething, newX, newY, item);
    }
    //Ending of turn
     let endingOfTurn = () => {
        showCurrentPlayerAndSwitchCurrentPlayer();
        $('.message').html('Current Player: ' + displayCurrentPlayer);
        animate();
    }
    //Update Status for Player One and Two
    let statusForPlayers = () => {
        let playerOneLife = arrayForPlayers[1].life <= 0 ? 0 : arrayForPlayers[1].life;
        let playerTwoLife = arrayForPlayers[0].life <- 0 ? 0 : arrayForPlayers[0].life;
        $('.playerOne').html( '<p>Player One: ' + arrayForPlayers[1].url.alt + '</p>' 
                            + '<p>Life Points: ' + playerOneLife + '</p>'
                            + '<p>Current Weapon: ' + arrayForPlayers[1].weapon.name + '</p>'
                            + '<p>Weapon Damage: ' +arrayForPlayers[1].weapon.damage + '</p><br>');
        $('.playerTwo').html( '<p>Player Two: ' + arrayForPlayers[0].url.alt + '</p>' 
                            + '<p>Life Points: '+ playerTwoLife + '</p>'
                            + '<p>Current Weapon: ' + arrayForPlayers[0].weapon.name + '</p>'
                            + '<p>Weapon Damage: ' + arrayForPlayers[0].weapon.damage + '</p>');
    }
    //Display current player through HTML
    let showCurrentPlayerAndSwitchCurrentPlayer = () => {
        displayCurrentPlayer = currentPlayer === arrayForPlayers[0] ? 'Mario' : 'Luigi';
        currentPlayer = currentPlayer === arrayForPlayers[0] ? arrayForPlayers[1] : arrayForPlayers[0];
    }
    //Clear and draw the canvas 
    let animate = () => {
        c.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < gameSquares.length; i++) {
            for(let j = 0; j < gameSquares.length; j++){
                gameSquares[i][j].draw();
            }
        }
    } 
});