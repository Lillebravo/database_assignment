const Database = require("better-sqlite3");
const db = new Database("webbutiken.db", { verbose: console.log });

//#region product functions
function getProducts() {
    const stmt = db.prepare('SELECT * FROM products');
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