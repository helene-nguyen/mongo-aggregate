//~ Import Router
import { Router } from 'express';
const router = Router();

import { fetchAllRides, fetchOneRide, createRide, updateMany, deleteMany, fetchAllRidesByEvent } from './mongodb/mongo.refacto.js';
import { fetchAllUsers } from './mongodb/main.js';
import {agg} from './mongodb/aggregate.refacto.js';

router.get('/', fetchAllUsers);

router.get('/rides', fetchAllRides);
router.get('/rides/:id', fetchOneRide);

router.get('/aggregate', agg.categories);

//~ Export router
export { router };
