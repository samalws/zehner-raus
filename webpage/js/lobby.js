
var playerlist = ["currentname1", "currentname2", "currentname3", "currentname4", "currentname5", "currentname6"]
var name; //receive this somehow
var place = 1; //index in playerlist

var input2 = document.getElementById("name");
console.log(input2);
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

function tomain(){
  newHTML = mainbody
  document.querySelector('body').innerHTML = newHTML;

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
}
