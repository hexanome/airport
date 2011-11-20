

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


function changeColor(id,color){
  var node = document.getElementsByTagName("rect")[0]; //document.getElementById(id);
  node.setAttributeNS(null,"fill",color);
}

function addWagon(wagon){
  var svg = document.getElementByTagName("svg")[0];
  var rect = document.getElementByTagName("rect")[0].cloneNode();
  alert(rect.id);
  window.config.airport.wagons.push(wagon);
  pushConfig();
}

window.changeColor = changeColor;
window.addWagon = addWagon;


pullConfig();
