whichPageLoaded = "main"



applyGameState(gameInfo[0],gameInfo[1])

/*jry bits and bobs from here on out lol*/
console.log("main.js loaded")

var nthchildindex = 6
var arrayOfLatestCards;
var pile = document.getElementsByClassName("cardpile");
for(var j = 0; j < 8; j++){
  const i = j
  //get nth childindex from arrayofLatestCards
  leftRightOG = i % 2;
  //console.log(leftRightOG);
  const leftRight = leftRightOG;
  const allcards2 = pile[i].querySelectorAll('.card')
  pile[i].onmouseover = function(){
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
/*end test nonsense*/

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
