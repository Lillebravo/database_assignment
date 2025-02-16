const express = require('express');
const app = express();

//#region importing functions from database.js
const {
    getAllProducts,
    getProductById,
    getProductsByName,
    getProductsByCategory,
    createProduct,
    updateProduct, 
    deleteProduct,
    getCustomerById,
    updateCustomerContactInfo,
    getOrdersByCustomer,
    getProductStats,
    getReviewStats
} = require('./database.js');
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
    res.json(getAllProducts());
});

app.get('/products/:id', (req, res) => {
    res.send(getProductById(req.params.id));
});

app.get(`/products/search/:name`, (req, res) => {
    res.send(getProductsByName(req.params.name));
});

app.get(`/products/category/:categoryId`, (req, res) => {
    res.send(getProductsByCategory(req.params.categoryId));
});
//#endregion

//#region POST methods
app.post(`/products`, (req, res) => {
    const {manufacturer_id, name, description, price, stock_quantity} = req.body;
    res.status(201).json(createProduct(manufacturer_id, name, description, price, stock_quantity));
});
//#endregion

//#region PUT methods
app.put(`/products/:id`, (req, res) => {
    const {manufacturer_id, name, description, price, stock_quantity} = req.body;
    res.status(201).json(updateProduct(req.params.id, manufacturer_id, name, description, price, stock_quantity));
});
//#endregion

//#region DELETE methods
//#endregion