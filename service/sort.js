
var utils = require('../utils.js');

var sort =  {

	//Given a list of Event objects, sort them by assigned/calculated score.
	sort: function(events){
		scoredEvents = this.addScore(events);
		scoredEvents.sort(
			function(event1,event2){
				return event1['score']-event2['score'];
			}
		);
		return scoredEvents;
	},

	// Add a score property/field to each event object.
	addScore: function(events){

		for (var i = 0; i < events.length; i++) {
			events[i]['score'] = 0
		}
		// right now score is determined by remaining time only
		scoredEvents = this.addTimeScore(events);

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
	}


};

module.exports = sort;