const jwt = require('jsonwebtoken');
const createError = require('http-errors')

exports.verifyAccessToken = (req, res, next) => {
    if (!req.headers['authorization']) return next(createError(401, 'Please login to access this feature'))

    const authHeader = req.headers['authorization']
    const token = authHeader.split(' ')[1]
    
    jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err, token) => {
        
        if (err) {
            console.log('error');
            return next(createError(401, 'User is not logged in'))
        }
        console.log('out error');
        req.token = token
        next();
    })
}