/* server.js: run this with Node.js in the publish/ folder to start your server.
 * Copyright © 2011 Jan Keromnes, Thaddee Tyl. All rights reserved.
 * Code covered by the LGPL license. */


// Import modules
var fs = require('fs'),
    camp = require ('./camp/camp.js');


// Start the server
function start(config) {

  // Get current config by Ajax
  camp.add('pullconfig', function(data) {
    return config;
  });
  
  // Overwrite configuscalen by Ajax
  camp.add('pushconfig', function(data) {
    config = data.config;
    return;
  });

  camp.Plate.macros['l'] = function ( literal, params ) {
    var rail = literal[params[0]];
    var nl = "M" + (literal.airport.nodes[rail.points[0]].x - 0.5) + " "
        + (literal.airport.nodes[rail.points[0]].y - 0.5);
    for (var i=1; i<rail.points.length; i++) {
      nl += " L" + (literal.airport.nodes[rail.points[i]].x - 0.5) + " "
          + (literal.airport.nodes[rail.points[i]].y - 0.5);
    }
    return nl;
  };

  // Add objects from config to index2.html
  function handleindex(query, path) {
    console.log('templating index from', path[0]);
    path[0] = '/index.html';
    var desks = {};
    var slides = {};
    var treads = {};
    var carousels = {};
    var garages = {};
    for (var i in config.airport.nodes){
      if (config.airport.nodes[i].type === "desk") {
        desks[i] = config.airport.nodes[i];
      }  
      if (config.airport.nodes[i].type === "slide") {
        slides[i] = config.airport.nodes[i];
      }
      if (config.airport.nodes[i].type === "tread") {
        treads[i] = config.airport.nodes[i];
      }
      if (config.airport.nodes[i].type === "carousel") {
        carousels[i] = config.airport.nodes[i];
      }
      if (config.airport.nodes[i].type === "garage") {
        garages[i] = config.airport.nodes[i];
      }
    }
    
    return {
      airport: config.airport,
      desks: desks,
      slides: slides,
      treads: treads,
      carousels: carousels,
      garages: garages,
      nodes: config.airport.nodes
    };
  }
  camp.handle(/^\/index.html$/, handleindex);
  camp.handle(/^\/$/, handleindex);

  // Display the current config as a JSON file
  camp.handle('/config.json', function(query, path) {
    return {"content":JSON.stringify(config,null,2)};
  });

  // Finally start the server
  camp.start(config.port || 80, config.debug || 0);
}

// Main function
(function main() {
  var config = process.argv[2] || '../config.json';

  console.log('starting...');

  fs.readFile(config, function(err, data) {
    if ( err ) throw err;
    start(JSON.parse(data));
  });
  
})();

// vim: ts=8 et
