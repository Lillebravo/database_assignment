const Database = require("better-sqlite3");
const db = new Database("webbutiken.db", { verbose: console.log });

//#region product functions
function getProducts() {
    const stmt = db.prepare(`SELECT 
    products.name, 
    products.description, 
    products.price, 
    products.stock_quantity, 
    manufacturers.name AS manufacturer,
    categories.name AS category
    FROM products
    JOIN manufacturers ON products.manufacturer_id = manufacturers.manufacturer_id
    JOIN products_categories ON products.product_id = products_categories.product_id
    JOIN categories ON products_categories.category_id = categories.category_id`);
    return stmt.all();
}
//#endregion

//#region customer functions
//#endregion

//#region analysis functions 
//#endregion

//#region exporting functions to app.js
module.exports = {
    getProducts
};
//#endregion