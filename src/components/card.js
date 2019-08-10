export class Card{
	constructor({alphabet = "latin", fontSize, position, footLetter = false}){
		this._alphabet = Card.getAlphabet(alphabet);
		this._hasFootLetter = footLetter;
		this._fontSize = fontSize;
		this._width = this.width;
		this._height = this.height;
		this._x = this.centerX;
		this._y = this.centerY;
		this._position = position;
		this._vocalLetter = this.randomLetter;
		this._handLetter = this.randomSideLetter;
		this._footLetter = this.randomSideLetter;

		this.subscribe();
		this.update();
	}
	subscribe(){
		window.addEventListener("resize", this.onResize.bind(this));
	}
	onResize(){
		this._width = this.width;
		this._height = this.height;
	}
	update(){
		const [x, y] = this._position === "static" ? this.centralCoords : this.randomCoords;

		this._timeToNextUpdate = this._frequency;
		this._vocalLetter = this.randomLetter;
		this._handLetter = this.randomSideLetter;
		this._footLetter = this._hasFootLetter ? this.randomSideLetter : null;
		this._x = x;
		this._y = y;
	}
	get randomLetter(){
		const randomIndex = Math.floor(Math.random() * this._alphabet.letters.length);
		return this._alphabet.letters[randomIndex];
	}
	get randomSideLetter(){
		const random = Math.random();

		if(random < 1 / 3) return this._alphabet.left;
		if(random < 2 / 3) return this._alphabet.right;
		else return this._alphabet.both;
	}
	get randomCoords(){
		if(!this._safeAreas || !this._safeAreas.length) return this.centralCoords;

		const getWeightedRandom = (list, weights) => {
			const totalWeight = weights.reduce((acc, prev) => acc + prev);
			const random = Math.random() * totalWeight;
			let weightsSum = 0;

			for(let i = 0; i < list.length; i++){
				weightsSum += weights[i];
				if(random <= weightsSum) return list[i];
			}
			return list[list.length];
		};
		const areaWeights = this._safeAreas.map(area => area.width * area.height);
		const randomArea = getWeightedRandom(this._safeAreas, areaWeights);
		const x = Math.floor(Math.random() * randomArea.width + randomArea.x);
		const y = Math.floor(Math.random() * randomArea.height + randomArea.y);

		return [x, y];
	}
	get centralCoords(){
		return [this.centerX, this.centerY];
	}
	get centerX(){
		return window.innerWidth / 2 - this._width / 2;
	}
	get centerY(){
		return window.innerHeight / 2 - this._height / 2;
	}
	get letters(){
		return {
			vocal: this._vocalLetter,
			hand: this._handLetter,
			foot: this._footLetter,
		};
	}
	get box(){
		return {
			x: this._x,
			y: this._y,
			padding: this.padding,
			lineHeight: this.lineHeight,
			width: this._width,
			height: this._height
		};
	}
	get padding(){
		return Math.round(this._fontSize / 2);
	}
	get lineHeight(){
		return Math.round(this._fontSize * 1.2);
	}
	get width(){
		const ctx = document.createElement("canvas").getContext("2d");

		ctx.font = `${this._fontSize}px Fira Code`;
		return this.padding * 2 + ctx.measureText("M").width;
	}
	get height(){
		const lettersAmount = this._hasFootLetter ? 3 : 2;
		return lettersAmount * this.lineHeight;
	}
	set safeAreas(areas){
		this._safeAreas = areas;
	}
	static getAlphabet(alphabet){
		const latin = {
			letters: "abcdefghiklmnopqrstvx",
			left: "l",
			right: "r",
			both: "b"
		};
		const ukrainian = {
			letters: "абгґдеєжзиіїйклмнопрстуфхцчшщюя",
			left: "л",
			right: "п",
			both: "р"
		};

		if(alphabet === "latin") return latin;
		if(alphabet === "ukrainian") return ukrainian;

		return latin;
	}
}