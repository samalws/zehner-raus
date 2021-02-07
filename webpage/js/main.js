/*jry bits and bobs from here on out lol*/
console.log("main.js loaded")
var playerlist = ["uninitialized in js"]
var name = "unnamed friend" //receive this somehow
place = 1


//set playerlist to actually exist
/*
playerlist = game.plrlist
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
*/

//send message in chatbox
//TODO ACTUALLY SEND MESSAGES
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

      //playerlist = game.plrlist

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
/*
pileValues = [[10, 20], [8, 10], [9, 11], [6, 9]]

var arrayOfLatestCards = []; //putting into a single array
for(var ii = 0; ii < 4; ii++){
  for(var jj = 0; jj < 2; jj++){
    arrayOfLatestCards.push(convertIDtoIndex(pileValues[ii][jj]))
  }
}

console.log(arrayOfLatestCards)
var pile = document.getElementsByClassName("cardpile");
for(var j = 0; j < 8; j++){
  const i = j

  //get nth childindex from arrayofLatestCards
  leftRightOG = i % 2;
  console.log(leftRightOG);

  if(arrayOfLatestCards[i] == -1){
    continue;
  }


  const leftRight = leftRightOG;
  const allcards2 = pile[i].querySelectorAll('.card')
  pile[i].onmouseover = function() {
    for(var k = 0; k < arrayOfLatestCards[i]; k++){
      allcards2[k].style.opacity = 1;
    }
    console.log("making this: " + arrayOfLatestCards[i] + " suit: "+ i + "    VISIBLE")
    allcards2[arrayOfLatestCards[i]].style.position = "relative";
    if(leftRight != 0 && arrayOfLatestCards[i] != 0)
      allcards2[arrayOfLatestCards[i]].style.marginLeft = "-10vh"; //test
    else if(arrayOfLatestCards[i] != 0)
      allcards2[arrayOfLatestCards[i]].style.marginRight = "-10vh";
    allcards2[arrayOfLatestCards[i]].style.opacity = 1;
  }

  pile[i].onmouseout = function() {
    console.log(leftRight);
    for(var k  = 0; k < arrayOfLatestCards[i]; k++){
      allcards2[k].style.opacity = 0;
    }
    console.log("making this: " + arrayOfLatestCards[i] + " suit: "+ i + "    INVISIBLE")
    allcards2[arrayOfLatestCards[i]].style.position = "absolute";
    if(leftRight != 0)
      allcards2[arrayOfLatestCards[i]].style.marginLeft = "0";
    else{
      allcards2[arrayOfLatestCards[i]].style.marginRight = "0";
      allcards2[arrayOfLatestCards[i]].style.right = "0";
    }
    allcards2[arrayOfLatestCards[i]].style.opacity = 1;
  }
}
*/
