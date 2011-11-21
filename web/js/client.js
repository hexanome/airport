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

function save() {
  window.open('/config.json','Save As','height=400,width=400');
}

function load(files) {
  var file = files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    window.config = e.target.result;
    pushConfig();
    location.reload(true);
  }
  reader.readAsText(file);
}


// Graphical updates.
//

function addWagon(){
  var svg = document.getElementsByTagName("svg")[0];
  var rect = document.getElementsByTagName("rect")[0].cloneNode();
  rect.id =  'node' + window.config.airport.wagons.length;
  svg.appendChild(rect);
  var wagon = { "speed":0, "bags":0, "x":rect.x.baseVal.value , "y":rect.y.baseVal.value };
  window.config.airport.wagons.push(wagon);
  pushConfig();
}

window.addWagon = addWagon;

addEventListener('load', function() {
  pullConfig();
}, false);


// Wagon movements (UI primitives).
//

function setpos (object, x, y) {
  object.setAttribute('x', x + '');
  object.setAttribute('y', y + '');
}

// speed is given in pixels / milliseconds.
function move (object, from, length, speed, whendone) {
  if (length <= 0) { whendone? whendone():void 0; return; }
  var halfwidth = Number(object.getAttribute('width')) / 2,
      halfheight = Number(object.getAttribute('height')) / 2;
  setpos(object, from[0] - halfwidth, from[1] - halfheight);
  setTimeout(move, 1 / speed, object,
      [from[0] + 1,from[1]], length - 1, speed, whendone);
};

function alongsegment (object, segment, speed, idx) {
  idx = idx || 0;
  var from = segment[idx],
      to = segment[idx + 1],
      dx = to[0] - from[0],
      dy = to[1] - from[1],
      length = Math.sqrt(dx * dx + dy * dy),
      angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  object.setAttribute('transform', 'rotate(' + angle * 180 / Math.PI
                     + ' ' + from[0] + ' ' + from[1] + ')');
  move(object, segment[idx], length, speed, function whendone() {
    if (!segment[idx + 2]) return;
    alongsegment(object, segment, speed, idx + 1);
  });
}

// This function takes a <path d="..."> and converts it to a series of points if
// said <path d="..."> contains nothing but M and L operations.
function datafrompath (path) {
  return path.getAttribute('d').match(/[\d\.]+\s+[\d\.]+/g).map(function(el) {
    return el.split(/\s+/).map(function(num){ return Number(num); });
  });
}

function movewagon (wagonidx, railidx) {
  var domwagon = document.getElementById('wagon' + wagonidx),
      domrail = document.getElementById('p' + railidx);
  alongsegment(domwagon, datafrompath(domrail), 0.01);
}



// 



// vim: ts=8 et
