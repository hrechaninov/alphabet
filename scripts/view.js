export class InterfaceItem{
	constructor(DOM_element){
		this._element = DOM_element;
		this._isOnScreen = false;
		this._width = DOM_element.offsetWidth;
		this._height = DOM_element.offsetHeight;
		this._top = DOM_element.offsetTop;
		this._left = DOM_element.offsetLeft;
	}
	toggle(){
		this._isOnScreen = !this._isOnScreen;
	}
	show(){
		this.toggle();
		this._animationShow(this._element);
	}
	hide(){
		this.toggle();
		this._animationHide(this._element);
	}
	set animationShow(animationFunction){
		this._animationShow = animationFunction;
	}
	set animationHide(animationFunction){
		this._animationHide = animationFunction;
	}
	get element(){
		return this._element;
	}
	get isOnScreen(){
		return this._isOnScreen;
	}
}