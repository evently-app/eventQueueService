var scrapers = [require('../scrapers/eventbrite'),require('../scrapers/ticketmaster')];
var express = require('express')
var cors = require('cors')
var app = express()
 
app.use(cors())

//Firebase Initialization
const admin = require('firebase-admin');
const GeoFirestore = require('geofirestore')
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "evently-db",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: 'https://evently-db.firebaseio.com'
});
var db = admin.firestore();

// Create a GeoFirestore reference
const geofirestore = new GeoFirestore.GeoFirestore(db);

// Create a GeoCollection reference
const geoEventLocations = geofirestore.collection('eventsLocations');

var events = {
  scrape: async function(req, res) {
    //TODO: authentication with req.

    var formattedEvents = []; 

    // scrape with each source
    var requests = []
    for (var i = 0; i < scrapers.length; i++){
      requests.push(scrapers[i].scrape());
    }
    //formatted events is a 2d array, list of scraped data from each source.
    var formattedEvents = await Promise.all(requests) 

    for(var i = 0; i < formattedEvents.length; i++){
      for (var j = 0; j < formattedEvents[i].length; j++) {
        var eventId = formattedEvents[i][j].id
        var eventRef = db.collection('events').doc(eventId)
        eventRef.set(formattedEvents[i][j]) //async set, no await
        geoEventLocations.doc(eventId)
            .set({
              coordinates: new admin.firestore.GeoPoint(parseFloat(formattedEvents[i][j].latitude), parseFloat(formattedEvents[i][j].longitude))
            })
      }
    }

    //TODO: send meaningful res.
    res.send({});
  }
};

module.exports = events;
