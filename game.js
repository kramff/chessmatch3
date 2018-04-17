// game.js: main game file for chess match 3 game

// misc sources:
// https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces

// var gameCanvas;
let app = new PIXI.Application({width: 512, height: 512});

var pieceTypes = ["king", "queen", "rook", "bishop", "knight", "pawn"];
var pieceColors = ["black", "green", "red", "white", "yellow"];

var gameGrid;

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
			var gameSquare = CreateGameSquare(i, j, CreateRandomPiece());
			gameRow.push(gameSquare);
		}
	}
}

function CreateGameSquare (x, y, piece) {
	return {
		x: x,
		y: y,
		piece: piece,
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