var chai = require('chai')

var expect = chai.expect;

describe('sample_test', function() {
  describe('#callSuccess', function() {
	it('success, as expected', function() { 
	  expect(true).to.equal(true)
	});
  });
});