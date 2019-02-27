'use strict';

var request = require('request');

class sourceConstructor {
	constructor(url, apiTerm, token, paramMap, apiName){
		this.url = url;
		this.apiTerm = apiTerm; // sources vary in how they refer to the token (e.g "token" or "apikey")
		this.token = token;
		this.paramMap = paramMap;
		this.apiName = apiName;
		this.lastData = null;
	}

	grab(req, res){
		var requestURL = this.getRequestUrl(req);

		request(requestURL,
	       	function (error, response, body) {
	           if (!error && response.statusCode == 200) {
	               response = JSON.parse(body);
	               this.lastData = response;
	           } else {
	               console.log(response.statusCode + response.body);
	               res.send({"error!":response.statusCode + response.body});
	           }
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

module.exports = sourceConstructor; 