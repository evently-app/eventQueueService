var sourceConstructor = require('../classes/sourceconstructor');
const apiKey = process.env.EVENTBRITE_API_KEY;
var sourceObjects = [require('../sources/eventbrite'), require('../sources/ticketmaster')]
var utils = require('../utils.js');
var sort = require('./sort.js');



//Firebase Initialization
const admin = require('firebase-admin');
var serviceAccount = require('../evently-key.json'); //Not to be put on github, add path to your service account.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
var db = admin.firestore();

//Helper Functions.
function cache(id, event){
  var docRef = db.collection('eventCache').doc(id);
  var eventCache = docRef.set(event);
}

//Wrapper function which sorts the array and then sends it.
function sortAndSend(events, res, userData) {
  sortedEvents = sort.sort(events,userData);
  res.send(sortedEvents);
}

// Function that returns a new array, of all the elems from arr,
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
          var eventId = sourceObjects[i].apiName + formattedEvents[i][j].id
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
            console.log('User Not Found');
            sortAndSend(resultObject, res, null);
          } else {
            filteredResultObject = filterSeenEvents(resultObject, doc.data().events)
            sortAndSend(filteredResultObject, res, doc.data());
          }
        })
        .catch(err => {
          console.log('Error getting document', err);
          sortAndSend(resultObject, res);
        });
      


    }
};

module.exports = events;

