/* server.js: run this with Node.js in the publish/ folder to start your server.
 * Copyright © 2011 Jan Keromnes, Thaddee Tyl. All rights reserved.
 * Code covered by the LGPL license. */


// Import the required modules:
// 
// - fs: deals with hard drive interaction (to save the configuration file).
// - camp: creates the HTTP server.
var fs = require('fs'),
    camp = require ('./camp/camp.js');


// --- Start the server ---
//
// This function is launched once the `config.json` file is read and parsed into
// memory.
function start(config) {

  // Get current configuration with Ajax.
  // This uses the API defined in the Camp library.
  camp.add('pullconfig', function(data) {
    return config;
  });
  
  // Overwrite the configuration (in RAM) through Ajax.
  // Again, it uses the API defined in Camp.
  camp.add('pushconfig', function(data) {
    config = data.config;
    return;
  });

  // The following is a helper macro that is used in the template system.
  // Note: the index.html file is templated, using a template system
  // provided by the ScoutCamp server library.
  // The template replaces {{ curly braced content }} with relevant information.
  camp.Plate.macros['l'] = function ( literal, params ) {
    var rail = literal[params[0]];
    // `nl`: contains the path that will be used in the SVG.
    var nl = "M" + (literal.airport.nodes[rail.points[0]].x - 0.5) + " "
        + (literal.airport.nodes[rail.points[0]].y - 0.5);
    for (var i=1; i<rail.points.length; i++) {
      nl += " L" + (literal.airport.nodes[rail.points[i]].x - 0.5) + " "
          + (literal.airport.nodes[rail.points[i]].y - 0.5);
    }
    return nl;
  };

  // Add objects from config to index.html.
  // The following function returns the aggregated data that the templated file
  // `index.html` will need.
  function handleindex(query, path) {
    console.log('templating index from', path[0]);
    path[0] = '/index.html';
    var desks = {},
        slides = {},
        treads = {},
        carousels = {},
        garages = {};
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
      auto: config.auto,
      airport: config.airport,
      desks: desks,
      slides: slides,
      treads: treads,
      carousels: carousels,
      garages: garages,
      nodes: config.airport.nodes,
      background: config.background
    };
  }

  // Reroute the following paths so that they are handled by the `index.html`
  // template.
  camp.handle(/^\/index.html$/, handleindex);
  camp.handle(/^\/$/, handleindex);

  // Finally start the server
  camp.start(config.port || 80, config.debug || 0);
}

// --- Main function ---
// 
// This function is needed only before starting the server in order to get
// all the information stored in the `config.json` file.
var configfile = process.argv[2] || '../configfile.json';
(function main() {
  console.log('starting...');

  // Reading the `config.json` file...
  fs.readFile(configfile, function(err, data) {
    if ( err ) throw err;
    start(JSON.parse(data));
  });
  
})();

// vim: ts=8 et
