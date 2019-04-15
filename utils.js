

module.exports = {

	//Helper Function for flattening an array.
	flatten : function (arr) {
		var flattened = [];
		for (var i = 0; i < arr.length; i++) {
			for (var j = 0; j < arr[i].length; j++) {
				flattened.push(arr[i][j]);
			}
		}
		return flattened;
	},

	// Calculate the time difference between two Date() object in milliseconds.
	timeBetween: function ( date1, date2 ) {
	  // Convert both dates to milliseconds
	  var date1_ms = date1.getTime();
	  var date2_ms = date2.getTime();

	  // Calculate the difference in milliseconds
	  var difference_ms = date2_ms - date1_ms;
	    
	  // Convert back to days and return
	  return difference_ms; 
	},

	distanceBetween: function (lat1, lon1, lat2, lon2){
		var R = 6371; // Radius of the earth in km
		var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
		var dLon = this.deg2rad(lon2-lon1); 
		var a = 
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
		Math.sin(dLon/2) * Math.sin(dLon/2)
		; 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		return d;
	},

	deg2rad: function (deg) {
		return deg * (Math.PI/180)
	},

	// scale a number in range [min,max] to [a,b]. 
	// For example project a list of number [4,7,8,10] from range [4,10] to range [0,1]
	// will give us a list of [0,0.5,0.667,1]
	scaleDown: function (x,min,max,a,b){
		return (b-a)*(x-min)/(max-min)+a;
	},

	// Calculate the dot product of two vectors, represented by lists
	dotProduct: function(a,b) {
	    var n = 0, lim = Math.min(a.length,b.length)
	    for (var i = 0; i < lim; i++) 
	    	n += a[i] * b[i]
	    return n
 	},

 	// 
	magnitude: function(a) {
		var sumsqr = 0
		for (var i = 0; i < a.length; i++) 
			sumsqr += a[i]*a[i]
		return Math.sqrt(sumsqr)
	},

	similarity: function (a, b){
		return this.dotProduct(a,b)/(this.magnitude(a)*this.magnitude(b))
	}


};
