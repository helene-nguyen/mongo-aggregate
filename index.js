//~environment
import 'dotenv/config';

//~import modules
import express from 'express';
import { testMongo } from './app/mongodb/mongo.refacto.js';
const app = express();

// app.use(testMongo.fetchAllRides);
// app.use(testMongo.fetchOneRide);
// app.use(testMongo.updateMany);

//~launch app
const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log(`Running server on http://localhost:${PORT}`);
});