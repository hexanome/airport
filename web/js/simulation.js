//simulation.js

var s = 0;

(function addBag() {
	for(var bag in  window.config.airport.bags){
		if(bag.time === s)
		var desk = document.getElementById("desk" + bag.pos);
	
	
		
	}
  s++;
	setTimeOut(addBag,1000);
})();
