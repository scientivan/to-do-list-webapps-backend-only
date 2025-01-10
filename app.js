require('dotenv').config()
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const bcrypt = require('bcrypt')

const methodOverride = require('method-override')

const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash');

const {userModel,toDoModel,completedModel} = require('./server/models/dbModel')
require('./server/config/database')

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

app.use('/',require('./server/routes/auth'))
app.use('/',require('./server/routes/loggedin'))

//handle semua endpoint yang gaada untuk menampilkan 404 not found page
app.get('*', (req, res) => {
    res.status(404).render('404')
})




app.get('/logout',isAuthenticated,(req,res) => {
    req.session.user_id = undefined
    res.locals.isAuthenticated = req.session.user_id 
    res.redirect('/login')
})

//home untuk ngeshow to do listnya
app.get('/completed',isAuthenticated, async (req,res) => {
    const list = await completedModel.find({'user_id' : req.session.user_id})
    res.render('completed',{
        layout : 'layouts/main-layout',
        title : 'Completed Task Page',
        list : list,
        msg: req.flash('msg')
    })
})

app.get('/completed/:sort',isAuthenticated, async (req,res) => {
    if(req.params.sort == "due_date"){
        const list = await completedModel.find({'user_id' : req.session.user_id}).sort({due_date : 1})  
        res.render('completed',{
            layout : 'layouts/main-layout',
            title : 'Completed Task Page',
            list : list,
            msg: req.flash('msg')
        })
    }
    else if(req.params.sort == "priority_level"){
        const list = await completedModel.find({'user_id' : req.session.user_id}).sort({priority_level: -1})  
        res.render('completed',{
            layout : 'layouts/main-layout',
            title : 'Completed Task Page',
            list : list,
            msg: req.flash('msg')
        })
    }
})

app.listen(PORT,() => {
    console.log(`listening on PORT ${PORT}`)
})