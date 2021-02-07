/*jry bits and bobs from here on out lol*/
console.log("main.js loaded")

var playerlist = ["currentname1", "currentname2", "currentname3", "currentname4", "currentname5", "currentname6"]
var name; //receive this somehow
var place = 1; //index in playerlist

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

//socketAddress defined in cookies.js
function loadSocket() {
	socket = new WebSocket("ws://"+socketAddress+":80/ws")
	socket.onopen = () => {
		console.log("websocket connected")
		setInterval(() => socket.send(id), 30*1000)
		socket.send(id+"move ")
	}
	socket.onmessage = (event) => {
		console.log(event.data)
		if (event.data.substring(0,"gameState ".length) == "gameState ") {
			const after = event.data.substring("gameState ".length)
			let nextSpace = 0
			while (nextSpace < after.length && after[nextSpace] != " ") nextSpace++
			myNumber = parseInt(after.substring(0,nextSpace))
			gameState = gameFromJSON(after.substring(nextSpace+1))

			gameInfo = [myNumber,gameState]
			applyGameState(myNumber,gameState)
		} else if (event.data.substring(0,"yourLobby ".length) == "yourLobby ") {
			   tolobby();
		}
			// TODO if in game, go back??
		else if (event.data == "ur not in a lobby kekl") {
      tohome();
		}
	}
	socket.onclose = (event) => {
		console.log("connection closed, wasClean = " + event.wasClean)
    alert("connection closed")
		//loadSocket()
	}
	socket.onerror = (event) => {
		console.log("error " + event.message)
    alert("error" + event.message)
	}
}
loadSocket()

//animatino nonsense

/*
var canplayarray
for(i in canplayarray){
  document.getElementById(i).classList.add('highlighted')
}

function convertIDtoIndex(num){
  var toReturn
  if (num > 10){
    toReturn = num - 11;
  } else{
    toReturn = 9-num;
  }
  return toReturn
}

var nthchildindex = 6

var arrayOfLatestCards;
var pile = document.getElementsByClassName("cardpile");
for(var j = 0; j < 8; j++){
  const i = j
  //get nth childindex from arrayofLatestCards
  leftRightOG = i % 2;
  console.log(leftRightOG);
  const leftRight = leftRightOG;
  const allcards2 = pile[i].querySelectorAll('.card')
  pile[i].onmouseover = function() {

    //console.log(leftRight);
    for(var k = 0; k < nthchildindex; k++){
      allcards2[k].style.opacity = 1;
    }
    allcards2[nthchildindex].style.position = "relative";
    if(leftRight != 0)
      allcards2[nthchildindex].style.marginLeft = "-10vh"; //test
    else
      allcards2[nthchildindex].style.marginRight = "-10vh";
    allcards2[nthchildindex].style.opacity = 1;
  }

  pile[i].onmouseout = function() {
    //console.log(leftRight);
    for(var k  = 0; k < nthchildindex; k++){
      allcards2[k].style.opacity = 0;
    }
    allcards2[nthchildindex].style.position = "absolute";
    if(leftRight != 0){
      allcards2[nthchildindex].style.marginLeft = "0"; //test
      //allcards2[nthchildindex].style.marginLeft = "0"; //test
      //console.log("bleh")
    } else{
      allcards2[nthchildindex].style.marginRight = "0";
      allcards2[nthchildindex].style.right = "0";
    }
    allcards2[nthchildindex].style.opacity = 1;
  }
}
*/
