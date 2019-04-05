var utils = require('../utils.js');

var sort =  {

	 //Given a list of Event objects, sort them by assigned/calculated score.
	// Arguments:
	// userData : js object that have current user's location
	// 			  and preference which is another js object
	//			  {}
	// events   : formatted events 
	// Return:
	// Sorted Events
	sort: function(events,userData){

		scoredEvents = this.addScore(events,userData);
		// sort events based on score in descending order
		// so events with larger score will appear first.
		scoredEvents.sort(
			function(event1,event2){
				return event2['score']-event1['score'];
			}
		);
		return scoredEvents;
	
	},



	// Add a score property/field to each event object.
	// Right now it is determined by event's distance from user and category
	addScore: function(events,userData){

		for (var i = 0; i < events.length; i++) {
			events[i]['score'] = 0
		}
		// scoredEvents = this.addTimeScore(events);
		if (!userData){
			return scoredEvents
		}
		var scoredEvents = events

		if(userData.hasOwnProperty('coordinates')){
			scoredEvents = this.addDistanceScore(events,
							userData.coordinates.latitude,
							userData.coordinates.longitude)
		}

		if (userData.hasOwnProperty('userPreferences')){
			scoredEvents = this.addPreferenceScore(scoredEvents,
							userData.userPreferences);
		}

		// get users' coordinates from firestore
		/*
		*
			More scores coming
		*
		*/

		return scoredEvents;

	},



	// Use cosine similarity to compute the preference score for each event
	addPreferenceScore: function(events, userPreferences){
		userScore = []
		for (var key in userPreferences) {
		    if (userPreferences.hasOwnProperty(key)) {
		    	userScore.push(userPreferences[key])
		    }
		}
		for (var i = 0; i < events.length; i++) {
			var event = events[i]
			// Uncomment the following line when events do have this field
			// var eventPreferenceTags = event.preferenceTags
			var eventPreferenceTags = { 
				cultural: 0.6,
				active: 0.5,
				lit: 0.4,
				relaxing: 0.7,
				outdoor: 0.9 
			}

			eventScore = []
			for (var key in eventPreferenceTags) {
			    if (eventPreferenceTags.hasOwnProperty(key)) {
			    	eventScore.push(eventPreferenceTags[key])
			    }
			}
			similarityScore = utils.similarity(userScore,eventScore)
			event['preferenceScore'] = similarityScore;
			event['score']+=2*similarityScore;
		}

		return events;
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
				event['remainingTime'], minRemainingTime, maxRemainingTime, 1, 0);
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
				event['distance'], minDistance, maxDistance, 1, 0);
			// console.log(timeScore);
			event['distanceScore'] = distanceScore
			event['score'] += distanceScore;
		}
		return events;
	}


};

module.exports = sort;