// game.js: main game file for chess match 3 game

// misc sources:
// https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces

// var gameCanvas;
let app = new PIXI.Application({width: 512, height: 512});

var pieceTypes = ["king", "queen", "rook", "bishop", "knight", "pawn"];
var pieceColors = ["black", "green", "red", "white", "yellow"];

var gameGrid;

var SQUARE_SIZE = 50;

var scorebox;
var score = 0;

var resetbox;

// Things to do before loading game
function Main () {
	// console.log("wew");

	// gameCanvas = document.getElementById("gameCanvas");
	// ctx = gameCanvas.getContext("2d");

	document.body.appendChild(app.view);
	app.renderer.backgroundColor = 0xF0F0F0;
	app.renderer.view.style.position = "absolute";
	app.renderer.view.style.display = "block";
	app.renderer.autoResize = true;

	addEventListener("resize", ResizeFunc);
	ResizeFunc();

	LoadImages();

	scorebox = document.getElementById("scorebox");

	resetbox = document.getElementById("resetbox");

	resetbox.onclick = ResetFunc;
}

function FinishLoadingFunc () {
	CreateGameGrid();
}

function ResetFunc () {
	for (var i = 0; i < 8; i++)
	{
		for (var j = 0; j < 8; j++)
		{
			app.stage.removeChild(gameGrid[i][j].sprite);
		}
	}
	CreateGameGrid();
	score = 0;
	UpdateScore();
}

function UpdateScore () {
	scorebox.textContent = "Score: " + score;
}

function ResizeFunc () {
	// app.renderer.resize(window.innerWidth, window.innerHeight);
	app.renderer.resize(400, 400);
}

function LoadImages () {
	var loadArray = [];
	for (var i = 0; i < pieceColors.length; i++)
	{
		var pieceColor = pieceColors[i];
		for (var j = 0; j < pieceTypes.length; j++)
		{
			var pieceType = pieceTypes[j];
			var fileName = GetPieceImageFilename(pieceType, pieceColor);
			loadArray.push(fileName);
		}
	}
	PIXI.loader.add(loadArray);
	PIXI.loader.load(FinishLoadingFunc);
}

function GetPieceImageFilename (pieceType, pieceColor) {
	var fileName = "images/pieces/" + pieceColor + "/" + pieceType + ".png";
	return fileName;
}

function CreateGameGrid () {
	gameGrid = [];
	for (var i = 0; i < 8; i++)
	{
		// Row
		var gameRow = [];
		gameGrid.push(gameRow);
		for (var j = 0; j < 8; j++)
		{
			// Column

			// Create square with random piece in it
			var gameSquare = CreateGameSquare(i, j, CreateRandomPiece());
			gameRow.push(gameSquare);

			// Get piece's filename
			var pieceFilename = GetPieceImageFilename(gameSquare.piece.type, gameSquare.piece.color);

			// Make a sprite for each gameSquare
			var pieceSprite = new PIXI.Sprite(PIXI.loader.resources[pieceFilename].texture);
			app.stage.addChild(pieceSprite);

			// Keep reference to sprite
			gameSquare.sprite = pieceSprite;

			// Set sprite position
			pieceSprite.x = i * SQUARE_SIZE;
			pieceSprite.y = j * SQUARE_SIZE;
		}
	}
	FinishSettingUpGame();
}

function CreateGameSquare (x, y, piece) {
	return {
		x: x,
		y: y,
		piece: piece,
		sprite: undefined,
	};
}

function CreateRandomPiece () {
	return {
		type: RandomPieceType(),
		color: RandomPieceColor(),
	}
}

function RandomPieceType () {
	return pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
}

function RandomPieceColor () {
	return pieceColors[Math.floor(Math.random() * pieceColors.length)];
}

var draggingSprite;
function FinishSettingUpGame () {

	draggingSprite = new PIXI.Sprite();
	app.stage.addChild(draggingSprite);

	// Mouse input
	window.addEventListener("mousedown", DoMouseDown);
	window.addEventListener("mousemove", DoMouseMove);
	window.addEventListener("mouseup", DoMouseUp);
	window.addEventListener("contextmenu", DoContextMenu);
}

var mouseX = 0;
var mouseY = 0;
var mousePressed = false;
var draggedSquare;
var pieceHeld = false;

function DoMouseDown () {

	mouseX = event.clientX;
	mouseY = event.clientY;
	mousePressed = true;

	squareX = Math.floor(mouseX / SQUARE_SIZE);
	squareY = Math.floor(mouseY / SQUARE_SIZE);

	draggedSquare = GetSquareAtCoord(squareX, squareY);

	// square exists
	if (draggedSquare !== undefined)
	{
		// square has a piece
		if (draggedSquare.piece !== undefined)
		{
			pieceHeld = true;
			draggedSquare.sprite.alpha = 0.5;
			draggingSprite.x = mouseX - (SQUARE_SIZE / 2);
			draggingSprite.y = mouseY - (SQUARE_SIZE / 2);
			draggingSprite.texture = draggedSquare.sprite.texture;
			draggingSprite.alpha = 1;
		}
	}
}

function DoMouseMove () {
	mouseX = event.clientX;
	mouseY = event.clientY;

	if (pieceHeld)
	{
		draggingSprite.x = mouseX - (SQUARE_SIZE / 2);
		draggingSprite.y = mouseY - (SQUARE_SIZE / 2);
	}
}

var droppedSquare;
function DoMouseUp () {
	if (pieceHeld)
	{

		squareX = Math.floor(mouseX / SQUARE_SIZE);
		squareY = Math.floor(mouseY / SQUARE_SIZE);

		droppedSquare = GetSquareAtCoord(squareX, squareY);
		var successfulDrop = false;
		// Make sure it isn't dropped onto same square
		if (droppedSquare !== draggedSquare)
		{
			// Make sure it is a valid chess movement
			var validMovement = CheckChessMove(draggedSquare, droppedSquare);
			if (validMovement)
			{
				// Set dropped square's piece to dragged square's piece
				droppedSquare.sprite.texture = draggedSquare.sprite.texture;
				droppedSquare.piece = draggedSquare.piece;
				droppedSquare.sprite.alpha = 1;

				// Set dragged square's piece to nothing
				draggedSquare.piece = undefined;
				draggedSquare.sprite.alpha = 0;

				successfulDrop = true;

				// Check for matches here
				EvaluateMatches();
			}
		}

		// Did not drop, return to normal
		if (!successfulDrop)
		{
			draggedSquare.sprite.alpha = 1;	
		}




		draggingSprite.alpha = 0;
		pieceHeld = false
	}
}

function DoContextMenu () {

}

function GetSquareAtCoord (squareX, squareY) {
	if (squareX < 0 || squareX >= 8 || squareY < 0 || squareY >= 8)
	{
		return undefined;
	}
	else
	{
		return gameGrid[squareX][squareY];
	}
}

function CheckChessMove(dragSquare, dropSquare) {
	var pieceType = dragSquare.piece.type;
	var moveX = Math.abs(dropSquare.x - dragSquare.x);
	var moveY = Math.abs(dropSquare.y - dragSquare.y);

	switch (pieceType)
	{
		case "king":
			// King: 1 in any direction
			if (moveX <= 1 && moveY <= 1)
			{
				return true;
			}
		break;
		case "queen":
			// Queen: Any distance, horizontal or vertical or diagonally
			if (moveX === 0 || moveY === 0 || moveX === moveY)
			{
				return true;
			}
		break;
		case "rook":
			// Rook: Any distance, horizontal or vertical
			if (moveX === 0 || moveY === 0)
			{
				return true;
			}
		break;
		case "bishop":
			// Bishop: Any distance, only diagonally
			if (moveX === moveY)
			{
				return true;
			}
		break;
		case "knight":
			// Knight: 1 Horizontal 2 Vertical, or 2 Horizontal 1 Vertical
			if ((moveX === 1 && moveY === 2) || (moveX === 2 && moveY === 1))
			{
				return true;
			}
		break;
		case "pawn":
			// Pawn: 1 Diagonally
			if (moveX === 1 && moveY === 1)
			{
				return true;
			}
		break;
	}
	return false;
}

function EvaluateMatches () {

	var matchColor;
	var matchX = 0;
	var matchY = 0;
	var matchDist = 1;
	var matching = false;

	// Evaluate columns
	for (var i = 0; i < 8; i++) {

		var gameRow = gameGrid[i];
		matching = false;
		matchDist = 1;


		for (var j = 0; j < 8; j++) {

			var gameSquare = gameRow[j];
			var piece = gameSquare.piece

			// Piece must exist
			if (piece !== undefined)
			{
				if (matching)
				{
					if (matchColor === piece.color)
					{
						matchDist += 1;
					}
					else
					{
						if (matchDist >= 3)
						{
							FinishMatch(matchX, matchY, matchDist, true);
						}
						matchDist = 1;
					}
				}
				matchColor = piece.color;
				matchX = i;
				matchY = j;
				matching = true;
			}
			// No piece
			else
			{
				if (matchDist >= 3)
				{
					FinishMatch(matchX, matchY, matchDist, true);
				}
				matching = false;
				matchDist = 1;
			}


		}
		// Finish match at end of column
		if (matchDist >= 3)
		{
			FinishMatch(matchX, matchY, matchDist, true);
		}
	}
}

function FinishMatch (matchX, matchY, matchDist, vertical) {
	for (var i = 0; i < matchDist; i++) {
		var gameSquare;
		if (vertical)
		{
			gameSquare = gameGrid[matchX][matchY - i];
		}
		else
		{
			gameSquare = gameGrid[matchX - i][matchY];
		}
		gameSquare.piece = undefined;
		gameSquare.sprite.alpha = 0;
	}

	score += matchDist * 100;
	UpdateScore();
}
