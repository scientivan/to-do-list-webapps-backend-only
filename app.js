require('dotenv').config()
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const bcrypt = require('bcrypt')

const methodOverride = require('method-override')

const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash');

require('./config/database')

const PORT = process.env.PORT   
const app = express()

app.set('view engine','ejs')
app.use(expressLayouts)
app.use(express.urlencoded())
app.use(methodOverride('_method')) //  buat munculin UPDATE dan DELETE
app.use(flash())    

app.use(cookieParser('secret'))
app.use(session({
    cookie : {maxAge : 30 *  24 * 60 * 60 * 1000},
    secret : 'secret',
    resave : false,
    saveUninitialized : false
}))

//middleware yang bakal ngirimin status apakah isAuthenticated true or false ke nav.ejs 
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.user_id; // true jika user sudah login, false jika tidak
    next();
});

app.use('/',require('./routes/auth'))
app.use('/',require('./routes/loggedin'))

//handle semua endpoint yang gaada untuk menampilkan 404 not found page
app.get('*', (req, res) => {
    res.status(404).render('404')
})


app.listen(PORT,() => {
    console.log(`listening on PORT ${PORT}`)
})