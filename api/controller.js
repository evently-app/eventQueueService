'use strict';

var properties = require('../package.json')
var distance = require('../service/distance');
var events = require('../service/events');

var controllers = {
   about: function(req, res) {
       var aboutInfo = {
           name: properties.name,
           version: properties.version
       }
       res.json(aboutInfo);
   },
   
   getDistance: function(req, res) {
           distance.find(req, res, function(err, dist) {
               if (err)
                   res.send(err);
               res.json(dist);
           });
       },

    grabEvents: function(req, res) {
           events.grab(req, res, function(err, dist) {
               if (err)
                   res.send(err);
               res.json(dist);
           });
    },
};


module.exports = controllers;