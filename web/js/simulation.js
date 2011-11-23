//simulation.js

var s = 0;

// Add luggage from config file
function addBag() {
  if ( window.config && window.config.auto ) {
    var bags = window.config.airport.bags;
    for(var i in bags ){
      if(bags[i].time === s) {
        console.log('adding bag',bags[i].id,'to node',bags[i].pos);
        for (var j in wagons){
          //console.log(wagons[j]);
          if (config.airport.rails[wagons[j].railidx].points[config.airport.rails[wagons[j].railidx].points.length-1]===window.parkingidx) {
            //console.log('lolilolilolilolilolilolilolilol');
            startwagon(j); 
            break;
          }
        }
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
    s++;
    setTimeout(addBag,1000);
  }
};

var id = 100;

// Manually add luggage
function addLug( pos, dest ) {
  console.log('pos',pos,'dest',dest);
  var bag = {id:id++, pos:pos, dest:dest, time:0};
  window.nodes[bag.pos].bags.push(bag);
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttributeNS(null, "id", 'bag' + bag.id);
  rect.setAttributeNS(null, "fill", "brown");
  rect.setAttributeNS(null, "x", window.nodes[bag.pos].dom.getAttributeNS(null, "x"));
  rect.setAttributeNS(null, "y", window.nodes[bag.pos].dom.getAttributeNS(null, "y"));
  rect.setAttributeNS(null, "height", 5);
  rect.setAttributeNS(null, "width", 5);
  document.getElementsByTagName('svg')[0].appendChild(rect);
}

function addLuggage() {
  var startPoint = document.getElementById('startPoint'),
      endPoint = document.getElementById('endPoint');

  addLug(startPoint.options[startPoint.selectedIndex].value, endPoint.options[endPoint.selectedIndex].value);
}
