import { Timer } from "./timer";
import { Card } from "./card";
import { eventBus } from "../eventBus";

export class GamePage{
	constructor(container = document){
		this._container = container;
		this._canvas = container.querySelector("#game-page-canvas");
		this._buttonStop = container.querySelector("#stop-button");
		this._buttonPause = container.querySelector("#pause-button");
		this._timerGroup = container.querySelector(".timer-group-wrapper");
		this._ctx = this._canvas.getContext("2d");
		this._timeToHideInterface = GamePage.showInterfaceTime;
		this._isShowingInterface = true;
		this._hasFocusOnInterface = false;
		this._isOnPause = false;
		this.updateSize();
		this.subscribe();
	}
	subscribe(){
		eventBus.addEventListener("timeOver", this.onTimeOver.bind(this));
		window.addEventListener("resize", this.onResize.bind(this));
		this._container.addEventListener("pointermove", this.showInterface.bind(this));

		this._buttonPause.addEventListener("click", this.togglePause.bind(this));
		this._buttonPause.addEventListener("focus", this.focusOnInterface.bind(this));
		this._buttonPause.addEventListener("blur", this.blurOffInterface.bind(this));
		this._buttonPause.addEventListener("pointerenter", this.focusOnInterface.bind(this));
		this._buttonPause.addEventListener("pointerout", this.blurOffInterface.bind(this));

		this._buttonStop.addEventListener("click", this.stop.bind(this));
		this._buttonStop.addEventListener("focus", this.focusOnInterface.bind(this));
		this._buttonStop.addEventListener("blur", this.blurOffInterface.bind(this));
		this._buttonStop.addEventListener("pointerenter", this.focusOnInterface.bind(this));
		this._buttonStop.addEventListener("pointerout", this.blurOffInterface.bind(this));
	}
	updateObstacles(){
		this._safeAreas = [
			{
				x: 0,
				y: 0,
				width: window.innerWidth - this._card.box.width,
				height: window.innerHeight - this._card.box.height
			}
		];
		this.addObstacle(this._timerGroup.getBoundingClientRect());
	}
	updateSize(){
		this._canvas.width = window.innerWidth;
		this._canvas.height = window.innerHeight;
	}
	update(dt){
		if(this._isOnPause) return;

		this._timeToNextCardUpdate -= dt;
		this._timer.update(dt);

		if(this._timeToNextCardUpdate <= 0){
			this._timeToNextCardUpdate += this._cardFrequency;
			this._card.safeAreas = this.safeAreas;
			this._card.update();
		}
		if(this._isShowingInterface && !this._hasFocusOnInterface){
			this._timeToHideInterface -= dt;
			if(this._timeToHideInterface <= 0){
				this.hideInterface();
			}
		}
	}
	draw(){
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		this.drawCard(this._card.letters, this._card.box);
	}
	drawCard({vocal, hand, foot}, {x, y, width, padding, lineHeight, height}){
		this._ctx.font = `${this._prefs.fontSize}px Fira Code`;
		this._ctx.textBaseline = "bottom";
		this._ctx.fillStyle = this._fontColor;
		this._ctx.fillText(vocal.toUpperCase(), x + padding, y + lineHeight);
		this._ctx.fillText(hand.toUpperCase(), x + padding, y + lineHeight * 2);
		if(foot){
			this._ctx.fillText(foot.toUpperCase(), x + padding, y + lineHeight * 3);
		}
	}
	togglePause(){
		this._isOnPause = !this._isOnPause;
		this._buttonPause.classList.toggle("passive");
		this._buttonPause.classList.toggle("active");
	}
	pause(){
		this._isOnPause = true;
		this._buttonPause.classList.remove("passive");
		this._buttonPause.classList.add("active");
	}
	stop(){
		eventBus.emit("stopGame");
	}
	show(){
		this._container.classList.remove("hidden");
		this.updateObstacles();
	}
	showInterface(){
		if(this._isShowingInterface) return;

		this._timeToHideInterface = GamePage.showInterfaceTime;
		this._buttonStop.classList.remove("hidden");
		this._buttonPause.classList.remove("hidden");
		this._container.classList.remove("hide-cursor");
		this._isShowingInterface = true;
	}
	focusOnInterface(){
		this.showInterface();
		this._hasFocusOnInterface = true;
	}
	blurOffInterface(){
		this._hasFocusOnInterface = false;
	}
	hide(){
		this._container.classList.add("hidden");
	}
	hideInterface(){
		this._buttonStop.classList.add("hidden");
		this._buttonPause.classList.add("hidden");
		this._container.classList.add("hide-cursor");
		this._isShowingInterface = false;
	}
	onResize(){
		this.updateSize();
		if(this._timer) this.updateObstacles();
	}
	onTimeOver(){
		this.pause();
		this.showInterface();
	}
	addObstacle({x, y, width, height}){
		const obstacleRect = {
			x: Math.round((x - this._card.box.width) * 10) / 10,
			y: Math.round((y - this._card.box.height) * 10) / 10,
			width: Math.round((width + this._card.box.width) * 10) / 10,
			height: Math.round((height + this._card.box.height) * 10) / 10
		};
		const getIntersection = (rect1, rect2) => {
			const intersect = (min1, max1, min2, max2) => {
				const isInRange = (coord, min, max) => coord >= min && coord <= max;
				const min = isInRange(min1, min2, max2) ? min1 : isInRange(min2, min1, max1) ? min2 : null;
				const max = isInRange(max1, min2, max2) ? max1 : isInRange(max2, min1, max1) ? max2 : null;

				if(min === null || max === null) return null;

				return {min, max};
			};
			const horizontal = intersect(rect1.x, rect1.x + rect1.width, rect2.x, rect2.x + rect2.width);
			const vertical = intersect(rect1.y, rect1.y + rect1.height, rect2.y, rect2.y + rect2.height);

			if(!horizontal || !vertical) return null;

			return {
				x: horizontal.min,
				y: vertical.min,
				width: horizontal.max - horizontal.min,
				height: vertical.max - vertical.min
			};
		};
		const rectsAroundObstacle = [
			{
				x: 0,
				y: 0,
				width: obstacleRect.x,
				height: window.innerHeight
			},
			{
				x: obstacleRect.x,
				y: 0,
				width: obstacleRect.width,
				height: obstacleRect.y
			},
			{
				x: obstacleRect.x + obstacleRect.width,
				y: 0,
				width: window.innerWidth - obstacleRect.x - obstacleRect.width,
				height: window.innerHeight
			},
			{
				x: obstacleRect.x,
				y: obstacleRect.y + obstacleRect.height,
				width: obstacleRect.width,
				height: window.innerHeight - obstacleRect.y - obstacleRect.height
			}
		];
		const newSafeAreas = [];

		this._safeAreas.forEach(area => {
			rectsAroundObstacle.forEach(rect => {
				const newSafeArea = getIntersection(area, rect);
				if(newSafeArea) newSafeAreas.push(newSafeArea);
			});
		});
		this._safeAreas = newSafeAreas;
	}
	get isOnPause(){
		return this._isOnPause;
	}
	get safeAreas(){
		return this._safeAreas;
	}
	set preferences(prefsObj){
		this._prefs = prefsObj;
		this._card = new Card(prefsObj);
		this._cardFrequency = prefsObj.frequency;
		this._timeToNextCardUpdate = prefsObj.frequency;
		this.colors = prefsObj;
		this._timer = new Timer(this._container.querySelector("#timer"), prefsObj);
	}
	set colors({backgroundColor, fontColor}){
		const getContrastColor = hexColor => {
			const hex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/.exec(hexColor)[1];
			const fullHex = hex.length === 6 ?
				hex :
				hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
			const red = parseInt(fullHex.slice(0, 2), 16);
			const green = parseInt(fullHex.slice(2, 4), 16);
			const blue = parseInt(fullHex.slice(4, 6), 16);
			const isLight = red * 0.299 + green * 0.587 + blue * 0.114 > 186;

			if(isLight) return "#000";
			else return "#fff";
		};
		const contrastColor = getContrastColor(backgroundColor);
		this._fontColor = fontColor;
		this._container.style.setProperty("--color-game-page-primary", contrastColor);
		this._container.style.setProperty("--color-game-page-secondary", backgroundColor);
		if(contrastColor === "#000"){
			this._buttonPause.classList.add("dark");
			this._buttonStop.classList.add("dark");
			this._buttonPause.classList.remove("light");
			this._buttonStop.classList.remove("light");
		}
		else{
			this._buttonPause.classList.add("light");
			this._buttonStop.classList.add("light");
			this._buttonPause.classList.remove("dark");
			this._buttonStop.classList.remove("dark");
		}
	}
	static get showInterfaceTime(){
		return 2400;
	}
}