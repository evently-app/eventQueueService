var async = require('async');
var request = require('request');
var sourceConstructor = require('./sourceConstructor');
const apiKey = process.env.EVENTBRITE_API_KEY;
const apiURL = 'https://www.eventbriteapi.com/v3/events/search/?location.address=';
var eventbrite = require('./eventbrite');
var objectMerge = require('object-merge');
const admin = require('firebase-admin');
//var serviceAccount = require('path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

var db = admin.firestore();
var sourceList = ["Eventbrite", "Eventbrite2"]
var hello = 0

function formatEventObject(res, type){

  var formattedEvents = {}
  var size = -1 

  if(type == "Eventbrite"){
    console.log("HEHEHEHEHE")
    for(var i = 0; i<5; i++){
      var event = {
      event_name: res["events"][i]["name"]["text"],
      start_time: res["events"][i]["start"]["local"],
      end_time: res["events"][i]["end"]["local"],
      ticket_url: res["events"][i]["url"],
      id: res["events"][i]["id"],
      tags: ["hippo", "campus"],
      image_url: res["events"][i]["logo"]["url"]
      }
      formattedEvents[size+1]= event  
      size = Object.keys(formattedEvents).length
      //cache(event.id, event)
    }
    return formattedEvents
  }
}

function cache(id, event){
  var docRef = db.collection('eventCache').doc(id);
  var eventCache = docRef.set(event);
}

var events = {
   grab: function(req, res) {
      var sourceObjects = [];
      var formattedEvents = []; 
      for (var i = 0; i < sourceList.length; i++){
        sourceObjects.push(new sourceConstructor("https://www.eventbriteapi.com/v3/events/search/?", "token", 
          process.env.EVENTBRITE_API_KEY || "testToken", {"city": "location.address"}, sourceList[i]));
      }

      // send requests with each source
      var requests = []
      for (var i = 0; i < sourceObjects.length; i++){
        requests.push(sourceObjects[i].grab(req, res));
      }

      Promise.all(requests).then(function (returnvals){
        for(var i = 0; i < sourceList.length; i++){
          formattedEvents.push(formatEventObject(returnvals[i], "Eventbrite"))
        }

        var resultObject = objectMerge(formattedEvents[0], formattedEvents[1])//formattedEvents.reduce(function(result, currentObject) {

        console.log(resultObject);
        res.send(resultObject)
      })

    }
};

module.exports = events;