const chai = require('chai')
  , chaiHttp = require('chai-http');
chai.use(chaiHttp);
const eventbriteSrcObj = require('../sources/eventbrite');
const assert = require('assert');

const expect = chai.expect;


// *****ASYNC CURRENTLY NOT WORKING, UNSURE WHY

// Should limit the number of api calls to eventbrite to stay within our api call limits

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
	  .query({'location.longitude': '-72.929916', 'location.latitude': '41.310726',
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


describe('EventbriteCallWithSourceObj', function() {
  this.timeout(5000);
  const mockReq = {params: {'latitude': '41.310726', 'longitude': '-72.929916', 'radius': '5km'}};
  const mockRes = {};

  it('EventbriteCall with source object', async function() { 
	  const res = await eventbriteSrcObj.grab(mockReq, mockRes);
	  assert(res.events.length > 0);
  });
});


describe('eventbriteDataFormat', function() {
  this.timeout(5000);
  const mockReq = {params: {'latitude': '41.310726', 'longitude': '-72.929916', 'radius': '5km'}};
  const mockRes = {};

  it('checking formatting function for eventbrite', async function() { 
	  const res = await eventbriteSrcObj.grab(mockReq, mockRes);
	  const formatted = eventbriteSrcObj.formatEvents(res);
	  assert(formatted.length > 0);
  });
});