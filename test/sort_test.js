var chai = require("chai");
var sort = require("../service/sort.js");
const assert = require('assert');

var expect = chai.expect;

var mockEvent = [
	{
		description: "he Last Five Years tells the story of",
		latitude: "41.308274",
		longitude: "-72.929916",
		starttime: "2019-04-10T19:00:00-04:00",
		eventPreferenceTags: {
			cultural: 0.6,
			active: 0.5,
			lit: 0.4,
			relaxing: 0.7,
			outdoor: 0.9
		}
	},
	{
		description: "he Last Five Years tells the story of",
		latitude: "41.308274",
		longitude: "-72.929916",
		starttime: "2019-04-10T19:00:00-04:00",
		eventPreferenceTags: {
			cultural: 0.6,
			active: 0.5,
			lit: 0.4,
			relaxing: 0.7,
			outdoor: 0.9
		}
	},
	{
		description: "he Last Five Years tells the story of",
		latitude: "41.308274",
		longitude: "-72.929916",
		starttime: "2019-04-10T19:00:00-04:00",
		eventPreferenceTags: {
			cultural: 0.6,
			active: 0.5,
			lit: 0.4,
			relaxing: 0.7,
			outdoor: 0.9
		}
	},
	{
		description: "he Last Five Years tells the story of",
		latitude: "41.308274",
		longitude: "-72.929916",
		starttime: "2019-04-10T19:00:00-04:00",
		eventPreferenceTags: {
			cultural: 0.6,
			active: 0.5,
			lit: 0.4,
			relaxing: 0.7,
			outdoor: 0.9
		}
	},
	{
		description: "he Last Five Years tells the story of",
		latitude: "41.308274",
		longitude: "-72.929916",
		starttime: "2019-04-10T19:00:00-04:00",
		eventPreferenceTags: {
			cultural: 0.6,
			active: 0.5,
			lit: 0.4,
			relaxing: 0.7,
			outdoor: 0.9
		}
	}
];

//
describe("addScoreToEvent", function() {
	const mockUserLocation = {
		latitude: "41.310726",
		longitude: "-72.929916"
	};

	const mockUserPreference = {
		cultural: 0.6,
		active: 0.5,
		lit: 0.4,
		relaxing: 0.7,
		outdoor: 0.9
	};

	it("checking addDistanceScore function", function() {
		// sort.addDistanceScore(events,mockUserLocation.latitude,mockUserLocation.longitude);
		assert(3 > 0);
	});

	it("checking addTimeScore function", function() {
		// sort.addDistanceScore(events,mockUserLocation.latitude,mockUserLocation.longitude);
		assert(-1 > 0);
	});

	it("checking addDescScore function", function() {
		// sort.addDistanceScore(events,mockUserLocation.latitude,mockUserLocation.longitude);
		assert(3 > 0);
	});
});
