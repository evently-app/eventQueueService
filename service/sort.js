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

		var scoredEvents = this.addScore(events,userData);
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

		// initialize score field/property for event object
		for (var i = 0; i < events.length; i++) {
			events[i]['score'] = 0
		}

		var scoredEvents = this.addDescQualityScore(events)

		if (!userData){
			return scoredEvents
		}

		if(userData.hasOwnProperty('coordinates')){
			scoredEvents = this.addDistanceScore(events,
							userData.coordinates.latitude,
							userData.coordinates.longitude)
		}

		if (userData.hasOwnProperty('userPreferences')){
			scoredEvents = this.addPreferenceScore(scoredEvents,
							userData.userPreferences)
		}


		/*
		*
			More scores coming
		*
		*/

		return scoredEvents;

	},


	addDescQualityScore: function(events){

		var maxLength = 0
		var minLength = Number.MAX_VALUE
		for (var i = 0; i < events.length; i++) {
			var event = events[i]
			var desc = event['description']
			//check if the event has description.
			var num_words = 0
			if(desc)
				num_words = desc.split(' ').length
			event['descLength'] = num_words
			maxLength = Math.max(maxLength,event['descLength'])
			minLength = Math.min(minLength,event['descLength'])
		}
		// Based on our UI, there should be a most appropriate length of description
		// Here we assume a description with 10 ~ 20 words makes most sense. 
		// Subject to change.
		var meaningfulRange = [10,20]

		for (var i = 0; i < events.length; i++) {
			event = events[i]
			// Mimic a logistic growth
			// There is bigger score difference for length 10 ~ 20
			// Out of that range, score difference becomes much smaller. 
			var descScore = 0
			if (event['descLength'] < meaningfulRange[0]) {
				descScore = utils.scaleDown(
					event['descLength'], minLength, meaningfulRange[0], 0, 0.2)
			}
			else if(event['descLength'] < meaningfulRange[1]){
				descScore = utils.scaleDown(
					event['descLength'], meaningfulRange[0], 
					meaningfulRange[1], 0.2, 0.8)
			}
			else{
				descScore = utils.scaleDown(
					event['descLength'], meaningfulRange[1], 
					maxLength, 0.8, 1)
			}
			event['descScore'] = descScore
			event['score'] += 2*descScore
		}

		return events;
	},

	// Use cosine similarity to compute the preference score for each event
	addPreferenceScore: function(events, userPreferences){
		var userScore = []
		var key = null
		for (key in userPreferences) {
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

			var eventScore = []
			for (key in eventPreferenceTags) {
			    if (eventPreferenceTags.hasOwnProperty(key)) {
			    	eventScore.push(eventPreferenceTags[key])
			    }
			}
			var similarityScore = utils.similarity(userScore,eventScore)
			event['preferenceScore'] = similarityScore;
			event['score']+=2*similarityScore;
		}

		return events;
	},


	// Based on each event's remaining time (compared with current time), add a scaled score
	// to each of them between 0 and 1. 
	addTimeScore: function(events){
		var maxRemainingTime = 0;
		var minRemainingTime = Number.MAX_VALUE;
		var event = null
		for (var i = 0; i < events.length; i++) {
			event = events[i];
			event['remainingTime'] = 
				utils.timeBetween(new Date(),new Date(event['startTime']));
			maxRemainingTime = Math.max(maxRemainingTime,event['remainingTime']);
			minRemainingTime = Math.min(minRemainingTime,event['remainingTime']);
		}
		for (var i = 0; i < events.length; i++) {
			event = events[i];
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
		var maxDistance = 0;
		var minDistance = Number.MAX_VALUE;
		var event = null
		for (var i = 0; i < events.length; i++) {
			event = events[i];
			event['distance'] = 
				utils.distanceBetween(userLat,userLong,events[i]['latitude'],events[i]['longitude']);
			maxDistance = Math.max(maxDistance,event['distance']);
			minDistance = Math.min(minDistance,event['distance']);
		}
		for (var i = 0; i < events.length; i++) {
			event = events[i];
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