

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

pullConfig();
