import { eventBus } from "../eventBus";

export class Timer{
	constructor(element, {time = 5 * 60 * 1000}){
		this._element = element;
		this._timeLeft = time;
		this._formattedTime = "";
	}
	update(dt){
		this._timeLeft = Math.max(0, this._timeLeft - dt);
		
		const formattedTime = this.formattedTime;
		if(this._element.innerHTML !== formattedTime){
			this._element.innerHTML = formattedTime;
		}
		if(this._timeLeft === 0){
			eventBus.emit("timeOver");
		}
	}
	get formattedTime(){
		const millisecondsIn = {
			day: 1000 * 60 * 60 * 24,
			hour: 1000 * 60 * 60,
			minute: 1000 * 60,
			second: 1000
		};
		
		const days = Math.floor(this._timeLeft / millisecondsIn.day);
		const hours = Math.floor((this._timeLeft - days * millisecondsIn.day) / millisecondsIn.hour);
		const minutes = Math.floor((this._timeLeft - days * millisecondsIn.day - hours * millisecondsIn.hour)
			/ millisecondsIn.minute);
		const seconds = Math.floor((this._timeLeft - days * millisecondsIn.day - hours * millisecondsIn.hour
			- minutes * millisecondsIn.minute) / millisecondsIn.second);

		const daysDisplay = {
			required: days > 0,
			value: `${days}`
		};
		const hoursDisplay = {
			required: hours > 0 || daysDisplay.required,
			value: hours < 10 ? `0${hours}` : `${hours}`
		};
		const minutesDisplay = {
			required: true,
			value: minutes < 10 ? `0${minutes}` : `${minutes}`
		};
		const secondsDisplay = {
			required: true,
			value: seconds < 10 ? `0${seconds}` : `${seconds}`
		};

		let formattedTime = "";

		if(daysDisplay.required) formattedTime += `${daysDisplay.value}:`;
		if(hoursDisplay.required) formattedTime += `${hoursDisplay.value}:`;
		formattedTime += `${minutesDisplay.value}:${secondsDisplay.value}`;
		
		return formattedTime;
	}
	get timeLeft(){
		return this._timeLeft;
	}
	set time(t){
		this._timeLeft = t;
	}
}