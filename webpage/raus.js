// TODO sort

function replaceIndex(i,elem,arr) {
	const arr2 = [...arr]
	arr2[i] = elem
	return arr2
}
function removeIndex(i,arr) {
	const arr2 = [...arr]
	arr2.splice(i,1)
	return arr2
}
function shuffle(arr) {
	let i = arr.length
	while (i > 0) {
		const j = Math.floor(Math.random() * i)
		i--
		const tmp = arr[i]
		arr[i] = arr[j]
		arr[j] = tmp
	}
}

class Card {
	constructor(suit,number) {
		this.suit = suit
		this.number = number
	}
	play(cards) {
		if (this.number == 10)
			return cards.concat(this)
		for (i in cards) {
			const card = cards[i]
			if (this.suit != card.suit)
				continue

			if (this.number == 9 || this.number == 11) {
				if (card.number == 10)
					return cards.concat(this)
			} else if (this.number < 9) {
				if (this.number == card.number - 1)
					return replaceIndex(i,this,cards)
			} else { // ie, else if (this.number > 11) {
				if (this.number == card.number + 1)
					return replaceIndex(i,this,cards)
			}
		}
		return undefined
	}
	canPlay(cards) {
		return this.play(cards) != undefined
	}
}

class Game {
	// dran = the person whose turn it is, adrian moment lol
	// dranState: -2 if drew card that you can play but didnt play it yet, -1 if played a card, 0 if just starting turn, n if drawn n cards from deck
	constructor(hands,dran,dranState,deck,cardsDown,winOrder,numChanges,plrList) {
		this.hands = hands
		this.dran = dran
		this.dranState = dranState
		this.deck = deck
		this.cardsDown = cardsDown
		this.winOrder = winOrder
		this.numChanges = numChanges
		this.plrList = plrList
	}
	numPlayers() {
		return this.hands.length
	}
	gameIsOver() {
		return this.winOrder.length == this.numPlayers()
	}
	dranEmptyHand() {
		return this.hands[this.dran].length == 0
	}
	dranWon() {
		return this.winOrder.includes(this.dran)
	}
	canEndTurn() {
		return this.dranState == -1 || this.dranState == 3 || this.dranEmptyHand()
	}
	justEndTurn() {
		if (!this.canEndTurn())
			return undefined
		else if (this.dranEmptyHand() && !this.dranWon())
			return new Game(this.hands,(this.dran + 1) % this.numPlayers(),0,this.deck,this.cardsDown,this.winOrder.concat(this.dran),this.numChanges+1,this.plrList)
		else
			return new Game(this.hands,(this.dran + 1) % this.numPlayers(),0,this.deck,this.cardsDown,this.winOrder,this.numChanges+1,this.plrList)
	}
	endTurn() {
		const jft = this.justEndTurn()
		if (this.gameIsOver() || jft == undefined)
			return undefined
		else if (jft.dranWon())
			return jft.endTurn()
		else
			return jft
	}
	playCard(i) {
		if (this.dranState > 0)
			return undefined
		const hand = this.hands[this.dran]
		if (i >= hand.length)
			return undefined
		const card = hand[i]
		const newCardsDown = card.play(this.cardsDown)
		if (newCardsDown == undefined)
			return undefined
		const newHands = replaceIndex(this.dran,removeIndex(i,hand),this.hands)
		const adjustedGame = new Game(newHands,this.dran,-1,this.deck,newCardsDown,this.winOrder,this.numChanges+1,this.plrList)
		return this.dranState == -2 ? adjustedGame.endTurn() : adjustedGame
	}
	cardIsPlayable(card) {
		return card.play(this.cardsDown) !== undefined
	}
	canPlayCard() {
		for (i in this.hands[this.dran])
			if (this.playCard(i) != undefined)
				return true
		return false
	}
	cardIsPlayable(card) {
        	return card.play(this.cardsDown) !== undefined
    	}
	drawCard() {
		if (this.canPlayCard() || this.canEndTurn())
			return undefined
		const cardDrawn = this.deck[0]
		const isPlayable = this.cardIsPlayable(cardDrawn)
		const newHands = replaceIndex(this.dran,[cardDrawn].concat(this.hands[this.dran]),this.hands)
		const newDranState = isPlayable ? -2 : this.dranState+1
		return new Game(newHands,this.dran,newDranState,removeIndex(0,this.deck),this.cardsDown,this.winOrder,this.numChanges+1,this.plrList)
	}
}

function cardFromObj(obj) { // make Card from an obj that doesnt have methods
	return new Card(obj.suit,obj.number)
}
function gameFromObj(obj) { // make Game from an obj that doesnt have methods
	const hands = obj.hands.map((x) => x.map(cardFromObj))
	const deck = obj.deck.map(cardFromObj)
	return new Game(hands,obj.dran,obj.dranState,deck,obj.cardsDown,obj.winOrder,obj.numChanges,obj.plrList)
}
function gameFromJSON(str) {
	return gameFromObj(JSON.parse(str))
}

const numSuits = 4
const numInSuit = 20
const allCards = []
for (var suit = 0; suit < numSuits; suit++)
	for (var num = 0; num <= numInSuit; num++)
		allCards.splice(allCards.length,0,new Card(suit,num))

function firstDran(hands) {
	for (var suit = 0; suit < numSuits; suit++)
		for (dran in hands)
			for (cardIndex in hands[dran]) {
				const card = hands[dran][cardIndex]
				if (card.suit == suit && card.number == 10)
					return parseInt(dran)
			}
	return Math.floor(Math.random()*hands.length)
}

function generateGame(plrList) {
	const numPlayers = plrList.length
	if (numPlayers < 2 || numPlayers > 6) return undefined

	const numCardsToDeal = 60 / numPlayers
	const deck = [...allCards]
	shuffle(deck)
	const hands = []
	for (var i = 0; i < numPlayers; i++)
		hands.splice(i,0,deck.splice(0,numCardsToDeal))
	return new Game(hands,firstDran(hands),0,deck,[],[],0,plrList)
}
