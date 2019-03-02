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

var sourceList = ["Eventbrite", "Ticketmaster"]

function formatEventObject(res, type){

  var formattedEvents = {}
  

  if(type == "Eventbrite"){
    for(var i = 0; i<5; i++){
      var event = {
      event_name: res["events"][i]["name"]["text"],
      start_time: res["events"][i]["start"]["local"],
      end_time: res["events"][i]["end"]["local"],
      ticket_url: res["events"][i]["url"],
      id: res["events"][i]["id"],
      tags: ["eventbrite"],
      image_url: res["events"][i]["logo"]["url"]
      }
      formattedEvents[res["events"][i]["id"]]= event  
      //cache event ID 
      //cache(event.id, event)
    }
  }

  else if(type == "Ticketmaster"){
    for(var i = 0; i<5; i++){
      var event = {
      event_name: res["_embedded"]["events"][i]["name"],
      start_time: res["_embedded"]["events"][i]["dates"]["dateTime"],
      end_time: null,
      ticket_url: res["_embedded"]["events"][i]["url"],
      id: res["_embedded"]["events"][i]["id"],
      tags: ["ticketmaster"],
      image_url: res["_embedded"]["events"][i]["images"]
      }
      formattedEvents[res["_embedded"]["events"][i]["id"]]= event  
      //cache event ID 
      //cache(event.id, event)
    }
  }
   return formattedEvents
}

function cache(id, event){
  var docRef = db.collection('eventCache').doc(id);
  var eventCache = docRef.set(event);
}

var events = {
   grab: function(req, res) {
      var sourceObjects = [];
      var formattedEvents = []; 

      //create source request constructors 

      //eventbrite 
      sourceObjects.push(new sourceConstructor("https://www.eventbriteapi.com/v3/events/search/?", "token", 
        process.env.EVENTBRITE_API_KEY || "testToken", {"city": "location.address"}, sourceList[0]));

      //ticketmaster
      sourceObjects.push(new sourceConstructor("https://app.ticketmaster.com/discovery/v2/events.json?", "apikey", process.env.TICKETMASTER_API_KEY, {"city": "city"}, sourceList[1]))


      // send requests with each source
      var requests = []
      for (var i = 0; i < sourceObjects.length; i++){
        requests.push(sourceObjects[i].grab(req, res));
      }

      //wait for all requests to compelte, then format 
      Promise.all(requests).then(function (returnvals){
        for(var i = 0; i < sourceList.length; i++){
          formattedEvents.push(formatEventObject(returnvals[i], sourceList[i]))
        }

        //merge them! 
        var resultObject = formattedEvents.reduce(((r, c) => Object.assign(r, c)), {})
        res.send(resultObject)
      })

    }
};

module.exports = events;

