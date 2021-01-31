console.log("home.js loaded")
var vals = getVals();

function getVals(){
  var gameID = document.getElementById("gameID").value
  var name = document.getElementById("name").value
  return [gameID, name]
}

function sendVals(){
  vals = getVals();
  console.log(vals);
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
