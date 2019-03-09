'use strict';

var rp = require('request-promise');
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


	async grab(req, res){
		var requestURL = this.getRequestUrl(req); 
		console.log(requestURL)
		var options = {
		    uri: requestURL,
		    json: true 
		};
 
		return rp(options)
		    .then(function (data) {
		        return data
		    })
		    .catch(function (err) {
		        console.log(err.statusCode + err.body);
			    res.send({"error!":err.statusCode + err.body});
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

		requestURL += this.apiTerm + "=" + this.token;

		return requestURL;
	}

}

module.exports = SourceConstructor; 
