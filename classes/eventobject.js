/*
In interface for event object, not used right now because find it not meaningful to 
have extra layer of enforcement of our data format.
*/

'use strict';
var utils = require('../utils.js');


class EventObject {
	constructor(params){
		// rightFormat = utils.checkParameter(
		// 	['eventName','startTime','endTime','ticketUrl','id','tags','imageUrl'], params);
		// if (!rightFormat) {
		// 	this.isValid = false;
		// }
		this.eventName = params.eventName;
		this.startTime = params.startTime; // sources vary in how they refer to the token (e.g "token" or "apikey")
		this.endTime = params.endTime;
		this.ticketUrl = params.ticketUrl;
		this.id = params.id;
		this.tags = params.tags;
		this.imageUrl = params.imageUrl;
		this.latitude = params.latitude;
		this.longitude = params.longitude; 
	}

}

module.exports = EventObject; 