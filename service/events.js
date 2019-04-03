var sourceConstructor = require('../classes/sourceconstructor');
var sourceObjects = [require('../sources/eventbrite'), require('../sources/ticketmaster'), require('../sources/meetup')]
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

//Helper Functions.
function cache(id, event){
  var docRef = db.collection('eventCache').doc(id);
  var eventCache = docRef.set(event);
}

//Wrapper function which sorts the array and then sends it.
function sortAndSend(events, res, userData) {
  sortedEvents = sort.sort(events,userData)
  addToQueue(sortedEvents,userData.id)
  res.send(sortedEvents)
}


// add ids of the events to user as a subcollection in firebase
function addToQueue(events,user){
  sortedIds = []
  for (var i = 0; i < events.length; i++) {
    sortedIds.push(events[i].source+events[i].id)
  }

  var queueRef = db.collection('users').doc(user)
  console.log("retrieve from firebase")
  // queueRef.
  var getDoc = queueRef.get()
    .then(doc => {
      if (!doc.exists) {
        console.log("user not exists")
      } else {
        //concatenate existing queue to new event ids.
        var updateIds = doc.data().queue.concat(sortedIds)
        console.log("adding "+sortedIds.length+" events to the queue")
        queueRef.update(
          {
            "queue" : updateIds
          }
        )
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
    });


}


// /Function that returns a new array, of all the elems from arr,
// other than those whose ids are in toRemove.
function filterSeenEvents(arr, toRemove) {

  var toReturn = [];
  if (toRemove == undefined)
    return toReturn
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
            userData.id = user;
            userData.longitude = req.params.longitude;
            userData.latitude = req.params.latitude;
            filteredResultObject = filterSeenEvents(resultObject, doc.data().swipedEvents)
            sortAndSend(filteredResultObject, res, userData);
          }
        })
        .catch(err => {
          console.log('Error getting document', err);
          sortAndSend(resultObject, res);
        });
      
    }
};

module.exports = events;

