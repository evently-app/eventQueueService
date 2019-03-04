'use strict';

var controller = require('./controller');

module.exports = function(app) {
   app.route('/about')
       .get(controller.about);
   app.route('/distance/:zipcode1/:zipcode2')
       .get(controller.get_distance);
   app.route('/grab_events/:city/:radius')
       .get(controller.grab_events);
};