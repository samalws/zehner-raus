suitNames = ["green","teal","pink","yellow"]

function makeHandCard() {
	const cardContainer = document.createElement("div")
	cardContainer.classList.add("card-container")

	const card = document.createElement("div")
	cardContainer.appendChild(card)
	card.classList.add("card")

	const cornerText = document.createElement("span")
	card.appendChild(cornerText)
	cornerText.classList.add("corner_text")
	cornerText.classList.add("text_green")

	const centerText = document.createElement("span")
	card.appendChild(centerText)
	centerText.classList.add("center_text")
	centerText.classList.add("text_green")

	document.querySelector(".hand").appendChild(cardContainer)
	return cardContainer
}
function applyHand(hand, game) {
	const handDiv = document.querySelector(".hand")

	let children = [...handDiv.querySelectorAll(".card-container")]

/////////////////////////////////////////////////////////////////////
	while (children.length < hand.length)
		children.push(makeHandCard())
	while (children.length > hand.length)
		children.pop().remove()
/////////////////////////////////////////////////////////////////////

	for (i in hand) {
		const cornerText = children[i].querySelector(".corner_text")
		const centerText = children[i].querySelector(".center_text")
		const className = "text_"+suitNames[hand[i].suit]
		cornerText.classList.remove(cornerText.classList[1])
		cornerText.classList.add(className)
		centerText.classList.remove(centerText.classList[1])
		centerText.classList.add(className)
		centerText.classList[1] = className
		cornerText.innerText = hand[i].number
		centerText.innerText = hand[i].number
		const card0 = children[i].querySelector(".card")
		const j = i
		card0.onclick = () => clicky(j);
		if(game.cardIsPlayable(hand[i]))
			card0.classList.add('highlighted');
		else
			card0.classList.remove('highlighted')
	}
}

function clicky(index) {
	//called upon clicking a card!
	socket.send(id+"move playCard "+index)
}

function endTurn() {
	socket.send(id+"move endTurn")
}

function drawCard() {
	socket.send(id+"move drawCard")
}

function applyDranState(dranState) {
	// tf do I do here lmao
}
function applyDeckAmt(amt) {
	document.getElementById("deck-left").innerText = amt
}
function applyCardsDown(cardsDown) {
	let tensPlayed = [false,false,false,false]
	let pileValues = [[10,10],[10,10],[10,10],[10,10]]
	cardsDown.forEach((card) => {
		if (card.number < 10)
			pileValues[card.suit][0] = card.number
		else if (card.number > 10)
			pileValues[card.suit][1] = card.number
		else
			tensPlayed[card.suit] = true
	})
	console.log(pileValues)
	for (suitNum in suitNames) {
		const suitName = suitNames[suitNum]
		const row = document.getElementById(suitName + "-pile")

		const ten = row.querySelector(".card:not(.playedcardleft,.playedcardright)")
		ten.style.opacity = tensPlayed[suitNum] ? 1 : 0

		/*
		const lowerCards = row.querySelectorAll(".playedcardleft") //EVENTUALLY SWAP FOR LEFT
		const thisPileVals = pileValues[suitNum]
		for (var i = 0; i < 10; i++)
			lowerCards[i].style.opacity = i >= thisPileVals[0] ? 1 : 0

		const upperCards = row.querySelectorAll(".playedcardright") //EVENTUALLY SWAP FOR RIGHT
		for (var i = 0; i < 10; i++)
			upperCards[i].style.opacity = i + 11 <= thisPileVals[1] ? 1 : 0
		*/
	}


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

	  if(arrayOfLatestCards[i] == -1){
	    continue;
	  }

	  const leftRight = leftRightOG;
	  const allcards2 = pile[i].querySelectorAll('.card')

		pile[i].onmouseover = null
		pile[i].onmouseout = null

		for(var k = 0; k < allcards2.length; k++){
			allcards2[k].style.opacity=0;
			allcards2[k].style.position = "relative";
			if(leftRight != 0)
	      allcards2[k].style.marginLeft = "-10vh"; //test
	    else
	      allcards2[k].style.marginRight = "-10vh";
		}

	  pile[i].onmouseover = function() {
	    for(var k = 0; k < arrayOfLatestCards[i]; k++){
	      allcards2[k].style.opacity = 1;
	    }
	    //console.log("making this: " + arrayOfLatestCards[i] + " suit: "+ i + "    VISIBLE")
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
	    //console.log("making this: " + arrayOfLatestCards[i] + " suit: "+ i + "    INVISIBLE")
	    allcards2[arrayOfLatestCards[i]].style.position = "absolute";
	    if(leftRight != 0)
	      allcards2[arrayOfLatestCards[i]].style.marginLeft = "0";
	    else{
	      allcards2[arrayOfLatestCards[i]].style.marginRight = "0";
	      allcards2[arrayOfLatestCards[i]].style.right = "0";
	    }
	    allcards2[arrayOfLatestCards[i]].style.opacity = 1;
	  }

		//giving style to actual thing
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
function doLeaderboard(game) {
	innerText = ""
	for (i in game.playerList) {
	}
}
function applyGameState(myNumber,game) {
	applyHand(game.hands[myNumber], game)
	applyDeckAmt(game.deck.length)
	applyCardsDown(game.cardsDown)
	doLeaderboard(game)
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
