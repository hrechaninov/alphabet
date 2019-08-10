import { PreferencesPage } from "./preferencesPage";
import { GamePage } from "./gamePage";
import { eventBus } from "../eventBus";

export class Application{
	constructor(){
		this._prefs = new PreferencesPage(document.querySelector("#prefs-page"));
		this._game = new GamePage(document.querySelector("#game-page"));
		this._currentPage = "prefs";
		this._lastUpdate = 0;
		this.onMount();
		this.subscribe();
		requestAnimationFrame(this.update());
	}
	onMount(){
		const localMemoryPrefs = this.getPrefsFromLocalMemory();

		if(localMemoryPrefs){
			this._prefs.values = localMemoryPrefs;
		}
	}
	subscribe(){
		eventBus.addEventListener("startGame", this.startGame.bind(this));
		eventBus.addEventListener("stopGame", this.endGame.bind(this));
	}
	startGame(){
		if(!this.applyPreferences()) return;

		if(this._game.isOnPause) this._game.togglePause();
		this.setPrefsToLocalMemory();
		this._currentPage = "game";
		this._prefs.hide();
		this._game.show();
	}
	endGame(){
		this._currentPage = "prefs";
		this._prefs.show();
		this._game.hide();
	}
	applyPreferences(){
		if(!this._prefs.allInputsValid){
			return false;
		}
		const prefs = this._prefs.exactValues;
		this._game.preferences = prefs;
		return true;
	}
	update(){
		return t => {
			const dt = Math.min(167, t - this._lastUpdate); // 167 is 10 frames 16.7ms each
			this._lastUpdate = t;

			
			if(this._currentPage === "prefs"){
				this._prefs.update(dt);
				this._prefs.draw();
			}
			else if(this._currentPage === "game"){
				this._game.update(dt);
				this._game.draw();
			}

			requestAnimationFrame(this.update());
		};
	}
	setPrefsToLocalMemory(){
		localStorage.setItem("preferences", this._prefs.json);
	}
	getPrefsFromLocalMemory(){
		const prefs = localStorage.getItem("preferences");

		if(!prefs) return null;

		return JSON.parse(prefs);
	}
}