
var utils = require('../utils.js');

var sort =  {

	//Given a list of Event objects, sort them by assigned/calculated score.
	// Param: events: all the events returned from API
	// userData: information about current user, like coordinate, and preference
	sort: function(events,userData){

		scoredEvents = this.addScore(events,userData);
		scoredEvents.sort(
			function(event1,event2){
				return event1['score']-event2['score'];
			}
		);
		return scoredEvents;
	
	},

	// Add a score property/field to each event object.
	addScore: function(events,userData){

		for (var i = 0; i < events.length; i++) {
			events[i]['score'] = 0
		}
		// right now score is determined by remaining time and distance
		scoredEvents = this.addTimeScore(events);
		if (!userData){
			return scoredEvents
		}
		
		scoredEvents = this.addDistanceScore(scoredEvents,
						userData.latitude,
						userData.longitude);
		
		// get users' coordinates from firestore
		/*
		*
			More scores coming
		*
		*/

		return scoredEvents;

	},

	// Based on each event's remaining time (compared with current time), add a scaled score
	// to each of them between 0 and 1. 
	addTimeScore: function(events){
		maxRemainingTime = 0;
		minRemainingTime = Number.MAX_VALUE;
		for (var i = 0; i < events.length; i++) {
			var event = events[i];
			event['score'] = 0
			event['remainingTime'] = 
				utils.timeBetween(new Date(),new Date(event['startTime']));
			maxRemainingTime = Math.max(maxRemainingTime,event['remainingTime']);
			minRemainingTime = Math.min(minRemainingTime,event['remainingTime']);
		}
		for (var i = 0; i < events.length; i++) {
			var event = events[i];
			// The math part
			var timeScore = utils.scaleDown(
				event['remainingTime'], minRemainingTime, maxRemainingTime, 0, 1);
			event['score'] += timeScore;
		}
		return events;
	},

	// Based on each event's coordinates and user's current coordinate to compute the distance 
	// among them and add a scaled score to each of them between 0 and 1.
	addDistanceScore: function(events,userLat,userLong){
		maxDistance = 0;
		minDistance = Number.MAX_VALUE;
		for (var i = 0; i < events.length; i++) {
			var event = events[i];
			event['score'] = 0
			event['distance'] = 
				utils.distanceBetween(userLat,userLong,events[i]['latitude'],events[i]['longitude']);
			maxDistance = Math.max(maxDistance,event['distance']);
			minDistance = Math.min(minDistance,event['distance']);
		}
		for (var i = 0; i < events.length; i++) {
			var event = events[i];
			// The math part
			var distanceScore = utils.scaleDown(
				event['distance'], minDistance, maxDistance, 0, 1);
			// console.log(timeScore);
			event['score'] += distanceScore;
		}
		return events;
	}


};

module.exports = sort;