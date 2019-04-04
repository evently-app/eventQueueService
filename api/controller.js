'use strict';

var properties = require('../package.json')
var distance = require('../service/distance');
var events = require('../service/events');
var eventsQueue = require('../service/eventsQueue');

var controllers = {
   about: function(req, res) {
       var aboutInfo = {
           name: properties.name,
           version: properties.version
       }
       res.json(aboutInfo);
   },
   
    grabEvents: function(req, res) {
       events.grab(req, res, function(err, dist) {
           if (err)
               res.send(err);
           res.json(dist);
       });
    },
    pingEventsQueue: function(req, res) {
        // handles a POST request
        eventsQueue.ping(req.body, res);
    },
};


module.exports = controllers;