const express = require('express');
const app = express();

//#region importing functions from database.js
const {
    getProducts
} = require('./database.js');
const exp = require('constants');
//#endregion

//#region middlewares
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
}
//#endregion

// initializing app
app.listen(8000, () => {
    console.log('Server is running');
});
app.use(logger);
app.use(express.json());

//#region GET methods
app.get('/', (req, res) => {
    console.log('Starting page');
});

app.get('/products', (req, res) => {
    res.json(getProducts());
});

app.get('/products/:id', (req, res) => {

});
//#endregion

//#region POST methods
//#endregion

//#region PUT methods
//#endregion

//#region DELETE methods
//#endregion