export class InputFactory{
	static create(type, config){
		if(type === "value") return new ValueInput(config);
		if(type === "list") return new ListInput(config);
		if(type === "color") return new ColorInput(config);
	}
}
class Input{
	constructor({name, container, inputElement}){
		this._name = name;
		this._container = container;
		this._element = inputElement;
		this.value = this._element.value;
		this._isValid = true;
		this._isFocused = false;
		this._caretAnimationDelay = 0;
		this._eventListeners = {};

		this.updateTextStyle();
		this.createAndAppendCanvas();
		this.subscribe();
		this.updateCaretPosition(this._value.length);
		this.draw();
	}
	createAndAppendCanvas(){
		this._canvas = document.createElement("canvas");
		this._ctx = this._canvas.getContext("2d");
		this.updateCanvasSizeAndPosition();
		this._canvas.classList.add("input-canvas");
		this._container.appendChild(this._canvas);
	}
	updateCanvasSizeAndPosition(){
		const globalDimentions = this._container.getBoundingClientRect();
		const localDimentions = this._element.getBoundingClientRect();
		
		this._canvas.width = Math.round(localDimentions.width);
		this._canvas.height = localDimentions.height;
		this._canvas.style.top = `${localDimentions.top - globalDimentions.top}px`;
		this._canvas.style.left = `${localDimentions.left - globalDimentions.left}px`;
	}
	updateTextStyle(){
		const removeUnits = value => parseInt(value.match(/\d+/)[0], 10);
		const inputComputedStyle = window.getComputedStyle(this._element);
		this._textStyle = {
			paddingLeft: removeUnits(inputComputedStyle.paddingLeft),
			fontSize: removeUnits(inputComputedStyle.fontSize),
			fontFamily: inputComputedStyle.fontFamily
		};
	}
	updateCaretPosition(pos){
		const removeUnits = value => parseInt(value.match(/\d+/)[0], 10);
		this._ctx.font = `${this._textStyle.fontSize}px ${this._textStyle.fontFamily}`;

		const textBeforeCaret = this._value.slice(0, pos);
		const textBeforeCaretWidth = this._ctx.measureText(textBeforeCaret).width;
		const position = removeUnits(this._canvas.style.left) + textBeforeCaretWidth + this._textStyle.paddingLeft;

		this._container.style.setProperty("--caret-left", `${position}px`);
		this.removeCaretAnimation();
	}
	update(dt){
		if(!this._isFocused) return;

		this._caretAnimationDelay -= dt;
		if(this._caretAnimationDelay < 0){
			this.addCaretAnimation();
		}
	}
	subscribe(){
		this._element.addEventListener("input", this.onUserInput.bind(this));
		this._element.addEventListener("keydown", this.onUserKeyPress.bind(this));
		this._element.addEventListener("focus", this.onFocus.bind(this));
		this._element.addEventListener("mouseup", this.onUserMouseUp.bind(this));
		this._element.addEventListener("mousedown", this.onUserMouseDown.bind(this));
		this._element.addEventListener("blur", this.onBlur.bind(this));
	}
	onResize(){
		this.updateTextStyle();
		this.updateCaretPosition();
		this.updateCanvasSizeAndPosition();
	}
	onUserInput(e){
		this.value = e.currentTarget.value;
		this.updateCaretPosition(e.currentTarget.selectionStart);
		this.draw();
	}
	onFocus(e){
		const target = e.currentTarget;
		this._isFocused = true;
		this._container.classList.add("focused");
		setTimeout(() => this.updateCaretPosition(target.selectionStart), 0);
	}
	onBlur(e){
		const target = e.currentTarget;
		this._isFocused = false;
		this._container.classList.remove("focused");
		setTimeout(() => this.updateCaretPosition(target.selectionStart), 0);
	}
	onUserKeyPress(e){
		const target = e.currentTarget;
		setTimeout(() => this.updateCaretPosition(target.selectionStart), 0);
	}
	onUserMouseDown(e){
		const target = e.currentTarget;
		setTimeout(() => this.updateCaretPosition(target.selectionStart), 0);
	}
	onUserMouseUp(e){
		const target = e.currentTarget;
		setTimeout(() => this.updateCaretPosition(target.selectionStart), 0);
	}
	addCaretAnimation(){
		this._container.classList.add("animate-caret");
	}
	removeCaretAnimation(){
		this._caretAnimationDelay = Input.caretAnimationDelay;
		this._container.classList.remove("animate-caret");
	}
	addErrorUnderline(){
		this._container.classList.add("invalid");
	}
	removeErrorUnderline(){
		this._container.classList.remove("invalid");
	}
	draw(){
		const accumulatePaddings = (acc, curr) => {
			if(!curr || !curr.text) return acc;
			return this._ctx.measureText(curr.text).width + acc;
		};
		const drawFormattedText = ({text, type}, i, arr) => {
			const prevFragmentsWidth = i > 0 ? arr.slice(0, i).reduce(accumulatePaddings, 0) : 0;
			const paddingLeft = this._textStyle.paddingLeft + prevFragmentsWidth;
			const valueType = Input.inputValueTypes.find(value => value.type === type) || 
				Input.inputValueTypes.find(value => value.type === "default");

			this._ctx.fillStyle = valueType.color;
			this._ctx.fillText(text, paddingLeft, this._textStyle.fontSize);
		};
		const drawRaw = text => {
			this._ctx.fillStyle = Input.inputValueTypes.find(value => value.type === "default").color;
			this._ctx.fillText(text, this._textStyle.paddingLeft, this._textStyle.fontSize);
		};
		const drawFragment = ({text = "", type}, i, arr) => {
			if(!type){
				drawRaw(this._value);
			}
			else{
				drawFormattedText({text, type}, i, arr);
			}
		};

		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		this._ctx.font = `${this._textStyle.fontSize}px ${this._textStyle.fontFamily}`;
		this._formatedValue.forEach(drawFragment);
	}
	validate(val){
		const units = Input.reservedWords
			.filter(word => word.type === "unit")
			.map(word => word.value)
			.join("|");
		const listWords = Input.reservedWords
			.filter(word => word.type === "list")
			.map(word => word.value)
			.join("|");
		const pattern = `(^(\\d*\\.*\\d+)(${units})\\s*$)|^(${listWords})\\s*$|^\\s*$|(^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$)`;
		const expression = new RegExp(pattern);
		const match = expression.exec(val);

		this._isValid = expression.test(val);
		if(this._isValid){
			const formattedValue = [
				{text: match[2], type: "number"},
				{text: match[3], type: "unit"},
				{text: match[4], type: "list"},
				{text: match[5], type: "color"}
			];
			this.removeErrorUnderline();
			return formattedValue.filter(value => !!value.text);
		}
		else{
			return [{}];
		}
	}
	get name(){
		return this._name;
	}
	get value(){
		return this._value;
	}
	get exactValue(){
		return Input.toExactValue(this._value);
	}
	get isValid(){
		if(!this._isValid || !this._value.length > 0) this.addErrorUnderline();
		return this._isValid && this._value.length > 0;
	}
	set value(val){
		this._value = val;
		this._element.value = val;
		this._formatedValue = this.validate(val);
	}

	static get caretAnimationDelay(){
		return 200;
	}
	static get reservedWords(){
		return [
			{ value: "px", type: "unit" },
			{ value: "pt", type: "unit" },
			{ value: "pc", type: "unit" },
			{ value: "in", type: "unit" },
			{ value: "cm", type: "unit" },
			{ value: "mm", type: "unit" },
			{ value: "em", type: "unit" },
			{ value: "rem", type: "unit" },
			{ value: "min", type: "unit" },
			{ value: "s", type: "unit" },
			{ value: "ms", type: "unit" },
			{ value: "no", type: "list" },
			{ value: "none", type: "list" },
			{ value: "off", type: "list" },
			{ value: "yes", type: "list" },
			{ value: "on", type: "list" },
			{ value: "latin", type: "list" },
			{ value: "cyrillic", type: "list" },
			{ value: "ukrainian", type: "list" },
			{ value: "static", type: "list" },
			{ value: "random", type: "list" },
		];
	}
	static get inputValueTypes(){
		return [
			{type: "number", color: "#AE81FF"},
			{type: "color", color: "#AE81FF"},
			{type: "unit", color: "#F92672"},
			{type: "list", color: "#45CBEF"},
			{type: "default", color: "white"}
		];
	}
	static toExactValue(val){
		const truthy = /^(?:yes|on)$/;
		const falsy = /^(?:no|none|off)$/;
		const units = /^(\d+\.*\d*)(px|pt|pc|in|cm|mm|em|rem|min|s|ms)$/;
		const isTruthy = truthy.test(val);
		const isFalsy = falsy.test(val);
		const isValueWithUnit = units.test(val);
		const value = isValueWithUnit ? parseFloat(units.exec(val)[1]) : 0;
		const unit = isValueWithUnit ? units.exec(val)[2] : "default";

		if(isTruthy) return true;
		if(isFalsy) return false;
		if(isValueWithUnit){
			const unitMultipliers = {
				default: 1,
				px: 1,
				pt: 1.33,
				pc: 16,
				in: 96,
				cm: 37.79,
				mm: 377.95,
				em: 16,
				rem: 16,
				min: 60 * 1000,
				s: 1000,
				ms: 1
			};
			return value * unitMultipliers[unit];
		}

		return val;
	}
}

class ColorInput extends Input{
	constructor({name, container, inputElement}){
		super({name, container, inputElement});
		this.updateCanvasSizeAndPosition();
	}
	onUserInput(e){
		this.value = e.currentTarget.value;
		this.updateCaretPosition(e.currentTarget.selectionStart);
		this.draw();
	}
	updateCanvasSizeAndPosition(){
		const globalDimentions = this._container.getBoundingClientRect();
		const localDimentions = this._element.getBoundingClientRect();
		const colorInputShift = this._colorInputShift ? localDimentions.height + this._textStyle.fontSize / 2 : 0;
		// const colorInputShift = this._colorInputShift ? 0 : 0;
		
		this._element.style.setProperty("--shift", `${colorInputShift}px`);
		this._canvas.width = Math.round(localDimentions.width);
		this._canvas.height = localDimentions.height;
		this._canvas.style.top = `${localDimentions.top - globalDimentions.top}px`;
		this._canvas.style.left = `${localDimentions.left - globalDimentions.left - colorInputShift}px`;
	}
	updateCaretPosition(pos){
		const removeUnits = value => {
			const pattern = /\d+/;
			return parseInt(value.match(pattern)[0], 10);
		};
		this._ctx.font = `${this._textStyle.fontSize}px ${this._textStyle.fontFamily}`;

		const textBeforeCaret = this._value.slice(0, pos);
		const textBeforeCaretWidth = this._ctx.measureText(textBeforeCaret).width;
		const colorInputShift = this._colorInputShift ? this._canvas.height + this._textStyle.fontSize / 2 : 0;
		const position = removeUnits(this._canvas.style.left) + textBeforeCaretWidth +
			this._textStyle.paddingLeft + colorInputShift;

		this._container.style.setProperty("--caret-left", `${position}px`);
		this._element.style.setProperty("--shift", `${colorInputShift}px`);
		this._element.classList.add("color-shift");
		this.removeCaretAnimation();
	}
	draw(){
		const accumulatePaddings = (acc, curr) => {
			if(!curr || !curr.text) return acc;
			return this._ctx.measureText(curr.text).width + acc;
		};
		const drawValidColor = ({text}, i, arr) => {
			const prevFragmentsWidth = i > 0 ? arr.slice(0, i).reduce(accumulatePaddings, 0) : 0;
			const colorBoxWidth = this._canvas.height;
			const colorBoxPadding = this._textStyle.fontSize;
			const paddingLeft = this._textStyle.paddingLeft + prevFragmentsWidth + colorBoxWidth + colorBoxPadding / 2;

			this._ctx.fillStyle = text;
			this._ctx.strokeStyle = "white";
			this._ctx.fillRect(colorBoxPadding / 2, 0, colorBoxWidth, colorBoxWidth);
			this._ctx.strokeRect(colorBoxPadding / 2, 0, colorBoxWidth, colorBoxWidth);
			this._ctx.fillStyle = ColorInput.inputValueType.color;
			this._ctx.fillText(text, paddingLeft, this._textStyle.fontSize);
		};
		const drawInvalidColor = ({text}, i, arr) => {
			const prevFragmentsWidth = i > 0 ? arr.slice(0, i).reduce(accumulatePaddings, 0) : 0;
			const paddingLeft = this._textStyle.paddingLeft + prevFragmentsWidth;

			this._ctx.fillStyle = ColorInput.inputValueType.color;
			this._ctx.fillText(text, paddingLeft, this._textStyle.fontSize);
		};

		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		this._ctx.font = `${this._textStyle.fontSize}px ${this._textStyle.fontFamily}`;
		if(this._isValid){
			this._formatedValue.forEach(drawValidColor);
		}
		else{
			this._formatedValue.forEach(drawInvalidColor);
		}
	}
	validate(val){
		const expression = new RegExp("^#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
		const match = expression.exec(val);

		this._isValid = expression.test(val);
		if(this._isValid){
			this._colorInputShift = true;
			return [{text: match[0], type: "color"}];
		}
		else{
			this._colorInputShift = false;
			return [{text: val, type: "color"}];
		}
	}
	get type(){
		return "color";
	}
	static get inputValueType(){
		return {type: "color", color: "#AE81FF"};
	}
}

class ListInput extends Input{
	constructor({name, container, inputElement}){
		super({name, container, inputElement});
	}
	get type(){
		return "list";
	}
}

class ValueInput extends Input{
	constructor({name, container, inputElement}){
		super({name, container, inputElement});
	}
	get type(){
		return "value";
	}
}