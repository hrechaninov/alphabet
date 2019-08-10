class EventBus{
	constructor(){
		this._events = {};
	}
	addEventListener(eventName, callback){
		this._events[eventName] = this._events[eventName] || [];
		this._events[eventName].push(callback);
	}
	emit(eventName, eventObj = {}){
		const callbacks = this._events[eventName] || [];
		callbacks.forEach(callback => callback(eventObj));
	}
}
export const eventBus = new EventBus();