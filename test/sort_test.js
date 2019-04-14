var chai = require("chai");
var sort = require("../service/sort.js");
var assert = require("assert");

var expect = chai.expect;

describe("addScoreToEvent", function() {
	const mockUserLocation = {
		latitude: "41.308274",
		longitude: "-72.929916"
	};

	const mockUserPreference = {
		cultural: 0.6,
		active: 0.5,
		lit: 0.4,
		relaxing: 0.7,
		outdoor: 0.9
	};
	var mockEvent = [];

	// First test
	it("checking addDistanceScore function", function() {
		mockEvent = [
			{
				id: "1",
				description: "new haven",
				latitude: "41.308274",
				longitude: "-72.929916"
			},
			{
				id: "2",
				description: "milford",
				latitude: "41.1689578",
				longitude: "-73.2994439"
			},
			{
				id: "3",
				description: "new york",
				latitude: "40.8166868",
				longitude: "-74.1293584"
			},
			{
				id: "4",
				description: "phily",
				latitude: "39.7898697",
				longitude: "-75.1453574"
			},
			{
				id: "5",
				description: "DC",
				latitude: "39.0665477",
				longitude: "-77.4678383"
			}
		];

		var scoredEvents = sort.addDistanceScore(
			mockEvent,
			mockUserLocation.latitude,
			mockUserLocation.longitude
		);
		scoredEvents.sort(function(event1, event2) {
			return event2["distanceScore"] - event1["distanceScore"];
		});
		var sortedId = [];
		for (var i = 0; i < scoredEvents.length; i++) {
			sortedId.push(scoredEvents[i].id);
		}
		assert(sortedId.toString() == "1,2,3,4,5");
	});

	// Second test
	it("checking addTimeScore function", function() {
		mockEvent = [
			{
				id: "1",
				description: "new haven",
				starttime: "2019-04-13T19:00:00-04:00"
			},
			{
				id: "2",
				description: "milford",
				starttime: "2019-04-16T19:00:00-04:00"
			},
			{
				id: "3",
				description: "new york",
				starttime: "2019-04-17T19:00:00-04:00"
			},
			{
				id: "4",
				description: "phily",
				starttime: "2019-04-17T20:00:00-04:00"
			},
			{
				id: "5",
				description: "DC",
				starttime: "2019-04-18T19:00:00-04:00"
			}
		];

		var scoredEvents = sort.addTimeScore(mockEvent);
		scoredEvents.sort(function(event1, event2) {
			return event2["remainingTime"] - event1["remainingTime"];
		});
		var sortedId = [];
		for (var i = 0; i < scoredEvents.length; i++) {
			sortedId.push(scoredEvents[i].id);
		}
		assert(sortedId.toString() == "1,2,3,4,5");
	});

	// Third test
	it("checking addDescQualityScore function", function() {
		mockEvent = [
			{
				id: "1",
				description: "This description has 5 words"
			},
			{
				id: "2",
				description: "This description has 7 words words words"
			},
			{
				id: "3",
				description: "This description has 15 words w w w w w w w w w w"
			},
			{
				id: "4",
				description:
					"This description has 20 words w w w w w w w w w w w w w w w"
			},
			{
				id: "5",
				description:
					"This description has 25 words w w w w w w w w w w w w w w w w w w w w"
			}
		];

		var scoredEvents = sort.addDescQualityScore(mockEvent);
		scoredEvents.sort(function(event1, event2) {
			return event2["remainingTime"] - event1["remainingTime"];
		});
		var sortedId = [];
		for (var i = 0; i < scoredEvents.length; i++) {
			sortedId.push(scoredEvents[i].id);
		}
		assert(sortedId.toString() == "1,2,3,4,5");
	});

	// Fourth test
	it("checking addPreferenceScore function", function() {
		mockEvent = [
			{
				id: "1",
				eventPreferenceTags: {
					cultural: 0.6,
					active: 0.5,
					lit: 0.4,
					relaxing: 0.7,
					outdoor: 0.9
				}
			},
			{
				id: "2",
				eventPreferenceTags: {
					cultural: 0.6,
					active: 0.5,
					lit: 0.4,
					relaxing: 0.7,
					outdoor: 0.8
				}
			},
			{
				id: "3",
				eventPreferenceTags: {
					cultural: 0.6,
					active: 0.3,
					lit: 0.4,
					relaxing: 0.7,
					outdoor: 0.8
				}
			},
			{
				id: "4",
				eventPreferenceTags: {
					cultural: 0.6,
					active: 0.3,
					lit: 0.2,
					relaxing: 0.7,
					outdoor: 0.8
				}
			},
			{
				id: "5",
				eventPreferenceTags: {
					cultural: 0.0,
					active: 0.0,
					lit: 0.0,
					relaxing: 0.0,
					outdoor: 0.0
				}
			}
		];

		var scoredEvents = sort.addPreferenceScore(
			mockEvent,
			mockUserPreference
		);
		scoredEvents.sort(function(event1, event2) {
			return event2["preferenceScore"] - event1["preferenceScore"];
		});
		var sortedId = [];
		for (var i = 0; i < scoredEvents.length; i++) {
			sortedId.push(scoredEvents[i].id);
		}
		assert(sortedId.toString() == "1,2,3,4,5");
	});
});
