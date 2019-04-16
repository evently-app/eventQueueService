var scraper = require("../scrapers/yale.js");
var assert = require("assert");

//from https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;  
    }
  }

//checks scraper.isValidEvent(event) function.
describe("isValidEvent", function() {
    it("valid event", function() {
        assert.equal(scraper.isValidEvent({}), true);
    });
    it("invalid event", function() {
        assert.equal(scraper.isValidEvent({'check' : undefined}), false);
    });
});

//checks scraper.formatEvents(eventFromAPI) function.
describe("formatEvents", async function() {
    //valid formatEvents checked indirectly through scrape
    it("null event", async function() {
        const formattedEvent = await scraper.formatEvent(null);
        assert.equal(formattedEvent, null);
    });
    it("invalid event", async function() {
        const formattedEvent = await scraper.formatEvent({"improperlyFormatted": "data"});
        assert.equal(formattedEvent, null);
    });
});

//checks scraper.scrapeUrl(gets) gets valid url.
describe("scrapeUrl", async function() {
    it("scrapeUrl valid URL", async function() {
        assert.equal(isValidUrl("null"), false);
        assert.equal(isValidUrl(await scraper.scrapeUrl()), true);
    })
});

//checks scraper.scrapePage(url) handles improper and proper urls well and gives list of 
//formatted events.
describe("scrapePage", async function() {
    it("scrapePage invalid URL", async function() {
        this.timeout(15000);
        assert((await scraper.scrapePage("null")), null)
    });
    it ("scrapePage url from scrapeUrl", async function() {
        this.timeout(15000);
        const scrapedUrl = await scraper.scrapeUrl();
        const scrapedPage = await scraper.scrapePage(scrapedUrl);
        assert(scrapedPage.length > 0);
    });
})

//checks scraper.scrape() gives list of formatted events.
describe("scrape", async function() {
    it("scrape", async function() {
        this.timeout(15000);
        const scrapedData = await scraper.scrape();
        assert(scrapedData.length > 0);
    });
});