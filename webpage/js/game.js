suitNames = ["green","teal","pink","yellow"]

function applyHand(hand) {
	const handDiv = document.querySelector(".hand")
	let children = handDiv.querySelectorAll(".card")
	if (children.length < hand.length) {
	} else if (children.length > hand.length) {
	} else {
	}
}
function applyDran(dran) {
	// tf do I do here lmao
}
function applyDranState(dranState) {
	// tf do I do here lmao
}
function applyDeckAmt(amt) {
	document.getElementById("deckLeft").innerText = amt
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
		for (i in lowerCards)
			lowerCards[i].style.opacity = i >= thisPileVals[0] ? 1 : 0

		const upperCards = row.querySelectorAll(".playedcardleft") //EVENTUALLY SWAP FOR RIGHT
		for (i in upperCards)
			upperCards[i].style.opacity = i + 11 <= thisPileVals[1] ? 1 : 0
	}
}
function applyWinOrder(winOrder) {
	// tf do I do here lmao
}
function applyGameState(game) {
	applyHand(game.hand)
	applyDran(game.dran)
	applyDranState(game.dranState)
	applyDeckAmt(game.deck.length)
	applyCardsDown(game.cardsDown)
	applyWinOrder(game.winOrder)
}
