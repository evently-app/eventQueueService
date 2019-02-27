'use strict';

var properties = require('../package.json')
var distance = require('../service/distance');
var eventbrite = require('../service/eventbrite');
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
   test_get_request_url: function(req, res) {
          var sourceConst = new sourceConstructor("eventbrite.com/", "token", "testToken", ["city"], "Eventbrite");
          console.log("MY URL: " + sourceConst.getRequestUrl(req));
          res.send({"message": "check console!"})
       },
};

module.exports = controllers;