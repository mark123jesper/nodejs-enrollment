const express = require('express');
const app = express();
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');
const cookie = require('cookie-parser');
const hostname = 'localhost';
const port = 3000;

//database configuration
dotenv.config({
    path: './.env'
});
const database = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    port: process.env.DATABASE_PORT,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

//connecting into database
database.connect((err) => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    } else {
        console.log('mysql connected/app.js Line:28');
    }
})

//setting the handlebars view engineer template
app.set('view engine', 'hbs');

//Parse incoming request from json to string
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

//Define routes
app.use('/', require('./routes/adminRoutes.js'));
app.use('/auth', require('./routes/auth'))

//Need to refer on public folder for css or js
const publicdir = path.join(__dirname, './public/');
app.use(express.static(publicdir));

//Need for cookie-parser
app.use(cookie());

app.listen(port, hostname, () => {
    console.log(`Server Running at http://${hostname}:${port}`);
});