if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// require('./config/database')
const db = require('./config/atlas')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash');
const passport = require('passport')
const path = require('path');
const MongoStore = require('connect-mongo')

db.connectDB()
const app = express()
app.set('views', path.join(__dirname, 'views')); // Pastikan folder 'views' sesuai
app.set('view engine','ejs')
app.use(expressLayouts)
app.use(express.urlencoded())
app.use(methodOverride('_method')) //  buat munculin UPDATE dan DELETE

app.use(cookieParser('secret'))
app.use(session({
    cookie : {
        maxAge : 30 *  24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
    },
    // keyword berupa kode enkripsi yang digunakan untuk menandatangani session di dalam sebuah cookie untuk menunjukkan bahwa
    // session id nya secure
    secret : 'secret',
    //dengan resave = false, sesi hanya menyimpan data yang benar-benar berubah.
    resave : false,
    // hanya ingin menyimpan sesi yang benar-benar berguna (misalnya, sesi yang berisi informasi pengguna setelah login). 
    saveUninitialized : false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
    }),
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(flash())    
// middleware yang bakal ngirimin status apakah isAuthenticated true or false ke nav.ejs 
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.user_id; // true jika user sudah login, false jika tidak
    next();
});

// Middleware untuk mengalihkan HTTP ke HTTPS
app.enable('trust proxy');
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && !req.secure) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});


app.use('/',require('./routes/auth'))
app.use('/',require('./routes/loggedin'))

//handle semua endpoint yang gaada untuk menampilkan 404 not found page
app.get('*', (req, res) => {
    res.status(404).render('404')
})


app.listen(process.env.PORT,() => {
    console.log(`Server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
})