//simulation.js

var s = 0;

function startSim() {
  s = 0;
  addBag();
}

function addBag() {
  if ( window.config && window.config.auto ) {
    var bags = window.config.airport.bags;
    for(var i in bags ){
      if(bags[i].time === s) {
        window.nodes[bags[i].pos].bags.push(bags[i]);
      }
    }
  }
  s++;
  setTimeout(addBag,1000);
};
