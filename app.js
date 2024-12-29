const {userModel,toDoModel,completedModel} = require('./models/dbModel')
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const express = require('express')
const { body, check,validationResult } = require('express-validator');
const bcrypt = require('bcrypt')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash');

require('./utils/database')

const PORT = 3300
const app = express()

app.set('view engine','ejs')
app.use(expressLayouts)
app.use(express.urlencoded())
app.use(methodOverride('_method'))
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

// middleware untuk ngeamanin halaman halaman yang user harus terautentikasi dlu untuk ngakses halaman-halamannya
const isAuthenticated = (req, res, next) => {
    if (req.session.user_id) {
        next(); // User sudah login, lanjutkan ke handler berikutnya
    } else {
        req.flash('msg', 'Silakan login terlebih dahulu');
        res.redirect('/login');
    }
};

//route ke register
app.get('/register',(req,res) => {
    res.render('register',{
        title : 'Register Page',
        layout: 'layouts/main-layout', 
    })
})

//proses ngemasukkin data yang diisi ke database
app.post('/register',[check('email',"Email tidak valid!").isEmail(),body('email').custom(async (value) => {
    const duplicate = await userModel.findOne({'email' : value})
    if(duplicate){
        throw new Error('Email sudah terdaftar!')    
    }
    return true
    
})], async (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.render('register',{
            title : 'Register Page',
            layout: 'layouts/main-layout',
            errors : errors.array()
        })
    }
    else{
        const hash = await bcrypt.hash(req.body.password,13)
        req.body.password = hash
        const newUser = await userModel.insertMany(req.body)
        req.session.user_id = newUser._id
        req.flash('msg','Berhasil membuat akun ') // berhasil
        res.redirect('/')
    }
})

//route ke login
app.get('/login',(req,res) => {
    
    res.render('login',{
        layout: 'layouts/main-layout',
        title : 'Register Page',
        msg : req.flash('msg')
    })
})

//proses ngecocokin data yang ada di database untuk login
app.post('/login',async (req,res)=>{
    // check ke database
    const userAccount =  await userModel.findOne({'email' : req.body.email})
    if(!userAccount){
        res.render('login',{
            layout: 'layouts/main-layout',
            title : 'Register Page',
            msg : 'Akun tidak ditemukan, silakan coba lagi'
        })
    }
    else{
        const isValid = await bcrypt.compare(req.body.password,userAccount.password)
        if(!isValid){
            req.flash('msg','Wrong password')
            res.redirect('/login')
        }
        else{
            req.session.user_id = userAccount._id
            req.flash("msg",'Berhasil masuk ke akun') // berhasil
            res.redirect('/')
        }
    }
})

app.get('/add',isAuthenticated, async (req,res) => {
    res.render('add-todo',{
        layout : 'layouts/main-layout',
        title : 'Add to To Do List Page',
        user_id : req.session.user_id
    })
 
})

app.post('/add', (req,res) => {
    if (req.body.priority == "Low") {
        req.body.priority_level = 1
    } else if (req.body.priority == "Mid") {
        req.body.priority_level = 2
    } else if (req.body.priority == "High") {
        req.body.priority_level = 3  
    }
    toDoModel.insertMany(req.body)
    res.redirect('/')
})


app.get('/edit/:title', isAuthenticated, async (req,res) => {
    const list = await toDoModel.findOne({'title' : req.params.title})
    res.render('edit-todo',{
        layout : 'layouts/main-layout',
        title : 'Edit To Do List Page',
        id : list._id,
        list : list,
    })
})

app.put('/edit', async (req,res) => {
    var currentdate = new Date(); 
    const date = currentdate.getDate() + "/"
    + (currentdate.getMonth()+1)  + "/" 
    + currentdate.getFullYear()

    const time = currentdate.getHours() + ":"  
    + currentdate.getMinutes() + ":" 
    + currentdate.getSeconds(); 
    
    await toDoModel.updateOne({"user_id" : req.session.user_id, "_id" : req.body.todo_id },{
        $set : {
            title : req.body.title,
            description : req.body.description,
            due_date : req.body.due_date,
            priority : req.body.priority,
            updated_at : date + '@' + time
        }
    })
    req.flash('msg',"Sucessfully updated!")
    res.redirect('/')
})

app.delete('/delete',async (req,res) => {
    console.log(req.body.todo_id)
    const isTask = await toDoModel.findById(req.body.todo_id)
    if(!isTask){
        //kalok yang mau dihapus  gaada
        req.flash('msg','Failed to delete the task')
        res.redirect('/')
    }
    else{
        //kalok yang dihapus ada
        await toDoModel.deleteOne({'_id' : req.body.todo_id})
        req.flash('msg','To do task is suscessfully deleted')
        res.redirect('/')
    }
})

app.delete('/completed/delete',async (req,res) => {
    const isTask = await completedModel.findById(req.body.todo_id)
    if(!isTask){
        //kalok yang mau dihapus  gaada
        req.flash('msg','Failed to delete the task')
        res.redirect('/')
    }
    else{
        //kalok yang dihapus ada
        await completedModel.deleteOne({'_id' : req.body.todo_id})
        req.flash('msg','To do task is suscessfully deleted')
        res.redirect('/')
    }
})

app.get('/status/:id',async (req,res) => {
    var currentdate = new Date(); 
    const date = currentdate.getDate() + "/"
    + (currentdate.getMonth()+1)  + "/" 
    + currentdate.getFullYear()
    const time = currentdate.getHours() + ":"  
    + currentdate.getMinutes() + ":" 
    + currentdate.getSeconds();  
    
    const task = await toDoModel.findById(req.params.id)
    if(task){
        task.updated_at = date + "@" + time
        
        await completedModel.insertMany(task)
        await toDoModel.deleteOne({'_id' : req.params.id})
        res.redirect('/')
    }
    else{
        const successfullTask = await completedModel.findById(req.params.id)
        if(successfullTask){
            successfullTask.updated_at = date + "@" + time
            await toDoModel.insertMany(successfullTask)
            await completedModel.deleteOne({'_id' : req.params.id})
            res.redirect('/completed')
        }
    }
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


app.get('/:sort',isAuthenticated, async (req,res) => {
    if(req.params.sort == "due_date"){
        const list = await toDoModel.find({'user_id' : req.session.user_id}).sort({due_date : 1})  
        res.render('home',{
            layout : 'layouts/main-layout',
            title : 'Home Page',
            list : list,
            msg: req.flash('msg')
        })
    }
    else if(req.params.sort == "priority_level"){
        const list = await toDoModel.find({'user_id' : req.session.user_id}).sort({priority_level: -1})  
        res.render('home',{
            layout : 'layouts/main-layout',
            title : 'Home Page',
            list : list,
            msg: req.flash('msg')
        })
    }

})

app.get('/',isAuthenticated, async (req,res) => {
    const list = await toDoModel.find({'user_id' : req.session.user_id})
    console.log()
    res.render('home',{
        layout : 'layouts/main-layout',
        title : 'Home Page',
        list : list,
        msg: req.flash('msg')
    })
})

app.listen(PORT,() => {
    console.log(`listening on PORT ${PORT}`)
})