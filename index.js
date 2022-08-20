//~environment
import 'dotenv/config';

//~import modules
import express from 'express';
const app = express();

import { router } from './app/routes.js'

//~launch app
const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log(`Running server on http://localhost:${PORT}`);
});