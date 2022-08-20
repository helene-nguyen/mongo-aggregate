//~environment
import 'dotenv/config';

//~import modules
import express from 'express';
const app = express();

import {_404} from './app/errorHandler.js';

//~ Router
import { router } from './app/routes.js'
app.use(router);

//~ Motor
app.set('view engine', 'ejs');
app.set('views', './app/views');

//~ Page not found
app.use(_404);

//~launch app
const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log(`Running server on http://localhost:${PORT}`);
});