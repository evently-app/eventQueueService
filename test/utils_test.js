var utils = require("../utils.js");
var assert = require("assert");

describe("tests utils function", function() {
	it("flatten", function() {
		var nestedArray = [[1, 2, 3], [4, 5, 6],[7]];
		var flat = utils.flatten(nestedArray);
		assert(flat.toString() == "1,2,3,4,5,6,7");
	});

	it("timeBetween", function() {
		var mockTime1 = new Date("2019-04-10T19:00:00-04:00")
		var mockTime2 = new Date("2019-04-10T20:00:00-04:00")
		assert(utils.timeBetween(mockTime1,mockTime2) == 3600000)
	});

	it("distanceBetween", function() {
		var mockLocation1 = {
			latitude: "41.308274",
			longitude: "-72.929916"
		}
		var mockLocation2 = {
			latitude: "41.1689578",
			longitude: "-73.2994439"
		}
		var distance = utils.distanceBetween(mockLocation1.latitude,mockLocation1.longitude,
			mockLocation2.latitude,mockLocation2.longitude)
		// round to integer since we are not that strict about distance
		assert(Math.floor(distance) == 34)
	});

	it("scaleDown", function() {
		var testArray = [4,7,7,10]
		var scaledArray = []
		for (var i = 0; i < testArray.length; i++) {
			scaledArray.push(utils.scaleDown(testArray[i],4,10,0,1))
		}
		assert(scaledArray.toString() == "0,0.5,0.5,1")
	});

	it("dotProduct", function() {
		var vec1 = [1,2]
		var vec2 = [3,4]
		assert(utils.dotProduct(vec1,vec2) == 11)
	});

	it("magnitude", function() {
		var vec = [3,4]
		assert(utils.magnitude(vec) == 5)
	});

	it("similarity", function() {
		var vec1 = [1,2,2]
		var vec2 = [3,4,1]
		var sim = Math.round(utils.similarity(vec1,vec1) * 100) / 100
		assert(sim == 1)
		sim = Math.round(utils.similarity(vec1,vec2) * 100) / 100
		assert(sim == 0.85)
	});
});
