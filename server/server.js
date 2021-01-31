// npm install ws

const ws = require("ws")
const fs = require("fs")

// u really thought i was gonna use nodejs best practices?
eval(fs.readFileSync("../raus.js").toString())


// run a game without any preference about what communication method you're using
// takes function to alert a player with a given number about a thing
// also takes a game over callback, which it calls with the finished game
// returns function for when a client sends a thing
function serveGameAbstract(numPlayers, msgToClient, gameOver) {
	let game = generateGame(numPlayers)

	function bumpPlayer(plrNum) {
		msgToClient(plrNum,JSON.stringify(game))
	}
	function bumpAllPlayers() {
		const ser = JSON.serialize(game)
		for (var i = 0; i < numPlayers; i++)
			msgToClient(i,ser)
	}

	return function(plrNum, msg) {
		let alreadyBumpedPlayer = false
		if (plrNum == game.dran) {
			let newGame = null
			if (msg == "drawCard")
				newGame = game.drawCard()
			else if (msg == "endTurn")
				newGame = game.endTurn()
			else if (msg.substring(0,"playCard ".length) == "playCard ") {
				n = parseInt(msg.substring("playCard ".length))
				if (n !== NaN)
					newGame = game.playCard(n)
			}
			if (newGame != null) {
				game = newGame
				bumpAllPlayers()
				alreadyBumpedPlayer = true
				if (game.gameIsOver())
					gameOver(game)
			}
		}
		if (!alreadyBumpedPlayer)
			bumpPlayer(plrNum)
	}
}

//let game = generateGame(6)
//console.log(gameFromJSON(JSON.stringify(game)))
