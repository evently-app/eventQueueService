var async = require('async');
var request = require('request');
var sourceConstructor = require('./sourceConstructor');
const apiKey = process.env.EVENTBRITE_API_KEY;
var eventbrite = require('./eventbrite');
var objectMerge = require('object-merge');
const admin = require('firebase-admin');
//var serviceAccount = require('path/to/serviceAccountKey.json');
var size = 0


//initialize Firebase 
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://evently-db.firebaseio.com"
// });

// var db = admin.firestore();

var sourceObjects = [require('../sources/eventbrite')]

function cache(id, event){
  var docRef = db.collection('eventCache').doc(id);
  var eventCache = docRef.set(event);
}

var events = {
   grab: function(req, res) {
      //var sourceObjects = [];
      var formattedEvents = []; 

      // send requests with each source
      var requests = []
      for (var i = 0; i < sourceObjects.length; i++){
        requests.push(sourceObjects[i].grab(req, res));
      }

      //wait for all requests to compelte, then format 
      Promise.all(requests).then(function (returnvals){
        for(var i = 0; i < sourceObjects.length; i++){
          formattedEvents.push(sourceObjects[i].formatEvents(returnvals[i]))
        }

        //merge them!
        var resultObject = formattedEvents.reduce(((r, c) => Object.assign(r, c)), {})
        res.send(resultObject)
      })

    }
};

module.exports = events;

