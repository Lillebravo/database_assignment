const Database = require("better-sqlite3");
const db = new Database("webbutiken.db", { verbose: console.log });

const allProductsQuery = `SELECT 
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

//#region product functions
function getAllProducts() {
  const stmt = db.prepare(allProductsQuery);
  return stmt.all();
}

function getProductById(id) {
  const stmt = db.prepare(`${allProductsQuery}
    WHERE products.product_id = ?`);
  return stmt.get(id);
}

function getProductByName(name) {
  const stmt = db.prepare(`${allProductsQuery}
    WHERE products.name LIKE ?`);
  return stmt.all(`%${name}%`);
}
//#endregion

//#region customer functions
//#endregion

//#region analysis functions
//#endregion

//#region exporting functions to app.js
module.exports = {
  getAllProducts,
  getProductById,
  getProductByName
};
//#endregion
