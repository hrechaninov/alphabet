import $ from "jquery";

class InterfaceItem{
	constructor(query){
		this._query = query;
		this._isOnScreen = false;
	}
	toggle(){
		this._isOnScreen = !this._isOnScreen;
	}
	show(){
		this.toggle();
		if(typeof(this._animationShow) == "function"){
			this._animationShow(this._query);
		}
	}
	hide(){
		this.toggle();
		if(typeof(this._animationHide) == "function"){
			this._animationHide(this._query);
		}
	}
	onClick(){
		this._functionOnClick();
		if(typeof(this._animationOnClick) == "function"){
			this._animationOnClick(this._query);
		}
	}
	set animationShow(animationFunction){
		this._animationShow = animationFunction;
	}
	set animationHide(animationFunction){
		this._animationHide = animationFunction;
	}
	set animationOnClick(animationFunction){
		this._animationOnClick = animationFunction;
	}
	set functionOnClick(functionOnClick){
		this._functionOnClick = functionOnClick;
	}
	get query(){
		return this._query;
	}
	get isOnScreen(){
		return this._isOnScreen;
	}
}
class Card extends InterfaceItem{
	constructor(query){
		super(query);
	}
	set fontSize(size){
		this._fontSize = size;
		this._query.css({"font-size": `${size}pt`});
	}
	set fontColor(color){
		this._fontColor = color;
		this._query.css({"color": color});
	}
	set borderWidth(width){
		this._borderWidth = width;
		this._query.css({"border-width": `${width}px`});
	}
	set borderColor(color){
		this._borderColor = color;
		this._query.css({"border-color": color});
	}
}

export const startButton = new InterfaceItem($("#start-button"));
export const logoBar = new InterfaceItem($("#logo-bar"));
export const sidePanel = new InterfaceItem($("#side-panel"));
export const timerBar = new InterfaceItem($("#timer-bar"));
export const card  = new Card($("#card"));

