// npm install ws

const http = require("http")
const ws = require("ws")
const fs = require("fs")

// u really thought i was gonna use nodejs best practices?
eval(fs.readFileSync("../raus.js").toString())


// ticker.removeListener('tick', tickListener);


// run a game without any preference about what communication method you're using
// takes function to alert a player with a given number about a thing
// also takes a game over callback, which it calls with the finished game
// returns function for when a client sends a thing
// also returns a function to get the current game
function serveJustGame(numPlayers, msgToClient, gameOver, plrList) {
	let game = generateGame(plrList)

	const bumpPlayer = (plrNum) => msgToClient(plrNum,plrNum + " " + JSON.stringify(game))
	const bumpAllPlayers = () => {
		const ser = JSON.stringify(game)
		for (var i = 0; i < numPlayers; i++)
			msgToClient(i,i + " " + ser)
	}

	bumpAllPlayers()
	return [(plrNum, msg) => {
		let alreadyBumpedPlayer = false
		if (plrNum == game.dran) {
			let newGame = undefined
			if (msg == "drawCard")
				newGame = game.drawCard()
			else if (msg == "endTurn")
				newGame = game.endTurn()
			else if (msg.substring(0,"playCard ".length) == "playCard ") {
				n = parseInt(msg.substring("playCard ".length))
				if (n !== NaN)
					newGame = game.playCard(n)
			}
			if (newGame != undefined) {
				game = newGame
				bumpAllPlayers()
				alreadyBumpedPlayer = true
				if (game.gameIsOver())
					gameOver(game)
			}
		}
		if (!alreadyBumpedPlayer)
			bumpPlayer(plrNum)
	}, () => game]
}

function serveGameWithExtraStuff(plrs,doneCallback) {
	const conns = []
	for (i in plrs)
		conns.splice(conns.length,0,plrs[i].conn)
	const plrList = lobbyToSerializable(plrs)

	const numPlayers = conns.length
	const msgToClient = ((plrNum, msg) => conns[plrNum].send("gameState " + msg))
	var msgHandler = undefined
	var disconnectHandler = undefined
	const gameOver = ((finalGame) => {
		for (plrNum in conns) {
			const conn = conns[plrNum]
			conn.removeListner("message",msgHandler)
			conn.removeListner("disconnect",disconnectHandler)
			conn.send("gameOver ",JSON.serialize(finalGame))
		}
		doneCallback()
	})

	const callbacks = serveJustGame(numPlayers, msgToClient, gameOver, plrList)
	const receivedMsgEvent = callbacks[0]
	const getGame = callbacks[1]

	msgHandler = (msg) => {
		const msg1 = msg.substring(5)
		switch (msg.substring(0,5)) {
		case "move ": // make a move / ask for game state
			receivedMsgEvent(plrNum, msg1)
			break
		case "chat ": // chat
			for (var i = 0; i < numPlayers; i++)
				conns[plrNum].send("chat " + plrNum + ":" + msg1)
			break
		case "quit ": // quit
			gameOver(getGame())
		}
	}
	disconnectHandler = () => gameOver(getGame())

	for (plrNum in conns) {
		const conn = conns[plrNum]
		conn.on("message",msgHandler)
		conn.on("disconnect",disconnectHandler)
	}
}

function connToLobbyIndex(conn,lobbies) {
	for (var i = 0; i < lobbies.connToLobby.length; i++)
		if (lobbies.connToLobby[i][0] == conn)
			return i
	return undefined
}
function connToLobbyVal(conn,lobbies) {
	if (lobbies.connToLobby[connToLobbyIndex(conn,lobbies)] === undefined)
		return undefined
	return lobbies.connToLobby[connToLobbyIndex(conn,lobbies)][1]
}
function removeFromConnToLobby(conn,lobbies) {
	const i = connToLobbyIndex(conn,lobbies)
	if (i !== undefined)
		lobbies.connToLobby.splice(i,1)
}
function setConnToLobby(conn,val,lobbies) {
	const i = connToLobbyIndex(conn,lobbies)
	if (i !== undefined)
		lobbies.connToLobby[i][1] = val
	else {
		lobbies.connToLobby.splice(lobbies.connToLobby.length,0,[conn,val])
		//console.log(userIsInALobby(conn,lobbies))
	}
}
function userIsInALobby(conn,lobbies) {
	return connToLobbyIndex(conn,lobbies) !== undefined
}
function makeUserId(lobbyId,lobbies) {
	const lobby = lobbies[lobbyId]
	const idsTaken = []
	lobby.forEach((user) => idsTaken.splice(0,0,user.id))
	while (true) {
		const tryId = Math.floor(Math.random()*999999)
		if (!idsTaken.includes(tryId))
			return tryId	
	}
}
function makeLobbyId(lobbies) {
	while (true) {
		const tryId = Math.floor(Math.random()*999999)
		if (lobbies[tryId] === undefined)
			return tryId
	}
}
function lobbyToSerializable(lobby) {
	const lobby2 = lobby.map(function (user) {
		const user2 = {}
		// notably no conn
		user2.name = user.name
		user2.id = user.id
		return user2
	})
	return lobby2
}
function lobbyToString(lobby) {
	return JSON.stringify(lobbyToSerializable(lobby))
}
function userIdInLobby(conn,lobbyId,lobbies) {
	const lobby = lobbies[lobbyId]
	for (i in lobby)
		if (lobby[i].conn == conn)
			return i
	return undefined
}
function broadcastLobbyInfo(lobbyId,lobbies) {
	const lobby = lobbies[lobbyId]
	const s = lobbyToString(lobby)
	for (i in lobby)
		lobby[i].conn.send("yourLobby " + lobbyId + " " + i + " " + s)
}
function giveUserLobbyInfo(conn,lobbies) {
	if (!userIsInALobby(conn,lobbies))
		conn.send("ur not in a lobby kekl")
	else {
		const lobbyId = connToLobbyVal(conn,lobbies)
		const lobby = lobbies[lobbyId]
		const i = userIdInLobby(conn,lobbyId,lobbies)
		const s = lobbyToString(lobbies[lobbyId])
		conn.send("yourLobby " + lobbyId + " " + i + " " + s)
	}
}
function removePlrFromLobby(conn,lobbies) {
	const lobbyId = connToLobbyVal(conn,lobbies)
	if (lobbyId === undefined)
		return undefined

	const lobby = lobbies[lobbyId]
	let userIndexInLobby = userIdInLobby(conn,lobbyId,lobbies)
	if (userIndexInLobby === undefined)
		return undefined
	lobby.splice(userIndexInLobby,1)

	removeFromConnToLobby(conn,lobbies)

	giveUserLobbyInfo(conn,lobbies)
	broadcastLobbyInfo(lobbyId,lobbies)

	if (lobby.length == 0)
		removeLobby(lobbyId,lobbies)

	return true
}
function removeLobby(lobbyId,lobbies) {
	const lobby = lobbies[lobbyId]
	if (lobby === undefined)
		return
	while (lobby.length > 0)
		removePlrFromLobby(lobby[0].conn,lobbies)
	delete lobbies[lobbyId]
}
function addPlrToLobby(conn,lobbyId,lobbies) { // return plr's id
	if (userIsInALobby(conn,lobbies))
		return undefined

	const lobby = lobbies[lobbyId]
	const user = {}
	user.conn = conn
	user.name = "unnamed friend"
	user.id = makeUserId(lobbyId,lobbies)
	lobby.splice(lobby.length,0,user)

	setConnToLobby(conn,lobbyId,lobbies)

	broadcastLobbyInfo(lobbyId,lobbies)

	return user.id
}
function addLobby(conn,lobbies) { // return [user id,lobby id]
	if (userIsInALobby(conn,lobbies))
		return undefined

	const lobbyId = makeLobbyId(lobbies)
	if (lobbies[lobbyId] !== undefined)
		return undefined
	lobbies[lobbyId] = []
	const userId = addPlrToLobby(conn,lobbyId,lobbies)
	if (userId === undefined) {
		removeLobby(lobbyId,lobbies)
		return undefined
	}
	return [userId,lobbyId]
}
function changeName(conn,name,lobbies) {
	const lobbyId = connToLobbyVal(conn,lobbies)
	if (lobbyId === undefined)
		return undefined

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
	const lobbyId = connToLobbyVal(conn,lobbies)
	if (lobbyId === undefined)
		return undefined

	const lobby = lobbies[lobbyId]
	if (lobby.length < 2 || lobby.length > 6)
		return undefined
	let conns = []
	for (i in lobby)
		conns = conns.concat(lobby[i].conn)
	const copyLobby = [...lobby]
	removeLobby(lobbyId,lobbies)
	serveGameWithExtraStuff(copyLobby,() => {})
}
function chatInLobby(conn,chat,lobbies) {
	const lobbyId = connToLobbyVal(conn,lobbies)
	if (lobbyId === undefined)
		return undefined

	const lobby = lobbies[lobbyId]

	let userId = undefined
	for (i in lobby)
		if (lobby[i].conn == conn) {
			userId = i
			break
		}
	if (userId === undefined)
		return undefined
	for (i in lobby)
		lobby[i].conn.send("lobbyChat " + userId + " " + chat)

	return true
}
function removeEmptyLobbies(lobbies) {
	for (lobbyId in lobbies)
		if (lobbyId != "connToLobby" && lobbies[lobbyId].length == 0)
			removeLobby(lobbyId,lobbies)
}
function lobbyListenConn(conn,lobbies) {
	console.log("new connection")
	conn.on("message",function(msg) {
		let returnVal = undefined
		if (msg == "leaveLobby")
			returnVal = removePlrFromLobby(conn,lobbies)
		else if (msg.substring(0,"joinLobby ".length) == "joinLobby ") {
			restOfMsg = parseInt(msg.substring("joinLobby ".length))
			if (lobbies[restOfMsg] !== undefined)
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
		if (returnVal === undefined)
			giveUserLobbyInfo(conn,lobbies)
	})
	conn.on("disconnect",() => removePlrFromLobby(conn,lobbies))
}

function safeifyConn(conn) {
	const newConn = {}
	newConn.send = (a) => {
		try {
			conn.send(a)
		} catch (e) {}
	}
	newConn.on = (a,b) => {
		try {
			conn.on(a,b)
		} catch (e) {}
	}
	newConn.removeListener = (a,b) => {
		try {
			conn.removeListener(a,b)
		} catch (e) {}
	}
	return newConn
}
function serveSocket(socket) {
	const lobbies = {}
	lobbies.connToLobby = []

	socket.on("connection", (conn,req) => { lobbyListenConn(safeifyConn(conn), lobbies) })
}

function main() {
	pageText = "example page"
	const htServer = http.createServer((req,res) => {
		res.writeHead(200)
		let filepath = "../webpage/"
		if (req.url == "/")
			filepath += "home.html"
		else
			filepath += req.url
		try {
			res.end(fs.readFileSync(filepath))
		} catch (e) {
			res.end()
		}
	})
	htServer.listen(80,() => {})

	const wsServer = new ws.Server({ server: htServer, path:"/ws" })
	serveSocket(wsServer)
}

main()
