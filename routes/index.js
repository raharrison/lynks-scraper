const express = require("express");

const scraper = require("./scrape/scrapeRoutes");

const scrapeRouter = express.Router();
scrapeRouter.get('/', scraper.welcome);
scrapeRouter.get('/screenshot', scraper.screenshot);
scrapeRouter.post('/', scraper.scrape);
// scrapeRouter.post('/', addOneUser);

const baseRouter = express.Router();
baseRouter.use('/scrape', scrapeRouter);

module.exports = baseRouter;
