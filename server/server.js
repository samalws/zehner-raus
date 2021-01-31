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

function userIsInALobby(conn,lobbies) {
	return lobbies.connToLobby[conn] !== null
}
function makeUserId(lobbyId,lobbies) {
	const lobby = lobbies[lobbyId]
	const idsTaken = []
	lobby.foreach((user) => idsTaken.splice(0,0,user.id))
	while (true) {
		const tryId = Math.floor(Math.random()*999999)
		if (!idsTaken.includes(tryId))
			return tryId	
	}
}
function makeLobbyId(lobbies) {
	while (true) {
		const tryId = Math.floor(Math.random()*999999)
		if (lobbies[tryId] === null)
			return tryId
	}
}
funcion lobbyToString(lobby) {
	const lobby2 = lobby.map(function (user) {
		const user2 = {}
		// notably no conn
		user2.name = user.name
		user2.id = user.id
	})
	return JSON.stringify(lobby2)
}
function userIdInLobby(conn,lobbyId,lobbies) {
	const lobby = lobbies[lobbyId]
	for (i in lobby)
		if (lobby[i].conn == conn)
			return i
	return null
}
function broadcastLobbyInfo(lobbyId,lobbies) {
	const s = lobbyToString(lobbies[lobbyId])
	for (i in lobby)
		lobby[i].conn.send("yourLobby " + lobbyId + " " + i + " " + s)
}
function giveUserLobbyInfo(conn,lobbies) {
	if (!userIsInALobby(conn,lobbies))
		conn.send("ur not in a lobby kekl")
	else {
		const lobbyId = lobbies.connToLobby[conn]
		const lobby = lobbies[lobbyId]
		const i = userIdInLobby(conn,lobbyId,lobbies)
		const s = lobbyToString(lobbies[lobbyId])
		conn.send("yourLobby " + lobbyId + " " + i + " " + s)
	}
}
function removePlrFromLobby(conn,lobbies) {
	const lobbyId = lobbies.connToLobby[conn]
	if (lobbyId === null)
		return null

	const lobby = lobbies[lobbyId]
	let userIndexInLobby = userIdInLobby(conn,lobbyId,lobbies)
	if (userIndexInLobby === null)
		return null

	lobbies.connToLobby[conn] = null

	giveUserLobbyInfo(conn,lobbies)
	broadcastLobbyInfo(lobbyId,lobbies)

	if (lobby.length == 0)
		removeLobby(lobbyId,lobbies)

	return true
}
function removeLobby(lobbyId,lobbies) {
	const lobby = lobbies[lobbyId]
	if (lobby === null)
		return
	while (lobby.length > 0)
		removePlrFromLobby(lobby[0].conn,lobbies)
	lobbies[lobbyId] = null
}
function addPlrToLobby(conn,lobbyId,lobbies) { // return plr's id
	if (userIsInALobby(conn,lobbies))
		return null

	const lobby = lobbies[lobbyId]
	const user = {}
	user.conn = conn
	user.name = "unnamed friend"
	user.id = makeUserId(lobbyId,lobbies)
	lobby.splice(lobby.length,0,user)

	lobbies.connToLobby[conn] = lobbyId

	broadcastLobbyInfo(lobbyId,lobbies)

	return user.id
}
function addLobby(conn,lobbies) { // return [user id,lobby id]
	if (userIsInALobby(conn,lobbies))
		return null

	const lobbyId = makeLobbyId(lobbies)
	if (lobbies[lobbyId] !== null)
		return null
	lobbies[lobbyId] = []
	const userId = addPlrToLobby(conn,lobbyId,lobbies)
	if (userId === null) {
		removeLobby(lobbyId,lobbies)
		return null
	}
	return [userId,lobbyId]
}
function changeName(conn,name,lobbies) {
	const lobbyId = lobbies.connToLobby[conn]
	if (lobbyId === null)
		return null

	const lobby = lobbies[lobbyId]
	for (i in lobby)
		if (lobby[i].conn == conn) {
			lobby[i].name = name
			break
		}

	broadcastLobbyInfo(lobbyId,lobbies)

	return true
}
function startGame(conn,lobbies) {
	const lobbyId = lobbies.connToLobby[conn]
	if (lobbyId === null)
		return null

	const lobby = lobbies[lobbyId]
	if (lobby.length < 2 || lobby.length > 6)
		return null
	const conns = []
	for (i in lobby)
		conns = conns.concat(lobby[i].conn)
	removeLobby(lobbyId,lobbies)
	serveGameWithExtraStuff(conns,() => ()) // TODO done callback
}
function chatInLobby(conn,chat,lobbies) {
	const lobbyId = lobbies.connToLobby[conn]
	if (lobbyId === null)
		return null

	const lobby = lobbies[lobbyId]

	const userId = null
	for (i in lobby)
		if (lobby[i].conn == conn) {
			userId= i
			break
		}
	if (userId === null)
		return null
	for (i in lobby)
		lobby[i].conn.send("lobbyChat " + userId + " " + chat)
}
function removeEmptyLobbies(lobbies) {
	for (lobbyId in lobbies)
		if (lobbyId != "connToLobby" && lobbies[lobbyId].length == 0)
			removeLobby(lobbyId,lobbies)
}
function lobbyListenConn(conn,lobbies) {
	conn.on("message",function(msg) {
		let returnVal = null
		if (msg == "leaveLobby")
			returnVal = removePlayerFromLobby(conn,lobbies)
		else if (msg.substring(0,"joinLobby ".length) == "joinLobby ") {
			restOfMsg = parseInt(msg.substring("joinLobby ".length))
			if (lobbies[restOfMsg] !== null)
				returnVal = addPlrToLobby(conn,restOfMsg,lobbies)
		} else if (msg == "addLobby")
			returnVal = addLobby(conn,lobbies)
		else if (msg.substring(0,"changeName ".length) == "changeName ") {
			restOfMsg = msg.substring("changeName ".length)
			returnVal = changeName(conn,restOfMsg,lobbies)
		} else if (msg == "startGame")
			returnVal = startGame(conn,lobbies)
		else if (msg.substring(0,"lobbyChat ".length) == "lobbyChat ") {
			restOfMsg = msg.substring("lobbyChat ".length)
			returnVal = chatInLobby(conn,restOfMsg,lobbies)
		} else if (msg != "lobbyStatus") {
			returnVal = true // didn't try a lobby command, so we don't tell them lobby info
		}
		if (returnVal === null)
			giveUserLobbyInfo(conn,lobbies)
	})
}

function serveSocket(socket) {
	const lobbies = {}
	lobbies.connToLobby = {}

	socket.on("connection", (conn) => lobbyListenConn(conn, lobbies))
}

function main() {
	const server = new WebSocket.Server({ port: 8080 })
	server.on("connection",serveSocket)
}

main()
