var sourceConstructor = require('../classes/sourceconstructor');
var sourceObjects = [require('../sources/eventbrite'), require('../sources/ticketmaster'), require('../sources/meetup')]
var scrapers = [require('../scrapers/eventbrite'),require('../scrapers/ticketmaster')];
var utils = require('../utils.js');
var sort = require('./sort.js');
var express = require('express')
var cors = require('cors')
var app = express()
 
app.use(cors())

//Firebase Initialization
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "evently-db",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: 'https://evently-db.firebaseio.com'
});
var db = admin.firestore();


//Wrapper function which sorts the array and then sends it.
function sortAndSend(events, res, userData) {
  sortedEvents = sort.sort(events,userData);
  res.send(sortedEvents);
}

// /Function that returns a new array, of all the elems from arr,
// other than those whose ids are in toRemove.
function filterSeenEvents(arr, toRemove) {
  var toReturn = [];
  for (var i = 0; i < arr.length; i++) {
    var elem = arr[i];
    if (!toRemove.includes(elem.id)) {
      toReturn.push(elem);
    }
  }
  return toReturn;
}


var events = {
  grab: async function(req, res) {
      var formattedEvents = []; 

      // send requests with each source
      var requests = []
      for (var i = 0; i < sourceObjects.length; i++){
        requests.push(sourceObjects[i].grab(req, res));
      }

      //wait for all requests to complete, then format 
      var returnvals = await Promise.all(requests)
      for(var i = 0; i < sourceObjects.length; i++){
        formattedEvents.push(sourceObjects[i].formatEvents(returnvals[i]))

        //save events to db
        for (var j = 0; j < formattedEvents[i].length; j++) {
          //db id is apiName + api's eventId
          var eventId = formattedEvents[i][j].id
          var eventRef = db.collection('events').doc(eventId)
          eventRef.set(formattedEvents[i][j]) //async set, no await
        }
      }
      
      //merge them!
      var resultObject = utils.flatten(formattedEvents)

      //filter
      var user = '8xlgDSoBvHKW8NAuiS3n' //get from req, hardcoded right now.
      var userRef = db.collection('users').doc(user);
      var getDoc = userRef.get()
        .then(doc => {
          if (!doc.exists) {
            var userData = {'longitude':req.params.longitude,'latitude':req.params.latitude};
            console.log('User Not Found');
            sortAndSend(resultObject, res, userData);
          } else {
            var userData = doc.data();
            userData.longitude = req.params.longitude;
            userData.latitude = req.params.latitude;
            filteredResultObject = filterSeenEvents(resultObject, doc.data().events)
            sortAndSend(filteredResultObject, res, userData);
          }
        })
        .catch(err => {
          console.log('Error getting document', err);
          sortAndSend(resultObject, res);
        });
      


    },
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
        var eventRef = db.collection('testEvents').doc(eventId)
        eventRef.set(formattedEvents[i][j]) //async set, no await
      }
    }

    //TODO: send meaningful res.
    res.send({});
  }
};

module.exports = events;

