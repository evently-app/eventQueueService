var chai = require('chai')
  , chaiHttp = require('chai-http');
chai.use(chaiHttp);

var expect = chai.expect;


// *****ASYNC CURRENTLY NOT WORKING, UNSURE WHY

describe('eventbriteSimpleAPICall', function() {
  this.timeout(5000);

  describe('#differentParams', function() {
	it('city + radius', async function() { 
	  const res = await chai.request('https://www.eventbriteapi.com/v3/events')
	  .get('/search')
	  .query({'location.address': 'newhaven', 'location.within': '10km', 'token': process.env.EVENTBRITE_API_KEY});
	  expect(res).to.have.status(200);
	});

	it('longitude + latitude + radius', async function() { 
	  const res = await chai.request('https://www.eventbriteapi.com/v3/events')
	  .get('/search')
	  .query({'location.longitude': '41.310726', 'location.latitude': '-72.929916',
	  	'location.within': '3km', 'token': process.env.EVENTBRITE_API_KEY});
	  expect(res).to.have.status(200);
	});

	it('city + expand venue', async function() { 
	  const res = await chai.request('https://www.eventbriteapi.com/v3/events')
	  .get('/search')
	  .query({'location.address': 'newhaven', "expand":"venue", 'token': process.env.EVENTBRITE_API_KEY});
	  expect(res).to.have.status(200);
	});
  });
});