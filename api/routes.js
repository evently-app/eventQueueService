'use strict';

var controller = require('./controller');

module.exports = function(app) {
   app.route('/about')
       .get(controller.about);
   app.route('/grab_events/:city/:radius')
       .get(controller.grabEvents);
};