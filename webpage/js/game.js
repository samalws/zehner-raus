suitNames = ["green","teal","pink","yellow"]

function applyHand(hand) {
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
	suitsPlayed = [false,false,false,false]
	for (card in cardsDown)
		suitsPlayed[card.suit] = true
	for (suitNum in suitNames) {
		const suitName = suitNames[suitNum]
		const row = document.getElementById(suitName + "-pile")
		const ten = row.querySelector(".card:not(.playedcardleft,.playedcardright)")
		ten.style.opacity = suitsPlayed[suitNum] ? 1 : 0
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
