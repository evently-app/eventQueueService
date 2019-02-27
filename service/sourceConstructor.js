var request = require('request');

class sourceConstructor {
	constructor(url, apiTerm, token, paramList, apiName){
		this.url = url;
		this.apiTerm = apiTerm
		this.token = token;
		this.paramList = paramList;
		this.apiName = apiName;
	}

	grab(req, res){
		var requestURL = this.getRequestUrl(req)

		request(requestURL,
	       	function (error, response, body) {
	           if (!error && response.statusCode == 200) {
	               response = JSON.parse(body);
	               return response
	           } else {
	               console.log(response.statusCode + response.body);
	               return -1
	           }
	    });
	}

	getRequestUrl(req){
		var requestURL = this.url
		for (var i = 0; i < this.paramList.length; i++){
			if(req.params[this.paramList[i]] != null){
				requestURL += this.paramList[i] + "=" + req.params[this.paramList[i]] + '&'
			}
		}
		requestURL += this.apiTerm + "=" + this.token

		return requestURL
	}

}

module.exports = sourceConstructor; 