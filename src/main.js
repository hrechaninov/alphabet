import { Application } from "./components/application";

window.addEventListener("load", onLoad);

function onLoad(){
	const app = new Application();

	if("serviceWorker" in navigator){
		navigator.serviceWorker.register("./sw.js");
	}
}