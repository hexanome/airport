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
  
  // Overwrite configuration by Ajax
  camp.add('pushconfig', function(newconfig) {
    config = newconfig;
  });

  camp.Plate.macros['l'] = function ( literal, params ) {
		var gs=config.airport.globalsize;
    var rail = literal[params[0]];
    var nl = "M" + (literal.nodes[rail.points[0]].x*gs - 0.5) + " "
        + (literal.nodes[rail.points[0]].y*gs - 0.5);
    for (var i=1; i<rail.points.length; i++) {
      nl += " L" + (literal.nodes[rail.points[i]].x*gs - 0.5) + " "
          + (literal.nodes[rail.points[i]].y*gs - 0.5);
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
      wagons: config.airport.wagons,
      rails: config.airport.rails,
      desks: desks,
      desksize: config.airport.desksize,
      slidesize: config.airport.slidesize,
      treadsize: config.airport.treadsize,
      carouselsize: config.airport.carouselsize,
      slides: slides,
      treads: treads,
      carousels: carousels, 
      garages: garages,
      globalsize: config.airport.globalsize,
      w: config.airport.width,
      h: config.airport.height,
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
