const express = require('express');
const { errorHandler, notFoundHandler } = require('./middleware/errors.js');
require('dotenv').config();

const app = express();

app.use(express.json());

//Router responsible for managing user path requests
const { customerRouters } = require('./routers/customers.js');
app.use('/api/customers/', customerRouters);

//Router responsible for login users and return JWT
const { loginRouters } = require('./routers/login.js');
app.use('/api/login/', loginRouters);

//Router responsible for login users and return JWT
const { productsRouters } = require('./routers/products.js');
app.use('/api/products/', productsRouters);

//Middleware for error handlers
app.use(notFoundHandler);
app.use(errorHandler);

//Porting and listening
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
