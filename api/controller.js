'use strict';

var properties = require('../package.json')
var distance = require('../service/distance');
var events = require('../service/events');
var eventsNew = require('../service/eventsNew');

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
    grabEventsPostReq: function(req, res) {
        eventsNew.grab(req.body);
    },
};


module.exports = controllers;