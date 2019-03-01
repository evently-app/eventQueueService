'use strict';

var properties = require('../package.json')
var distance = require('../service/distance');
var eventbrite = require('../service/eventbrite');
var events = require('../service/events');
var sourceConstructor = require('../service/sourceConstructor');

var controllers = {
   about: function(req, res) {
       var aboutInfo = {
           name: properties.name,
           version: properties.version
       }
       res.json(aboutInfo);
   },
   get_distance: function(req, res) {
           distance.find(req, res, function(err, dist) {
               if (err)
                   res.send(err);
               res.json(dist);
           });
       },
   grab_eventbrite: function(req, res) {
           eventbrite.grab(req, res, function(err, dist) {
               if (err)
                   res.send(err);
               res.json(dist);
           });
       },

    grab_events: function(req, res) {
           events.grab(req, res, function(err, dist) {
               if (err)
                   res.send(err);
               res.json(dist);
           });
    },
   test_get_request_url: function(req, res) {
          var sourceConst = new sourceConstructor("https://www.eventbriteapi.com/v3/events/search/?", "token", process.env.EVENTBRITE_API_KEY || "testToken", {"city": "location.address"}, "Eventbrite");
          console.log("MY URL: " + sourceConst.getRequestUrl(req));
          res.send({"message": "check console!"});
       },
   test_grab_eventbrite_w_sourceConstructor: function(req, res) {
          var sourceConst = new sourceConstructor("https://www.eventbriteapi.com/v3/events/search/?", "token", process.env.EVENTBRITE_API_KEY || "testToken", {"city": "location.address"}, "Eventbrite");
          sourceConst.grab(req, res);
          res.send({"message": "Eventbrite data stored in api object's lastData instance variable"});
       },
};


module.exports = controllers;