import {InputFactory} from "./input.js";
import { eventBus } from "../eventBus.js";

export class PreferencesPage{
	constructor(element){
		this._container = element;
		this._startButton = this._container.querySelector("#start-button");
		this._inputsArr = this.initInputs();
		this._inputsIndxedObj = this.indexInputs();
		this.subscribe();
	}
	subscribe(){
		this._startButton.addEventListener("click", this.onStartButtonClick.bind(this));
		window.addEventListener("resize", this.onResize.bind(this));
	}
	onStartButtonClick(){
		eventBus.emit("startGame");
	}
	onResize(){
		if(!this._isShown){
			this._needToResize = true;
			return;
		}
		this._inputsArr.forEach(input => input.onResize());
	}
	initInputs(){
		const createInput = ({name, query, type}) => {
			const inputElement = document.querySelector(query);
			const container = inputElement.closest(".input-wrapper");
			return InputFactory.create(type, {name, container, inputElement});
		};
		// names must be unique
		const inputConfigs = [
			{name: "time", query: "#input-time", type: "value"},
			{name: "frequency", query: "#input-frequency", type: "value"},
			{name: "footLetter", query: "#input-foot-letter", type: "list"},
			{name: "fontSize", query: "#input-font-size", type: "value"},
			{name: "fontColor", query: "#input-font-color", type: "color"},
			{name: "backgroundColor", query: "#input-background-color", type: "color"},
			{name: "position", query: "#input-position", type: "list"},
			{name: "alphabet", query: "#input-alphabet", type: "list"}
		];

		return inputConfigs.map(createInput);
	}
	indexInputs(){
		const inputs = {};
		this._inputsArr.forEach(input => inputs[input.name] = input);
		return inputs;
	}
	update(dt = 0){
		this._inputsArr.forEach(input => input.update(dt));
	}
	draw(){
		this._inputsArr.forEach(input => input.draw());
	}
	show(){
		this._isShown = true;
		this._container.classList.remove("hidden");
		if(this._needToResize){
			this._needToResize = false;
			this.onResize();
		}
	}
	hide(){
		this._isShown = false;
		this._container.classList.add("hidden");
	}
	get exactValues(){
		return this._inputsArr.reduce((acc, curr) => {
			acc[curr.name] = curr.exactValue;
			return acc;
		}, {});
	}
	get values(){
		return this._inputsArr.reduce((acc, curr) => {
			acc[curr.name] = curr.value;
			return acc;
		}, {});
	}
	get json(){
		return JSON.stringify(this.values);
	}
	get allInputsValid(){
		return !this._inputsArr
			.map(input => input.isValid)
			.includes(false);
	}
	set values(prefsObj){
		for(let inputName in prefsObj){
			const input = this._inputsIndxedObj[inputName];

			if(!input) return;

			input.value = prefsObj[inputName];
		}
	}
}