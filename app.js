//#region importing functions from database.js and middlewares.js
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
  getReviewStats,
} = require("./database.js");

const {
  logger,
  validateProductInput,
  validateCustomerInput,
  notValidNr,
} = require("./middlewares.js");
//#endregion

const express = require("express");
const app = express();

app.listen(8000, () => {
  console.log("Server is running");
});
app.use(logger); // all requests use logger middleware function
app.use(express.json());

//#region GET methods
app.get("/", (req, res) => {
  console.log("Starting page");
});

app.get("/products", (req, res) => {
  // to test filtering: /products?minPrice=100&maxPrice=1000

  // getting parameters
  const minPrice = req.query.minPrice
    ? parseFloat(req.query.minPrice)
    : undefined;
  const maxPrice = req.query.maxPrice
    ? parseFloat(req.query.maxPrice)
    : undefined;

  // validation
  const errors = [];
  if (minPrice !== undefined || maxPrice !== undefined) { // Only validate if at least one of them are defined
    if (minPrice !== undefined && notValidNr(minPrice) !== "") {
      errors.push(`minPrice${notValidNr(minPrice)}`);
    }
    if (maxPrice !== undefined && notValidNr(maxPrice) !== "") {
      errors.push(`maxPrice${notValidNr(maxPrice)}`);
    }
    if (minPrice > maxPrice) {
      errors.push(`maxPrice cannot be lower than minPrice`);
    }

    // If there are errors, return response
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
  }

  res.json(getAllProducts(minPrice, maxPrice));
});

app.get("/products/:id", (req, res) => {
  res.send(getProductById(req.params.id));
});

app.get(`/products/search/:name`, (req, res) => {
  res.send(getProductsByName(req.params.name));
});

app.get(`/products/category/:categoryId`, (req, res) => {
  res.send(getProductsByCategory(req.params.categoryId));
});

app.get("/customers/:id", (req, res) => {
  res.send(getCustomerById(req.params.id));
});

app.get("/customers/:id/orders", (req, res) => {
  res.send(getOrdersByCustomer(req.params.id));
});

app.get("/products/stats/categories", (req, res) => {
  res.send(getProductStats());
});

app.get("/products/stats/reviews", (req, res) => {
  res.send(getReviewStats());
});
//#endregion

//#region POST methods
app.post(`/products`, validateProductInput, (req, res) => {
  const { manufacturer_id, name, description, price, stock_quantity } =
    req.body;
  res
    .status(201)
    .json(
      createProduct(manufacturer_id, name, description, price, stock_quantity)
    );
});
//#endregion

//#region PUT methods
app.put(`/products/:id`, validateProductInput, (req, res) => {
  const { manufacturer_id, name, description, price, stock_quantity } =
    req.body;
  res
    .status(201)
    .json(
      updateProduct(
        manufacturer_id,
        name,
        description,
        price,
        stock_quantity,
        req.params.id
      )
    );
});

app.put(`/customers/:id`, validateCustomerInput, (req, res) => {
  const { email, phone, address } = req.body;
  res
    .status(201)
    .json(updateCustomerContactInfo(req.params.id, email, phone, address));
});
//#endregion

//#region DELETE methods
app.delete("/products/:id", (req, res) => {
  res.send(deleteProduct(req.params.id));
});
//#endregion
