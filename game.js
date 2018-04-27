// game.js: main game file for chess match 3 game

// misc sources:
// https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces

// var gameCanvas;
let app = new PIXI.Application({width: 512, height: 512});

var pieceTypes = ["king", "queen", "rook", "bishop", "knight", "pawn"];
var pieceColors = ["black", "green", "red", "white", "yellow"];

var gameGrid;

var SQUARE_SIZE = 50;

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
}

function FinishLoadingFunc () {
	CreateGameGrid();
}

function ResizeFunc () {
	app.renderer.resize(window.innerWidth, window.innerHeight);
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
	for (var i = 0; i < 8; i++) {
		// Row
		var gameRow = [];
		gameGrid.push(gameRow);
		for (var j = 0; j < 8; j++) {
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

function DoMouseUp () {
	if (pieceHeld)
	{
		pieceHeld = false
		draggedSquare.sprite.alpha = 1;
		draggingSprite.alpha = 0;
	}
}

function DoContextMenu () {

}

function GetSquareAtCoord (squareX, squareY) {
	if (squareX < 0 || squareX > 8 || squareY < 0 || squareY > 8)
	{
		return undefined;
	}
	else
	{
		return gameGrid[squareX][squareY];
	}
}