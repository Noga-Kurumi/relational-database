require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler, notFoundHandler } = require('./middleware/errors.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use(morgan('dev'));

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

//Router responsible for managing user path requests
const { customerRouters } = require('./routers/customers.js');
app.use('/api/customers/', customerRouters);

//Router responsible for login users and return JWT
const { loginRouters } = require('./routers/login.js');
app.use('/api/login/', loginRouters);

//Router responsible for login users and return JWT
const { productsRouters } = require('./routers/products.js');
app.use('/api/products/', productsRouters);

//Router responsible for products orders
const { ordersRouters } = require('./routers/orders.js');
app.use('/api/orders/', ordersRouters);

//Middleware for error handlers
app.use(notFoundHandler);
app.use(errorHandler);

//Porting and listening
const PORT = process.env.PORT || 3000;

// Only start the server if this file is run directly. When running tests
// with Jest, `NODE_ENV` is set to "test" so the server won't listen on a
// port, allowing Supertest to handle requests directly against the app
// instance.
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;
