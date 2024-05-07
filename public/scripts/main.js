/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.channel = 1;
rhit.screensaver = 0;

/** function and class syntax examples */
rhit.updateCounter = function (amount) {
	if(amount == 1){
		if(rhit.channel == 5){
			rhit.channel = 9;
		} else if(rhit.channel == 9){
			rhit.channel = 1;
		} else {
			rhit.channel += 1;
		}
	} else if (amount == -1){
		if(rhit.channel == 9){
			rhit.channel = 5;
		} else if(rhit.channel == 1){
			rhit.channel = 9;
		} else {
			rhit.channel -= 1;
		}
	} else if(amount == 0 && rhit.screensaver == 0){
		document.getElementById("televisionImage").src = "images/screensaver.gif";
		rhit.screensaver = 1;
	} else if(amount == 0 && rhit.screensaver == 1){
		document.getElementById("televisionImage").src = "images/tv_" + rhit.channel + ".jpeg";
		rhit.screensaver = 0;
	}
	if(amount != 0){
		rhit.updateNumber();
	}
};

rhit.updateNumber = function () {
	document.querySelector("#channelNum").innerHTML = "Ch. " + rhit.channel;
	document.getElementById("televisionImage").src = "images/tv_" + rhit.channel + ".jpeg";
};

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	const buttons = document.querySelectorAll("#mainButtons button");

	for(const button of buttons){
		button.onclick = (event) => {
			const dataAmount = parseInt(button.dataset.amount);
			//console.log('Amount', dataAmount, 'isMulti:', dataIsMultiplication);
			rhit.updateCounter(dataAmount);
		};
	}
};

rhit.main();
