
// Getting and updating the configuration file.
//

function pullConfig() {
  Scout.send(function(query) {
    query.action = 'pullconfig';
    query.data = {lol:'bidon'};
    query.resp = function(config) {
      console.log('received config');
      loadconfig(config);
    }
  })();
}

function loadconfig (config) {
  window.config = config;
  window.airport = config.airport;
  wagoninit();
  nodeinit();
}

function pushConfig(config) {
  console.log('pushing config');
  Scout.send(function(query){
    query.action = 'pushconfig';
    query.data = {config: config || window.config};
    query.resp = function() {
      if (config) location.reload(true);
    }
  })();
}

addEventListener('load', function() {
  pullConfig();
}, false);

function save() {
  window.open('/config.json','Save As','height=400,width=400');
}

function load(files) {
  var file = files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    pushConfig(JSON.parse(e.target.result));
  }
  reader.readAsText(file);
}

function changeMode(auto) {
  window.config.auto = auto;
  pushConfig();
  if (auto) addBag();
}

