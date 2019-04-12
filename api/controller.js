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
   
    pingEventsQueue: function(req, res) {
        // handles a POST request
        eventsQueue.ping(req.body, res);
    },
    
    scrape: function(req, res) {
        events.scrape(req, res);
    }
};


module.exports = controllers;