var vals = getVals();
console.log("home.js loaded")

function getVals(){
  var gameID = document.getElementById("gameID").value
  var name = document.getElementById("name").value
  return [gameID, name]
}

function sendVals(){
  vals = getVals();
  socket.send("joinLobby "+vals[0])
  setTimeout(1000,() => socket.send("changeName "+vals[1]))
}

function loadLobby() {
  newHTML = lobbybody
  document.querySelector('body').innerHTML = newHTML;
  var script = document.createElement('script');
  script.src = "js/lobby.js";
  document.head.appendChild(script)
}

console.log("working");

var lobbybody = document.getElementById("lobby").innerHTML;
document.getElementById("lobby").remove()

var mainbody = document.getElementById("main").innerHTML;
document.getElementById("main").remove()








whichPageLoaded = "home"

initialLobbyInfo = null
gameInfo = null

socketAddress = "34.122.128.93"
function loadSocket() {
	socket = new WebSocket("ws://"+socketAddress+":80/ws")
	socket.onopen = () => { console.log("websocket connected") }
	socket.onmessage = (event) => {
		if (event.data.substring(0,"gameState ".length) == "gameState ") {
			const after = event.data.substring("gameState ".length)
			let nextSpace = 0
			while (nextSpace < after.length && after[nextSpace] != " ") nextSpace++
			myNumber = parseInt(after.substring(0,nextSpace))
			gameState = Game.fromJSON(after.substring(nextSpace+1))

			gameInfo = [myNumber,gameState]
			if (whichPageLoaded == "lobby")
				tomain()
			else
				applyGameState(myNumber,gameState)
		} else if (event.data.substring(0,"yourLobby ".length) == "yourLobby ") {
			if (whichPageLoaded == "home") {
				initialLobbyInfo = event.data.substring("yourLobby ".length)
				loadLobby()
			} else{}
				// TODO do stuff
			// TODO if in game, go back??
		} else if (event.data == "ur not in a lobby kekl") {
			// TODO maybe go back??
		}
	}
	socket.onclose = (event) => {
		console.log("connection closed, wasClean = " + event.wasClean)
		loadSocket()
	}
	socket.onerror = (event) => {
		console.log("error " + event.message)
	}
}
loadSocket()
