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

// Trying to add cascade delete constraint but didn´t work
/* db.prepare(`CREATE TABLE IF NOT EXISTS reviews_new (
    review_id INTEGER PRIMARY KEY,
    product_id INTEGER,
    review_text TEXT,
    rating INTEGER,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE)`);

db.prepare(`INSERT INTO reviews_new (review_id, product_id, review_text, rating)
SELECT review_id, product_id, review_text, rating FROM reviews`);

db.prepare(`DROP TABLE reviews`);

db.prepare(`ALTER TABLE reviews_new RENAME TO reviews`); */

//#region product functions
function getAllProducts() {
  const stmt = db.prepare(selectAllProducts);
  return stmt.all();
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

function createProduct(manufacturer_id, name, description, price, stock_quantity) {
    try {
        const stmt = db.prepare("INSERT INTO products (manufacturer_id, name, description, price, stock_quantity) VALUES (?,?,?,?,?)");
        return stmt.run(manufacturer_id, name, description, price, stock_quantity);
      } catch (err) {
        console.error("failed to add product", err);
      }
}

function updateProduct(id, manufacturer_id, name, description, price, stock_quantity) {
    try {
        const stmt = db.prepare(
          "UPDATE products SET manufacturer_id = ?, name = ?, description = ?, price = ?, stock_quantity = ? WHERE product_id = ?"
        );
        return stmt.run(manufacturer_id, name, description, price, stock_quantity, id);
      } catch (err) {
        console.error("failed to update product: ", err);
      }
}

function deleteProduct() {
    // DELETE /products/:id
    // ska även ta bort alla recensioner, cascade delete
}
//#endregion

//#region customer functions
function getCustomerById() {
    // GET /customers/:id 
    // visa kundinfo
    // inkludera även orderhistorik via join med orders-tabellen
}

function updateCustomerContactInfo() {
    // PUT /customers/:id
    // email, telefon, address
}

function getOrdersByCustomer() {
    // GET /customers/:id/orders
}
//#endregion

//#region analysis functions
function getProductStats() {
    // GET /products/stats
    // visa statistik grupperad per kategori
    // Antal produkter per kategori
    // Genomsnittligt pris per kategori
}

function getReviewStats() {
    // GET /reviews/stats
    // visa genomsnittligt betyg per produkt
    // använd group by för att sammanställa data
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
  getReviewStats
};
//#endregion
