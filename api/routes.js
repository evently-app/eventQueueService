'use strict';

var controller = require('./controller');

module.exports = function(app) {
	app.route('/about')
	   .get(controller.about);
	app.route('/grab_events/:latitude/:longitude/:radius')
	   .get(controller.grabEvents);
	app.route('/grab_events')
	   .post(controller.grabEventsPostReq);
};