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
        console.log('adding bag',bags[i].id,'to node',bags[i].pos);
        window.nodes[bags[i].pos].bags.push(bags[i]);
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttributeNS(null, "id", 'bag' + bags[i].id);
        rect.setAttributeNS(null, "fill", "brown");
        rect.setAttributeNS(null, "x", window.nodes[bags[i].pos].dom.getAttributeNS(null, "x"));
        rect.setAttributeNS(null, "y", window.nodes[bags[i].pos].dom.getAttributeNS(null, "y"));
        rect.setAttributeNS(null, "height", 5);
        rect.setAttributeNS(null, "width", 5);
        document.getElementsByTagName('svg')[0].appendChild(rect);
      }
    }
  }
  s++;
  setTimeout(addBag,1000);
};
