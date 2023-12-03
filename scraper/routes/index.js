import express from "express";

import {scrape} from "./scrape/scrapeRoutes.js";
import {suggest} from "./suggest/suggestRoutes.js";
import {heartbeat} from "./health/healthRoutes.js";

const scrapeRouter = express.Router();
scrapeRouter.post('/', scrape);

const suggestRouter = express.Router();
suggestRouter.post('/', suggest);

const healthRouter = express.Router();
healthRouter.get('/heartbeat', heartbeat);

const baseRouter = express.Router();
baseRouter.use('/scrape', scrapeRouter);
baseRouter.use('/suggest', suggestRouter);
baseRouter.use('/health', healthRouter);

export default baseRouter;
