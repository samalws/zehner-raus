
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
