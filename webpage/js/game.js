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
function applyHand(hand) {
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
	}
}
function applyDran(dran) {
	// tf do I do here lmao
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
		if (card < 10)
			pileValues[card.suit][0] = card.number
		else if (card > 10)
			pileValues[card.suit][1] = card.number
		else
			tensPlayed[card.suit] = true
	})
	for (suitNum in suitNames) {
		const suitName = suitNames[suitNum]
		const row = document.getElementById(suitName + "-pile")

		const ten = row.querySelector(".card:not(.playedcardleft,.playedcardright)")
		ten.style.opacity = tensPlayed[suitNum] ? 1 : 0

		const lowerCards = row.querySelectorAll(".playedcardright") //EVENTUALLY SWAP FOR LEFT
		const thisPileVals = pileValues[suitNum]
		for (var i = 0; i < 10; i++)
			lowerCards[i].style.opacity = i >= thisPileVals[0] ? 1 : 0

		const upperCards = row.querySelectorAll(".playedcardleft") //EVENTUALLY SWAP FOR RIGHT
		for (var i = 0; i < 10; i++)
			upperCards[i].style.opacity = i + 11 <= thisPileVals[1] ? 1 : 0
	}
}
function applyWinOrder(winOrder) {
	// tf do I do here lmao
}
function applyGameState(myNumber,game) {
	applyHand(game.hands[myNumber])
	applyDran(game.dran)
	applyDranState(game.dranState)
	applyDeckAmt(game.deck.length)
	applyCardsDown(game.cardsDown)
	applyWinOrder(game.winOrder)
}
