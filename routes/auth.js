const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/checkAuth')
const { body, check,validationResult } = require('express-validator');
const auth = require('../controllers/auth')
const {userModel,toDoModel,completedModel} = require('../models/dbModel')

//route ke register
router.get('/register', auth.registerPage)

//proses ngemasukkin data yang diisi ke database
router.post('/register',[check('email',"Email tidak valid!").isEmail(),body('email').custom(async (value) => {
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

router.get('/login',auth.loginPage)


//proses ngecocokin data yang ada di database untuk login
router.post('/login',async (req,res)=>{
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

router.get('/logout',checkAuth.isAuthenticated,(req,res) => {
    req.session.user_id = undefined
    res.locals.isAuthenticated = req.session.user_id 
    res.redirect('/login')
})


module.exports = router