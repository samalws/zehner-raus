var playerlist = ["currentname1", "unnamed friend", "currentname3", "currentname4", "currentname5", "currentname6"]
var name = "unnamed friend"//receive this somehow
var place = 1; //index in playerlist
var lobbyID = "-1"

updatePlayerList(playerlist)
updateLobbyID(lobbyID);

var input2 = document.getElementById("name");
input2.placeholder = name;
input2.value = name;

input2.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
   event.preventDefault();
   var newname = input2.value
   /*
   input2.placeholder = newname;
   input2.value = newname;
   */
   changeName(newname);
   updatePlayerList(playerlist)
   alert("Name changed successfully to: " + name);
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

function updateLobbyID(newLobbyID){
  lobbyID = newLobbyID
  document.getElementById("lobbyid").innerHTML = lobbyID;
}

function updateScroll(){
    var element = document.getElementById("actualchat");
    element.scrollTop = element.scrollHeight;
}

function changeName(newname){
  console.log("trying to change name")
  socket.send(id + "changeName " + newname)
}

//to update playerList
function updatePlayerList(playerlist){
  //changeName(document.getElementById("name").value);
  //playerlist array of players, with host first
  var doc = document.getElementById("playerlist")
  var content = "Playerlist :<br>"
  for(var i = 0; i < playerlist.length; i++){
    if(playerlist[i] == name){
      content += "<input class=\"textbox\" type = \"text\" placeholder = \"" + name + "\" id = \"name\" + value = \"" + name + "\"style = \"color:yellow\">"
      content += "<br>"
    } else{
      content += playerlist[i] + "<br>"
    }

  }
  doc.innerHTML = content;
}

function sendMessage(user, message){
  var chatbox = document.getElementById("actualchat")
  const currentHTML = chatbox.innerHTML
  chatbox.innerHTML = currentHTML + user + ": "+ message + "<br>"
  updateScroll();
}



function ding(){
  document.getElementById('beep-sound').play()
  //TODO send ding
}

function startButton(){
  //delet
  //tomain();
  //undelet
  socket.send(id+"startGame")
}

function tomain(){
  window.location.href = "main.html";
}

function tohome(){
  window.location.href = "home.html";
}

//socketAddress defined in cookies.js
function loadSocket() {
	socket = new WebSocket("ws://"+socketAddress+":80/ws")
	socket.onopen = () => {
		socket.send(id+"lobbyStatus")
	}
	socket.onmessage = (event) => {
		console.log(event.data)
		if (event.data.substring(0,"gameState ".length) == "gameState ") {
			tomain();
		} else if (event.data.substring(0,"yourLobby ".length) == "yourLobby ") {
			let rest = event.data.substring("yourLobby ".length)
			let space = rest.search(" ")
			var newLobbyId = parseInt(rest.substring(0,space))
      updateLobbyID(newLobbyID);
			rest = rest.substring(space+1)
			space = rest.search(" ")
			const myLobbyIndex = parseInt(rest.substring(0,space))
			rest = rest.substring(space+1)
			const lobbyInfo = JSON.parse(rest)
			console.log(lobbyID,myLobbyIndex,lobbyInfo)
      playerlist = lobbyInfo
      name = playerlist[myLobbyIndex]
      updatePlayerList(playerlist)
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
