// Imports
import express = require('express');
import { DatabaseHelper } from './helpers/database-helper';
import { ServiceRoutes } from './routes/service-routes';
import { ClientRoutes } from './routes/client-routes';

const bodyParser = require('body-parser');
const path = require('path');

// Config
require('dotenv').config();

// Database
const dbEndpoint = process.env.DATABASE_ENDPOINT;
const dbKey = process.env.DATABASE_KEY;
DatabaseHelper.config(dbEndpoint, dbKey);

// Express
const app = express();
app.use(bodyParser.json());
app.use('/static', express.static(path.join(__dirname, '../public')))

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Routes
app.all('/', (req, res, next) => {

    if (req.query.action) {

        let action = req.query.action;

        switch(action) {

            case 'keys': ServiceRoutes.keys(req, res); break;
            case 'registrationStatus': ServiceRoutes.registrationStatus(req, res); break;
            case 'optin': ServiceRoutes.optIn(req, res); break;
            case 'optout': ServiceRoutes.optOut(req, res); break;
            case 'push': ServiceRoutes.push(req, res); break;
            case 'subscriptionStatus': ClientRoutes.subscriptionStatus(req, res); break;
            case 'subscribe': ClientRoutes.subscribe(req, res); break;
            case 'unsubscribe': ClientRoutes.unsubscribe(req, res); break;
        }
    }
    else {

        next();
    }
});
app.get('/', (req, res) => {

    res.render('index.ejs');
});

// Start the server
const port = process.env.PORT;
app.listen(port, async function () {
    
    console.log(`Listening on port ${port}`);
});