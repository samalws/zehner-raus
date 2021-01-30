function replaceIndex(i,elem,arr) {
	let arr2 = [...arr]
	arr2[i] = elem
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
}
