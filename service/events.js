'use strict';

var sourceConst = require('./sourceConstructor');
var sourceList = ["Eventbrite", "Eventbrite2"];

var eventsAPI = {
   grab: function(req, res, next) {
   		// create sourceObjects for each source
   		var sourceObjects = [];
   		for (var i = 0; i < sourceList.length; i++){
   			sourceObjects.push(new sourceConst("https://www.eventbriteapi.com/v3/events/search/?", "token", 
   				process.env.EVENTBRITE_API_KEY || "testToken", {"city": "location.address"}, sourceList[i]));
   		}

   		// send requests with each source
   		var requests = []
   		for (var i = 0; i < sourceObjects.length; i++){
   			requests.push(sourceObjects[i].grab(req, res));
   		}

   		// handling async nature of requests
   		Promise.all(requests).then(function(values) {
   			res.send({"Message:": "data collect requests done!", "Data": values});
		});
   }
};

module.exports = eventsAPI;