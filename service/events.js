var scrapers = [require('../scrapers/eventbrite'), require('../scrapers/meetup'), require('../scrapers/yale'), require('../scrapers/ticketmaster')];
var express = require('express')
var cors = require('cors')
var app = express()
 
app.use(cors())

//Firebase Initialization
var firebaseController = require('./firebaseController')

var events = {
  scrape: async function(req, res) {
    //TODO: authentication with req.

    // clean up old data.
    await firebaseController.cleanUpEvents()

    var formattedEvents = []; 

    // scrape with each source
    var requests = []
    for (var i = 0; i < scrapers.length; i++){
      requests.push(scrapers[i].scrape());
    }
    //formatted events is a 2d array, list of scraped data from each source.
    formattedEvents = await Promise.all(requests) 

    for(var i = 0; i < formattedEvents.length; i++){
      for (var j = 0; j < formattedEvents[i].length; j++) {
        firebaseController.addEvent(formattedEvents[i][j])
      }
    }

    //TODO: send meaningful res.
    res.send({});
  }
};

module.exports = events;
