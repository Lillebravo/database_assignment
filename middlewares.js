const logger = (req, res, next) => {
  // Keep track if we've logged already
  let logged = false;

  // Store original send
  const originalSend = res.send;
  const originalJson = res.json;

  // Function to log the request
  const logRequest = () => {
    if (!logged) {
      console.log(
        `${new Date().toISOString()} - ${req.method} ${req.url} - Status: ${
          res.statusCode
        }`
      );
      logged = true;
    }
  };

  // Override send method
  // If `res.send` is called, we override it to log the request before sending a response.
  // This prevents duplicate responses (one from the original send and one from the overridden send).
  res.send = function (data) {
    logRequest(); // Log the request before sending the response
    return originalSend.apply(res, arguments); // Call the original `send` method with the same arguments
  };

  // Override json
  res.json = function (data) {
    logRequest();
    return originalJson.apply(res, arguments);
  };

  next();
};

// Validation for product inputs
const validateProductInput = (req, res, next) => {
  const { name, price, stock_quantity } = req.body;
  const errors = [];

  // Validating product name
  if (!name || name.trim() === "") {
    errors.push("Product names cannot be empty");
  }

  // Validate price
  if (!price || notValidNr(price)) {
    errors.push("Price has to be higher than 0");
  }

  // Validate quantity
  if (stock_quantity === undefined || stock_quantity < 0) {
    errors.push("Quantity must be higher than 0");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Validation for customer inputs
const validateCustomerInput = (req, res, next) => {
  const { email, phone, address } = req.body;
  const errors = [];

  // Validating email with regular expression
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailIsValid.test(email)) {
    // returns false if email doesn´t follow the constraints of the regular expression from emailIsValid
    errors.push("Not a valid email");
  }

  // Validating phone nr with reg expression
  // Accepting formats: +46701234567, 0701234567, 070-123 45 67
  const phoneIsValid =
    /^(\+\d{2}|0)[-\s]?[1-9]\d{1,2}[-\s]?\d{2,3}[-\s]?\d{2}[-\s]?\d{2}$/;
  if (!phone || !phoneIsValid.test(phone.replace(/\s+/g, ""))) {
    errors.push(
      "Not a valid phone number. Use format: +46701234567, 0701234567, or 070-123 45 67"
    );
  }

  // Validating address
  if (!address || address.trim() === "") {
    errors.push("Addresses cannot be empty");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

function notValidNr(number) {
  if (isNaN(number) || number < 0) {
    return true;
  }
  return false;
}

module.exports = {
  logger,
  validateProductInput,
  validateCustomerInput,
  notValidNr,
};
