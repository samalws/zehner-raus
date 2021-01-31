// npm install ws

const ws = require("ws")
const fs = require("fs")

// u really thought i was gonna use nodejs best practices?
eval(fs.readFileSync("../raus.js").toString())


// ticker.removeListener('tick', tickListener);


// run a game without any preference about what communication method you're using
// takes function to alert a player with a given number about a thing
// also takes a game over callback, which it calls with the finished game
// returns function for when a client sends a thing
function serveJustGame(numPlayers, msgToClient, gameOver) {
	let game = generateGame(numPlayers)

	const bumpPlayer = (plrNum) => msgToClient(plrNum,JSON.stringify(game))
	const bumpAllPlayers = () => {
		const ser = JSON.serialize(game)
		for (var i = 0; i < numPlayers; i++)
			msgToClient(i,ser)
	}

	return (plrNum, msg) => {
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

function serveGameWithExtraStuff(conns,doneCallback) {
	// TODO what if someone disconnects

	const numPlayers = conns.length
	const msgToClient = ((plrNum, msg) => conns[plrNum].send("0" + msg))
	const gameOver = ((finalGame) => console.log("ok game over what do i do now"))

	const receivedMsgEvent = serveGameAbstract(numPlayers, msgToClient, gameOver)

	for (plrNum in conns) {
		const conn = conns[plrNum]
		conn.on("message",(msg) => {
			const msg1 = msg.substring(1)
			switch (msg[0]) {
			case "0": // make a move / ask for game state
				receivedMsgEvent(plrNum, msg1)
				break
			case "1": // chat
				for (var i = 0; i < numPlayers; i++)
					conns[plrNum].send("1" + plrNum + ":" + msg1))
			}
		})
	}
}

function connListener(conn,lobbies) {
	// TODO what if stuff errors
	let myLobby = null
	let myLobbyName = null
	conn.on("message",(msg) => {


		if (msg == "leaveLobby" && myLobby != null) {
			let myIndex = NaN
			for (i in lobbies[myLobby])
				if (lobbies[myLobby][i][0] == conn)
					myIndex = i
				else
					lobbies[myLobby][i][0].send("plrLeaving "+myLobbyName)
			myLobby = null
			myLobbyName = null
			conn.send("left lobby")


		} else if (msg.substring(0,"joinLobby ".length) == "joinLobby ") {
			const n = parseInt(msg.substring("joinLobby ".length).split(","))
			// TODO oh god mutex stuff
			if (n !== NaN) { // TODO oh god oh fuck names
				let myNameTaken = false
				for (i in lobbies[n])
					if (i[1] == name) {
						myNameTaken = true
						break
					}
				if (!myNameTaken) {
					for (i in lobbies[n])
						lobbies[myLobby][i][0].send("plrJoining "+name)
					lobbies[myLobby] = lobbies[myLobby].concat([conn,name])
					myLobby = n
					myLobbyName = name
					conn.send("joined lobby")
				}
			}


		} else if (msg.substring(0,"startLobby ".length) == "startLobby ") {
			


		} else if (msg == "startGame") {
			let plrNamesString = ""
			const connsList = []
			for (i in lobbies[myLobby]) {
				const name = lobbies[myLobby][i][1]
				plrNamesString += ""+name.length+":"+name
				connsList = connsList.concat(lobbies[myLobby][i][0])
			}
			for (i in lobbies[myLobby])
				lobbies[myLobby][i].send("starting game "+plrNamesString)
			serveGameWithExtraStuff(connsList,() => ()) // TODO done callback
		}
	})
}
function serveSocket(socket) {
	const lobbies = []
	const games = []

	socket.on("connection", connListener)
}

//let game = generateGame(6)
//console.log(gameFromJSON(JSON.stringify(game)))
