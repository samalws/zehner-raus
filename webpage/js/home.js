function getVals(){
  var gameID = document.getElementById("gameID").value
  var name = document.getElementById("name").value
  return [gameID, name]
}

function sendVals(){
  var vals = getVals();
  console.log(vals);
  newHTML = lobbybody
  document.querySelector('body').innerHTML = newHTML;
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

console.log("working");

var lobbybody = document.getElementById("lobby").innerHTML;
console.log(lobbybody)

document.getElementById("lobby").remove()

var mainbody = document.getElementById("main").innerHTML;
document.getElementById("main").remove()
