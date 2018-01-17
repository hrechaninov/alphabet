import {Alphabet} from "./model";
import {Card} from "./model";
import {assert} from "chai";

describe("Alphabet class", function(){
	const abc = new Alphabet("ABC");
	const rndLetter = abc.randomLetter;

	it("should return a string type", function(){
		assert.equal(typeof(rndLetter), "string");
	})
	it("should return only one letter", function(){
		assert.equal(rndLetter.length, 1);
	})
})

describe("Card class", function(){
	const abc = new Alphabet("ABC");
	const rndLetter = abc.randomLetter;
	const card = new Card(abc);
	card.update();

	it("should return one of sides for arm letter", function(){
		assert.oneOf(card.armLetter, ["right", "left", "both"])
	})
	it("should return one of sides for leg letter", function(){
		assert.oneOf(card.legLetter, ["right", "left", "both"])
	})
})