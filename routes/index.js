const express = require("express");

const scraper = require("./scrape/scrapeRoutes");
const suggest = require("./suggest/suggestRoutes");
const health = require("./health/healthRoutes");

const scrapeRouter = express.Router();
scrapeRouter.post('/', scraper.scrape);

const suggestRouter = express.Router();
suggestRouter.post('/', suggest.suggest);

const healthRouter = express.Router();
healthRouter.get('/heartbeat', health.heartbeat);

const baseRouter = express.Router();
baseRouter.use('/scrape', scrapeRouter);
baseRouter.use('/suggest', suggestRouter);
baseRouter.use('/health', healthRouter);

module.exports = baseRouter;
