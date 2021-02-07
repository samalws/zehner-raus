// npm install ws

const http = require("http")
const ws = require("ws")
const fs = require("fs")

// u really thought i was gonna use nodejs best practices?
eval(fs.readFileSync("../raus.js").toString())


const disconnectTime = 1000*60*4 // 4 minute disconnect time
const idLength = 20 // in characters


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
// TODO use actual connection id instead of made up ass lobby user id
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

	msgHandler = (plrNum) => (msg) => {
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
		const num = plrNum
		const conn = conns[num]
		conn.on("message",msgHandler(num))
		conn.on("disconnect",disconnectHandler)
	}
}

/* function connToLobbyIndex(conn,lobbies) {
	for (i in lobbies.connToLobby)
	if (lobbies.connToLobby[i][0] == conn.id)
		return i
	return undefined
} */
function connToLobbyVal(conn,lobbies) {
	return lobbies.connToLobby[conn.id] // [connToLobbyIndex(conn,lobbies)][1]
}
function removeFromConnToLobby(conn,lobbies) {
	// const i = connToLobbyIndex(conn,lobbies)
	// if (i !== undefined)
	if (lobbies.connToLobby[conn.id] !== undefined)
		delete lobbies.connToLobby[conn.id] // [i]
}
function setConnToLobby(conn,val,lobbies) {
	/* const i = connToLobbyIndex(conn,lobbies)
	if (i !== undefined)
		lobbies.connToLobby[i][1] = val
	else
		lobbies.connToLobby.splice(lobbies.connToLobby.length,0,[conn.id,val]) */
	lobbies.connToLobby[conn.id] = val
}
function userIsInGame(conn,lobbies) {
	return lobbies.connToLobby[conn.id] == "ingame"
}
function userIsInALobby(conn,lobbies) {
	return /* connIdToLobbyIndex(conn,lobbies) */ lobbies.connToLobby[conn.id] !== undefined && !userIsInGame(conn,lobbies)
}
// TODO this is notably different from their actual conn id, disambiguate this later
// TODO users are still identified in lobbies by their conn, not their conn id, this is fine right?
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
function lobbyToPlayerList(lobby) {
	return lobby.map((user) => user.name)
}
function lobbyToPlayerListString(lobby) {
	return JSON.stringify(lobbyToPlayerList(lobby))
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
	const s = lobbyToPlayerListString(lobby)
	for (i in lobby)
		lobby[i].conn.send("yourLobby " + lobbyId + " " + i + " " + s)
}
function giveUserLobbyInfo(conn,lobbies) {
	if (userIsInGame(conn,lobbies))
		conn.send("ur ingame")
	else if (!userIsInALobby(conn,lobbies))
		conn.send("ur not in a lobby kekl")
	else {
		const lobbyId = connToLobbyVal(conn,lobbies)
		const lobby = lobbies[lobbyId]
		const i = userIdInLobby(conn,lobbyId,lobbies)
		const s = lobbyToPlayerListString(lobbies[lobbyId])
		conn.send("yourLobby " + lobbyId + " " + i + " " + s)
	}
}
function removePlrFromLobby(conn,lobbies,forGame=false) {
	const lobbyId = connToLobbyVal(conn,lobbies)
	if (lobbyId === undefined)
		return undefined

	const lobby = lobbies[lobbyId]
	let userIndexInLobby = userIdInLobby(conn,lobbyId,lobbies)
	if (userIndexInLobby === undefined)
		return undefined
	lobby.splice(userIndexInLobby,1)

	if (forGame)
		setConnToLobby(conn,"ingame",lobbies)
	else
		removeFromConnToLobby(conn,lobbies)

	giveUserLobbyInfo(conn,lobbies)
	broadcastLobbyInfo(lobbyId,lobbies)

	if (lobby.length == 0)
		removeLobby(lobbyId,lobbies)

	return true
}
function removeLobby(lobbyId,lobbies,forGame=false) {
	const lobby = lobbies[lobbyId]
	if (lobby === undefined)
		return
	while (lobby.length > 0)
		removePlrFromLobby(lobby[0].conn,lobbies,forGame)
	delete lobbies[lobbyId]
}
function addPlrToLobby(conn,lobbyId,name,lobbies) { // return plr's id
	if (userIsInALobby(conn,lobbies))
		return undefined

	const lobby = lobbies[lobbyId]
	const user = {}
	user.conn = conn
	user.name = name
	user.id = makeUserId(lobbyId,lobbies)
	lobby.splice(lobby.length,0,user)

	setConnToLobby(conn,lobbyId,lobbies)

	broadcastLobbyInfo(lobbyId,lobbies)

	return user.id
}
function addLobby(conn,name,lobbies) { // return [user id,lobby id]
	if (userIsInALobby(conn,lobbies))
		return undefined

	const lobbyId = makeLobbyId(lobbies)
	if (lobbies[lobbyId] !== undefined)
		return undefined
	lobbies[lobbyId] = []
	const userId = addPlrToLobby(conn,lobbyId,name,lobbies)
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
	removeLobby(lobbyId,lobbies,true)
	serveGameWithExtraStuff(copyLobby,() => {removeFromConnToLobby(conn,lobbies)})
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
		console.log("received "+msg+" from "+conn.id)
		let returnVal = undefined
		if (msg == "leaveLobby")
			returnVal = removePlrFromLobby(conn,lobbies)
		else if (msg.substring(0,"joinLobby ".length) == "joinLobby ") {
			const restOfMsg = msg.substring("joinLobby ".length)
			const space = restOfMsg.search(" ")
			const lobbyId = parseInt(restOfMsg.substring(0,space))
			const name = restOfMsg.substring(space+1)
			if (lobbies[lobbyId] !== undefined)
				returnVal = addPlrToLobby(conn,lobbyId,name,lobbies)
			console.log("joinLobby return val "+returnVal)
		} else if (msg.substring(0,"addLobby ".length) == "addLobby ") {
			const restOfMsg = msg.substring("addLobby ".length)
			returnVal = addLobby(conn,restOfMsg,lobbies)
		} else if (msg.substring(0,"changeName ".length) == "changeName ") {
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

function removeEmptyConns(absConns) {
	const date = new Date()
	for (id in absConns)
		if (absConns[id].lastHeardFrom - date <= disconnectTime) {
			absConns[id].disconnect()
			delete absConns[id]
		}
}

class AbstractConnection {
	constructor(id,physicalConn) {
		this.id = id
		this.physicalConn = physicalConn
		this.handlers = {"message": [], "disconnect": []}
		this.lastHeardFrom = new Date()
	}
	on(name, handler) {
		const addTo = this.handlers[name]
		addTo.splice(addTo.length,0,handler)
	}
	removeListener(name, handler) {
		this.handlers[name] = this.handlers[name].filter((x) => x != handler)
	}
	receive(msg) {
		this.lastHeardFrom = new Date()
		this.handlers.message.forEach((x) => { try { x(msg) } catch (e) {} })
	}
	send(msg) {
		console.log("sending "+msg+" to "+this.id)
		try {
			this.physicalConn.send(msg)
		} catch (e) {}
	}
	setPhysConn(conn) {
		if (this.physicalConn != conn)
			this.physicalConn = conn
	}
	disconnect() {
		this.handlers.disconnect.forEach((x) => { try { x() } catch (e) {} })
	}
}

// TODO memory leaks?
// TODO what if they send malformed msg without id
function listenConn(conn,absConns,lobbies) {
	conn.on("message",function(msg) {
		const id = msg.substring(0,idLength)
		const rest = msg.substring(idLength)
		let absConn = absConns[id]
		if (absConn === undefined) {
			absConn = new AbstractConnection(id,conn)
			absConns[id] = absConn
			lobbyListenConn(absConn,lobbies)
		}
		absConn.setPhysConn(conn)
		absConn.receive(rest)
	})
}

// returns interval to cleanup if need be
function serveSocket(socket) {
	const lobbies = {}
	const absConns = {}
	lobbies.connToLobby = {}

	socket.on("connection", (conn,req) => { listenConn(conn, absConns, lobbies) })

	return setInterval(() => {
		removeEmptyLobbies(lobbies)
		removeEmptyConns(absConns)
	},1000*60*2)
}

const contentTypes = {
	"mp3": "audio/mpeg",
	"js":  "text/javascript"
}
function main() {
	const htServer = http.createServer((req,res) => {
		let filepath = "../webpage/"
		if (req.url == "/")
			filepath += "home.html"
		else
			filepath += req.url
		while (filepath[filepath.length-1] == "/")
			filepath = filepath.substring(0,filepath.length-1)
		const split = filepath.split(".")
		const extension = split[split.length-1]
		const contentType = contentTypes[extension] || "text/"+extension
		res.writeHead(200, {"Content-Type": contentType})
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
