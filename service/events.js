var async = require('async');
var request = require('request');
var sourceConstructor = require('./sourceConstructor');
const apiKey = process.env.EVENTBRITE_API_KEY;
const apiURL = 'https://www.eventbriteapi.com/v3/events/search/?location.address=';

const admin = require('firebase-admin');
//var serviceAccount = require('path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

var db = admin.firestore();

function formatEventObject(res, type){
  console.log("yo")
  //console.log("INFO PASSED TO THE FUNCTION IS: ", res)

  var formattedEvents = {}
  var size = -1 

  if(type == "Eventbrite"){
    for(var i = 0; i<15; i++){
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
      cache(event.id, event)
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
      var merged = []
      // var eventbrite = new sourceConstructor("https://www.eventbriteapi.com/v3/events/search/?", "token", process.env.EVENTBRITE_API_KEY || "testToken", {"city": "location.address"}, "Eventbrite");
      // var eventbrite2 = new sourceConstructor("https://www.eventbriteapi.com/v3/events/search/?", "token", process.env.EVENTBRITE_API_KEY || "testToken", {"city": "location.address"}, "Eventbrite");
      // requestArray = [eventbrite, eventbrite2]
      // async.each(requestArray, function(req, thing){
        request(apiURL + req.params.city + '&location.within=' + req.params.radius + 'km&' + 'token=' + apiKey,
          function (error, response, body) {
             if (!error && response.statusCode == 200) {
                 response = JSON.parse(body);
                 final_response = formatEventObject(response, "Eventbrite")
                 merged.push(final_response)
                 //console.log("merged is: ", merged)
                  merged_arr = merged[0]
                  res.send(merged_arr)
                 
             } else {
                 console.log(response.statusCode + response.body);
                 res.send({"error!":response.statusCode + response.body});
             }
        });
        // req.grab(req, res, function(err, dist){
        //   merged.push(dist)

        //   console.log("RESULt: ", dist)
        // })
      // }, function(err){
      //   console.log("some issue had occurred")
      // })
    }
};

module.exports = events;