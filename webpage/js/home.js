/*
var input = document.getElementById("gameID");
console.log(input);
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
   event.preventDefault();
   alert(document.getElementById("gameID").value);
   gameID = document.getElementById("gameID").value
  }
});

var input2 = document.getElementById("name");
console.log(input2);
input2.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
   event.preventDefault();
   alert(document.getElementById("name").value);
   name = document.getElementById("gameID").value
  }
});
*/

function getVals(){
  var gameID = document.getElementById("gameID").value
  var name = document.getElementById("name").value
  return [gameID, name]
}

function sendVals(){
  //sendvals to server and redirect???
  var vals = getVals();
  console.log(vals);
}

console.log("working");
