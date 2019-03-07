'use strict';

var request = require('request');
var utils = require('../utils.js');

class SourceConstructor {
	constructor(params){
		this.url = params.url;
		this.apiTerm = params.apiTerm; // sources vary in how they refer to the token (e.g "token" or "apikey")
		this.token = params.token;
		this.paramMap = params.paramMap;
		this.apiName = params.apiName;
		this.formatEvents = params.formatEvents;
	}

	grab(req, res){
		var requestURL = this.getRequestUrl(req); 
		console.log(requestURL)

		return new Promise(function(resolve, reject) {
  				request(requestURL,
			       	function (error, response, body) {
			           if (!error && response.statusCode == 200) {
			               response = JSON.parse(body);
			               resolve(response);
			           } else {
			               console.log(response.statusCode + response.body);
			               res.send({"error!":response.statusCode + response.body});
			    		}
	   			});
		});
	}

	mapToSourceParams(reqParams){
		var sourceParams = {};
		for (const [key, value] of Object.entries(this.paramMap)) {
			if(reqParams[key] != null){
				sourceParams[value] = reqParams[key];
			}
		}
		return sourceParams;
	}

	getRequestUrl(req){
		var requestURL = this.url;
		var sourceParams = this.mapToSourceParams(req.params);

		for (const [key, value] of Object.entries(sourceParams)) {
			requestURL += key + "=" + value + '&';
		}
		if(this.apiName == "Eventbrite"){
			requestURL += "expand=venue&"
		}

		console.log("the request is: ", requestURL)
		requestURL += this.apiTerm + "=" + this.token;

		return requestURL;
	}

}

module.exports = SourceConstructor; 