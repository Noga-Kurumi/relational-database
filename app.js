const express = require('express');
require('dotenv').config();

const app = express();

app.use(express.json());

//Router responsible for managing user path requests
const { customerRouters } = require('./routers/customers.js');
app.use('/api/customers/', customerRouters);

//Router responsible for login users and return JWT
const { loginRouters } = require('./routers/login.js');
app.use('/api/login/', loginRouters);

//Porting and listening
const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
