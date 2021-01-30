function replaceIndex(i,elem,arr) {
	let arr2 = [...arr]
	arr2[i] = elem
	return arr2
}
function removeIndex(i,arr) {
	let arr2 = [...arr]
	arr2.splice(i,1)
	return arr2
}

class Card {
	constructor(suit,number) {
		this.suit = suit
		this.number = number
	}
	play(cards) {
		if (this.number == 10)
			return cards.append(this)
		for (var i = 0; i < cards.length; i++) {
			let card = cards[i]
			if (this.suit != card.suit)
				continue

			if (this.number == 9 || this.number == 11) {
				if (card.number == 10)
					return cards.append(this)
			} else if (this.number < 9) {
				if (this.number == card.number - 1)
					return replaceIndex(i,this,cards)
			} else { // ie, else if (this.number > 11) {
				if (this.number == card.number + 1)
					return replaceIndex(i,this,cards)
			}
		}
		return null
	}
	canPlay(cards) {
		return this.play(cards) != null
	}
}

class Game {
	// dran = the person whose turn it is, adrian moment lol
	// dranState: -1 if played a card, 0 if just starting turn, n if drawn n cards from deck
	constructor(hands,dran,dranState,deck,cardsDown) {
		this.hands = hands
		this.dran = dran
		this.dranState = dranState
		this.deck = deck
		this.cardsDown = cardsDown
	}
	numPlayers() {
		return this.hands.length
	}
	gameIsOver() {
		for (hand in this.hands)
			if (hand.length > 0)
				return false
		return true
	}
	dranWon() {
		return this.hands[this.dran].length == 0
	}
	canEndTurn() {
		return this.dranState == -1 || this.dranState == 3 || this.deck.length == 0
	}
	justFinishTurn() {
		if (!this.canEndTurn())
			return null
		else
			return new Game(this.hands,(this.dran + 1) % this.numPlayers(),0,this.deck,this.cardsDown)
	}
	finishTurn() {
		let jft = this.justFinishTurn()
		if (this.gameIsOver() || jft == null)
			return null
		else if (jft.dranWon())
			return jft.finishTurn()
		else
			return jft
	}
	playCard(i) {
		let hand = this.hands[this.dran]
		if (i >= hand.length)
			return null
		let card = hand[i]
		let newCardsDown = card.play(this.cardsDown)
		if (newCardsDown == null)
			return null
		let newHands = replaceIndex(this.dran,removeIndex(i,hand),this.hands)
		return new Game(newHands,this.dran,-1,this.deck,newCardsDown)
	}
	canPlayCard() {
		for (var i = 0; i < this.hands[this.dran].length; i++)
			if (this.playCard(i) != null)
				return true
		return false
	}
	drawCard() {
		if (this.canPlayCard() || this.canEndTurn())
			return null
		let cardDrawn = this.deck[0]
		let newHands = replaceIndex(this.dran,[cardDrawn].concat(this.hands[this.dran]),this.hands)
		let added = new Game(newHands,this.dran,this.dranState+1,removeIndex(0,this.deck),this.cardsDown)
		let played = added.playCard(0)
		if (played != null)
			return played
		else
			return added
	}
}
