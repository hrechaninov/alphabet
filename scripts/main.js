const game = {
	id: 0,
	period: 1000,
	periodMeasure: 's',
	time: 60000,
	timeMeasure: 's',
	isGoing: false,
	alphabit: "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЮЯ",
	armsLegs: "ЛЛППВ",
	countDown: 4000,
	cardWidth: 120,
	cardHeight: 180,
}

$(document).ready(function(){
	const startGame = () => new Promise(function(resolve){
		function getRandomCoordinate(direction){
			let screen = $("#main-screen");
			let coord;
			if(direction === "left"){
				coord = Math.floor(Math.random()*screen.innerWidth());
				if(coord + game.cardWidth > screen.innerWidth())
					coord -= game.cardWidth;
				if(coord - game.cardWidth > 0)
					coord -= game.cardWidth;
				if(coord < 0 || coord + game.cardWidth > screen.innerWidth())
					console.log('fail, width ' + coord);
			}
			else if(direction === "top"){
				coord = Math.floor(Math.random()*screen.innerHeight());
				if(coord + game.cardHeight > screen.innerHeight())
					coord -= game.cardHeight;
				if(coord - game.cardHeight > 0)
					coord -= game.cardHeight;
				if(coord < 0 || coord + game.cardHeight > screen.innerHeight())
					console.log('fail, height ' + coord);
			}
			return coord;
		}
		//слухає натискання esc для закінчення гри
		$('body').keydown(function(e){
			if(e.which == 27)
				resolve();
		})

		initializeInputs();
		let id = game.id;

		game.isGoing = true;
		//створюється div на весь екран, в межах якого відбувається гра
		let screen = $('#main-screen');
		screen.css({display: 'block'});
		screen.append('<div id = "card"><div/>');

		//створюється картка з випадковою буквою з алфавіту
		let card = $('#card');
		card.append("<p>" + game.alphabit[Math.floor(Math.random()*game.alphabit.length)] + "</>");
		card.append("<p id = 'arms'>" + game.armsLegs[Math.floor(Math.random()*game.armsLegs.length)] + "</>");
		card.append("<p id = 'legs'>" + game.armsLegs[Math.floor(Math.random()*game.armsLegs.length)] + "</>");
		card.css({width: game.cardWidth + "px", height: game.cardHeight + "px"});
		card.css({top: screen.innerHeight()/2 - card.innerHeight()/2,
				  left: screen.innerWidth()/2 - card.innerWidth()/2});

		//картка отримує нове випадкове значення і координату з інтервалом з game
		let gameInterval = setInterval(function(){
			card.text(game.alphabit[Math.floor(Math.random()*game.alphabit.length)]);
			card.append("<p id = 'arms'>" + game.armsLegs[Math.floor(Math.random()*game.armsLegs.length)] + "</>");
			card.append("<p id = 'legs'>" + game.armsLegs[Math.floor(Math.random()*game.armsLegs.length)] + "</>");
			card.css({left: getRandomCoordinate("left"),
					  top: getRandomCoordinate("top")});
		}, game.period);

		let gameTime = setTimeout(function(){
			if (id != game.id) //якщо це лічильник не з цієї гри
				return;        //вийти з функції
			resolve();
		}, game.time)
	});

	const initializeInputs = () => new Promise(function(){
		if(+$('#input-period').val()){
			game.period = +$('#input-period').val();
			if(game.periodMeasure == 's')
				game.period *= 1000;
		}
		if(+$('#input-time').val()){
			game.time = +$('#input-time').val();
			if(game.timeMeasure == 's')
				game.time *= 1000;
			if(game.timeMeasure == 'min')
				game.time *= 60000;
		}
		game.id = Math.floor(Math.random()*1000000000);
		game.isGoing = false;
		game.countDown = 4000;
	})

	const endGame = function(){
		game.isGoing = false;
		$('#card').remove();
		$('#main-screen').hide();
		$('#menu-screen').show();
	}

	const slideInterface = duration => new Promise(resolve => $('#menu-screen').slideUp(duration, resolve));

	const showCountDown = () => new Promise(function(resolve){

		let screen = $('#main-screen');
		screen.css({display: 'block'});

		screen.append('<div id = "countDown"><div/>');
		let countDown = $('#countDown');
		countDown.css({top: screen.innerHeight()/2 - countDown.innerHeight()/2,
					   left: screen.innerWidth()/2 - countDown.innerWidth()/2});

		let countdownInterval = setInterval(function(){
			countDown.text(game.countDown/1000 - 1);
			game.countDown -= 1000;
			if(game.countDown <= 0){
				clearInterval(countdownInterval);
				countDown.remove();
				resolve();
			}
		}, 1000)
	});

	$('#start-button').click(function(){
		let animationDuration = 300;

		slideInterface(animationDuration)
			.then(showCountDown)
			.then(startGame)
			.then(endGame);
	});
	$('#period-button').click(function(){
		if($(this).text() == 'с'){
			$(this).text('мс');
			game.periodMeasure = 'ms';
			if(+$('#input-period').val()){
				$('#input-period').val($('#input-period').val()*1000);
			}
		}
		else{
			$(this).text('с');
			game.periodMeasure = 's';
			if(+$('#input-period').val()){
				$('#input-period').val($('#input-period').val()/1000);
			}
		}
	});
	$('#time-button').click(function(){
		if($(this).text() == 'с'){
			$(this).text('хв');
			game.timeMeasure = 'min';
			if(+$('#input-time').val()){
				$('#input-time').val($('#input-time').val()/60);
			}
		}
		else{
			$(this).text('с');
			game.timeMeasure = 's';
			if(+$('#input-time').val()){
				$('#input-time').val($('#input-time').val()*60);
			}
		}
	});
	$('#period-button').attr("title", "одиниці часу\n'с' - секунди\n'мс' - мілісекунди\nв одній секунді 1000 мілісекунд");
	$('#time-button').attr("title", "одиниці часу\n'с' - секунди\n'хв' - хвилини");
});