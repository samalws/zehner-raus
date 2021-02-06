whichPageLoaded = "lobby"
var id = ""
checkid()

console.log("lobby.js loaded")

var playerlist = ["currentname1", "currentname2", "currentname3", "currentname4", "currentname5", "currentname6"]
var name//receive this somehow
var place = 1; //index in playerlist

changeName(vals[1]);

var input2 = document.getElementById("name");
input2.placeholder = name;
input2.value = name;

input2.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
   event.preventDefault();
   alert("Name changed successfully to: " + input2.value);
   var newname = input2.value
   input2.placeholder = newname;
   input2.value = newname;
   changeName(newname);
   updatePlayerList(playerlist)
  }
});

var input = document.getElementById("send_message");
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
   event.preventDefault();
   sendMessage(playerlist[place], document.getElementById("send_message").value);
   document.getElementById("send_message").value = "";
  }
});

function updateScroll(){
    var element = document.getElementById("actualchat");
    element.scrollTop = element.scrollHeight;
}

function changeName(newname){
  name = newname;
  playerlist[place] = name;
}

//to update playerList
function updatePlayerList(playerlist){
  changeName(document.getElementById("name").value);
  //playerlist array of players, with host first
  var doc = document.getElementById("playerlist")
  var content = "Playerlist :<br>"
  content += playerlist[0] + " (host)<br>"
  for(var i = 1; i < playerlist.length; i++){
    content += playerlist[i] + "<br>"
  }
  doc.innerHTML = content;
}

function sendMessage(user, message){
  var chatbox = document.getElementById("actualchat")
  const currentHTML = chatbox.innerHTML
  chatbox.innerHTML = currentHTML + user + ": "+ message + "<br>"
  updateScroll();
}

updatePlayerList(playerlist)

function ding(){
  document.getElementById('beep-sound').play()
  //TODO send ding
}

function startButton(){
  //delet
  tomain();
  //undelet
  socket.send(id+"startGame")
}

function tomain(){
  window.location.href = "main.html";
}

function tolobby(){
  window.location.href = "lobby.html";
}

function tohome(){
  window.location.href = "home.html";
}

//socketAddress defined in cookies.js
function loadSocket() {
	socket = new WebSocket("ws://"+socketAddress+":80/ws")
	socket.onopen = () => { console.log("websocket connected") }
	socket.onmessage = (event) => {
		console.log(event.data)
		if (event.data.substring(0,"gameState ".length) == "gameState ") {
			tomain();
		} else if (event.data.substring(0,"yourLobby ".length) == "yourLobby ") {
			if (whichPageLoaded == "home") {
				initialLobbyInfo = event.data.substring("yourLobby ".length)
				loadLobby()
			} else{}
				// TODO do stuff
			// TODO if in game, go back??
		} else if (event.data == "ur not in a lobby kekl") {
      alert("ur not in a lobby kekl")
      tohome();
		}
	}
	socket.onclose = (event) => {
		console.log("connection closed, wasClean = " + event.wasClean)
		//loadSocket()
	}
	socket.onerror = (event) => {
		console.log("error " + event.message)
	}
}
loadSocket()
