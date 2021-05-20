const express = require("express");

const scraper = require("./scrape/scrapeRoutes");
const suggest = require("./suggest/suggestRoutes");

const scrapeRouter = express.Router();
scrapeRouter.get('/', scraper.welcome);
scrapeRouter.get('/screenshot', scraper.screenshot);
scrapeRouter.post('/', scraper.scrape);

const suggestRouter = express.Router();
suggestRouter.post('/', suggest.suggest);

const baseRouter = express.Router();
baseRouter.use('/scrape', scrapeRouter);
baseRouter.use('/suggest', suggestRouter);

module.exports = baseRouter;
