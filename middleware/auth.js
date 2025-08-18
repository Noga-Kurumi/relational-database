const jwt = require('jsonwebtoken');

/*
Auth module verify if the user has Admin role or ID matching with ID request.

Only logged users will get access. Without token users cannot get access.
The token contains user ID and role

Example: If request has ID 9 and Payload in user token has same ID, it grants access to method.
Otherwise access is denied unless role it is Admin.
*/

//"roles" is an array containing the roles required to access the method. If the user has at least one of the required roles, they are granted access.
function auth(roles) {
  return (req, res, next) => {
    const authHeader = req.get('authorization');

    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Autenticacion invalida.' });
    }

    const token = authHeader.slice(7).trim();
    if (token === '') {
      return res.status(401).json({ error: 'Autenticacion invalida.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Autenticacion invalida.' });
    }

    req.user = payload;

    if (roles.includes(payload.role)) {
      console.log(`Usuario con acceso: ${payload.role}`);

      if (payload.role === 'user') {
        const id = Number(req.params.id);
        if (id === payload.id) {
          console.log('Acceso concedido.');
        } else {
          return res.status(401).json({ error: 'Autenticacion invalida.' });
        }
      }
    } else {
      return res.status(401).json({ error: 'Autenticacion invalida.' });
    }
    next();
  };
}

module.exports = { auth };
