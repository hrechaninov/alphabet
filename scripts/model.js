export class Alphabet{
	constructor(letters){
		this._letters = letters;
	}
	get randomLetter(){
		return this._letters[Math.floor(Math.random()*this._letters.length)];
	}
}
export class Card{
	constructor(alphabet){
		this._alphabet = alphabet;
	}
	update(){
		const sides = ["right", "left", "both"];

		this._mainLetter = this._alphabet.randomLetter;
		this._armLetter = sides[Math.floor(Math.random()*sides.length)];
		this._legLetter = sides[Math.floor(Math.random()*sides.length)];
	}
	get mainLetter(){
		return this._mainLetter;
	}
	get armLetter(){
		return this._armLetter;
	}
	get legLetter(){
		return this._legLetter;
	}
}
export class Preferences{
	constructor(){
		this.initDefault();
	}
	initDefault(){
		this._userChoise = [];
		this._interfaceLang = "uk";
		this._alphabet = "uk";
		this._time = 5*60*1000;
		this._interval = 1000;
		this._fontSize = 60;
	}
	addUserChoise(param){
		if(!this._userChoise.includes(param)){
			this._userChoise.push(param);
		}
	}
	static toLocalStorage(prefs){
		localStorage.setItem("preferences", json.stringify(prefs));
	}
	static haveLocalCopy(){
		const localPrefs = json.parse(localStorage.getItem("preferences"));

		if(localPrefs === null){
			return false;
		}
		else{
			return true;
		}
	}
	static fromLocalStorage(prefs){
		prefs = json.parse(localStorage.getItem("preferences"));
	}
	set interfaceLang(lang){
		this._interfaceLang = lang;
	}
	set alphabet(alphabet){
		this._alphabet = alphabet;
	}
	set time(time){
		this._time = time;
	}
	set interval(interval){
		this._interval = interval;
	}
	set fontSize(size){
		this._fontSize = size;
	}
}