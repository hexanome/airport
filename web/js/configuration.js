// Getting and updating the configuration file.
//

// When the page is loaded, we fetch the configuration data.
addEventListener('load', pullConfig, false);

// This function performs an Ajax call through which we obtain all configuration
// information.
function pullConfig() {
  Scout.send(function(query) {
    query.action = 'pullconfig';
    query.data = {lol:'bidon'};
    // The following gets run once we obtain the configuration.
    query.resp = function(config) {
      window.config = config;
      window.airport = config.airport;
      nodeinit();
      wagoninit();
      baginit();
    };
  })();
}


// The reverse operation of `pullConfig`, updating the configuration on the
// server, is performed by the following function.
function pushConfig(config) {
  Scout.send(function(query){
    query.action = 'pushconfig';
    query.data = {config: config || window.config};
    query.resp = function() {
      if (config) location.reload(true);
    };
  })();
}

// We let the user save the configuration on its computer by opening that file
// (either it downloads automatically, or it shows up in a new window).
function save() {
  window.open('/config.json','Save As','height=400,width=400');
}

// We can read configuration files in JSON from this function.
function load(files) {
  var file = files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    pushConfig(JSON.parse(e.target.result));
  };
  reader.readAsText(file);
}

// Switch from automatic to manual, and back.
function changeMode(auto) {
  window.config.auto = auto;
  pushConfig();
  if (auto) {
    addBag();
  }
}

