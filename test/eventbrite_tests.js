var chai = require('chai')
  , chaiHttp = require('chai-http');
chai.use(chaiHttp);

var expect = chai.expect;

describe('eventbriteSimpleAPICall', function() {
  describe('#callSuccess', function() {
	it('success, as expected', function(done) { 
	  chai.request('https://www.eventbriteapi.com/v3/events')
	  .get('/search')
	  .query({'location.address': 'newhaven', 'location.within': '10km', 'token': process.env.EVENTBRITE_API_KEY})
	  .end(function(err, res) {
	     expect(err).to.be.null;
	     expect(res).to.have.status(200);
	     done();
	  });
	});
  });
});