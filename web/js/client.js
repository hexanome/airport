

function pullConfig() {
  Scout.send(function(query) {
    query.action = 'pullconfig';
    query.resp = function(config) {
      window.config = config;
    }
  });
}

function pushConfig() {
  Scout.send(function(query){
    query.action = 'pushconfig';
    query.data = window.config;
  });
}