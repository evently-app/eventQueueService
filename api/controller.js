'use strict';

var properties = require('../package.json')
var distance = require('../service/distance');
var eventbrite = require('../service/eventbrite');

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
};

module.exports = controllers;