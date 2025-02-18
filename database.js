const Database = require("better-sqlite3");
const db = new Database("webbutiken.db", { verbose: console.log });

const selectAllProducts = `SELECT 
    products.product_id,
    products.name, 
    products.description, 
    products.price, 
    products.stock_quantity, 
    manufacturers.name AS manufacturer,
    categories.name AS category
    FROM products
    JOIN manufacturers ON products.manufacturer_id = manufacturers.manufacturer_id
    LEFT JOIN products_categories ON products.product_id = products_categories.product_id
    LEFT JOIN categories ON products_categories.category_id = categories.category_id`;

//#region Cascade Delete and update for reviews and categories
function cascadeDeleteReviewsCategories() {
  // Creating new table
  db.prepare(
    `CREATE TABLE IF NOT EXISTS reviews_new (
      review_id INTEGER PRIMARY KEY,
      product_id INTEGER,
      customer_id INTEGER,
      rating INTEGER,
      comment TEXT,
      FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE)`
  ).run();

  // Copying all data from old table
  db.prepare(
    `INSERT INTO reviews_new (review_id, product_id, customer_id, rating, comment)
  SELECT review_id, product_id, customer_id, rating, comment FROM reviews`
  ).run();

  // Droping old table and renaming new one to match the old one
  db.prepare(`DROP TABLE reviews`).run();
  db.prepare(`ALTER TABLE reviews_new RENAME TO reviews`).run();
}

function cascadeUpdateProductsCategories() {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS products_categories_new (
    id INTEGER PRIMARY KEY,
    product_id INTEGER,
    category_id INTEGER,
    FOREIGN KEY (product_id) REFERENCES products (product_id) ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (category_id) ON UPDATE CASCADE
    )`
  ).run();

  db.prepare(
    `INSERT INTO products_categories_new (id, product_id, category_id)
      SELECT id, product_id, category_id FROM products_categories`
  ).run();

  db.prepare(`DROP TABLE products_categories`).run();
  db.prepare(
    `ALTER TABLE products_categories_new RENAME TO products_categories`
  ).run();
}

//cascadeDeleteReviewsCategories();
//cascadeUpdateProductsCategories();
//#endregion

//#region product functions
function getAllProducts(minPrice, maxPrice) {
  let query = selectAllProducts;
  const queryParams = [];
  const conditions = [];

  // check if minPrice or maxPrice is provided
  if (minPrice !== undefined) {
    conditions.push("products.price >= ?");
    queryParams.push(minPrice);
  }
  if (maxPrice !== undefined) {
    conditions.push("products.price <= ?");
    queryParams.push(maxPrice);
  }

  // if there are any conditions provided add relevant syntax
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  const stmt = db.prepare(query);
  return stmt.all(...queryParams); // ... expands the array into separate parameters
}

function getProductById(id) {
  const stmt = db.prepare(`${selectAllProducts}
    WHERE products.product_id = ?`);
  return stmt.get(id);
}

function getProductsByName(name) {
  const stmt = db.prepare(`${selectAllProducts}
    WHERE products.name LIKE ?`);
  return stmt.all(`%${name}%`);
}

function getProductsByCategory(categoryId) {
  const stmt = db.prepare(`${selectAllProducts}
        WHERE categories.category_Id = ?`);
  return stmt.all(categoryId);
}

function createProduct(
  manufacturer_id,
  name,
  description,
  price,
  stock_quantity
) {
  try {
    const stmt = db.prepare(
      "INSERT INTO products (manufacturer_id, name, description, price, stock_quantity) VALUES (?,?,?,?,?)"
    );
    return stmt.run(manufacturer_id, name, description, price, stock_quantity);
  } catch (err) {
    console.error("failed to add product", err);
  }
}

function updateProduct(
  id,
  manufacturer_id,
  name,
  description,
  price,
  stock_quantity
) {
  try {
    const stmt = db.prepare(
      "UPDATE products SET manufacturer_id = ?, name = ?, description = ?, price = ?, stock_quantity = ? WHERE product_id = ?"
    );
    return stmt.run(
      manufacturer_id,
      name,
      description,
      price,
      stock_quantity,
      id
    );
  } catch (err) {
    console.error("failed to update product: ", err);
  }
}

function deleteProduct(id) {
  const stmt = db.prepare("DELETE FROM products WHERE product_id = ?");
  return stmt.run(id);
}
//#endregion

//#region customer functions
function getCustomerById(id) {
  const query = `SELECT 
    customers.customer_id AS Customer_Id, 
    customers.name AS Name, 
    customers.email AS Email, 
    customers.phone AS Phone_Nr, 
    customers.address AS Address, 
    customers.password AS Password,
    JSON_GROUP_ARRAY(JSON_OBJECT('Order_Nr', orders.order_id, 'Order_Date', orders.order_date)) AS Orders
  FROM customers
  LEFT JOIN orders ON orders.customer_id = customers.customer_id
  WHERE customers.customer_id = ?
  GROUP BY customers.customer_id`;

  const stmt = db.prepare(query);
  return stmt.get(id);
}

function updateCustomerContactInfo(id, email, phone, address) {
  const query = `UPDATE customers SET email = ?, phone = ?, address = ? WHERE customer_id = ?`;

  try {
    const stmt = db.prepare(query);
    return stmt.run(email, phone, address, id);
  } catch (err) {
    console.error("Failed to update customer", err);
  }
}

function getOrdersByCustomer(id) {
  const query = `SELECT
      orders.order_id AS Order_Nr, 
      orders.order_date AS Order_Date,
      products.name AS Product,
      orders_products.quantity AS Quantity,
      orders_products.unit_price AS Unit_Price
    FROM customers
    LEFT JOIN orders ON orders.customer_id = customers.customer_id
    LEFT JOIN orders_products ON orders_products.order_id = orders.order_id
    LEFT JOIN products ON products.product_id = orders_products.product_id
    WHERE customers.customer_id = ?`;

  const stmt = db.prepare(query);
  return stmt.all(id);
}
//#endregion

//#region analysis functions
function getProductStats() {
  const query = `SELECT 
      categories.name AS Category,
      COUNT(products.product_id) AS Products,
      AVG(products.price) AS Average_Price
    FROM categories
    LEFT JOIN products_categories ON products_categories.category_id = categories.category_id
    LEFT JOIN products ON products.product_id = products_categories.product_id
    GROUP BY categories.category_id
  `;

  const stmt = db.prepare(query);
  return stmt.all();
}

function getReviewStats() {
  const query = `SELECT 
  products.name AS Product, 
  AVG(reviews.rating) AS Average_Score
  FROM products
  LEFT JOIN reviews ON reviews.product_id = products.product_id
  GROUP BY products.product_id
  `;

  const stmt = db.prepare(query);
  return stmt.all();
}
//#endregion

//#region exporting functions to app.js
module.exports = {
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
};
//#endregion
