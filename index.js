const express = require('express');
const { render } = require('ejs');
const bodyParser = require('body-parser');
const client = require('./config/database');
const session = require('express-session');
const uuid = require('uuidv4');
const userRoute = require('./routes/User');

const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());


app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
})

// Templating Engine
app.set('view engine', 'ejs');
app.set('views', 'views/')



app.use('/', userRoute);





app.listen(8000, function(){
    console.log('App is running at port 8000');
})