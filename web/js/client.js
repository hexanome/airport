// Handling of graphical elements in index.html (svg manipulation, etc.)


// Getting and updating the configuration file.
//

function pullConfig() {
  Scout.send(function(query) {
    console.log('pulling config');
    query.action = 'pullconfig';
    query.data = {lol:'bidon'};
    query.resp = function(config) {
      console.log('received config');
      window.config = config;
    }
  })();
}

function pushConfig() {
  Scout.send(function(query){
    query.action = 'pushconfig';
    query.data = window.config;
  });
}


// Graphical updates.
//

function changeColor(id,color){
  var node = document.getElementsByTagName("rect")[0];
  node.setAttributeNS(null,"fill",color);
}

function addWagon(){
  var svg = document.getElementsByTagName("svg")[0];
  var rect = document.getElementsByTagName("rect")[0].cloneNode();
  rect.id =  'node' + window.config.airport.wagons.length;
  svg.appendChild(rect);
  var wagon = { "speed":0, "bags":0, "x":rect.x.baseVal.value , "y":rect.y.baseVal.value };
  window.config.airport.wagons.push(wagon);
  pushConfig();
}

window.changeColor = changeColor;
window.addWagon = addWagon;

document.addEventListener('load', function() {
  pullConfig();
}, false);

