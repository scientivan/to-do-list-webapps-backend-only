require('dotenv').config();
const express = require('express')
const checkAuth = require('../middleware/checkAuth')
const { body, check, validationResult } = require('express-validator');
const auth = require('../controllers/auth')
const bcrypt = require('bcrypt')
const { userModel } = require('../models/dbModel')
const passport = require('passport')
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const flash = require('connect-flash');

const router = express.Router()


router.use(flash());
//route ke register
router.get('/register', auth.registerPage)

//proses ngemasukkin data yang diisi ke database
router.post('/register', [check('email', "Email tidak valid!").isEmail(), body('email').custom(async (value) => {
    const duplicate = await userModel.findOne({ 'email': value })
    if (duplicate) {
        throw new Error('Email sudah terdaftar!')
    }
    return true

})], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('register', {
            title: 'Register Page',
            layout: 'layouts/main-layout',
            errors: errors.array()
        })
    }
    else {
        const hash = await bcrypt.hash(req.body.password, 13)
        req.body.password = hash

        await userModel.insertMany(req.body)
        const newUser = await userModel.findOne({ email: req.body.email })
        // console.log(newUser)

        req.session.user_id = newUser._id
        req.flash('msg', 'Berhasil membuat akun ') // berhasil
        res.redirect('/')
    }
})

// register with google account
passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
        passReqToCallback: true, // Mengaktifkan akses ke req
    },
    async function (req, accessToken, refreshToken, profile, done) {
        try {
            // Cari pengguna berdasarkan google_id
            const user = await userModel.findOne({ 'google_id': profile.id });
            if (user) {
                // untuk ngasih tau kalok autentikasinya gagal
                return done(null, user, {
                    message : "hai test"
                })
            } else {
                // Membuat pengguna baru
                const currentdate = new Date();
                const date =
                    currentdate.getDate() +
                    '/' +
                    (currentdate.getMonth() + 1) +
                    '/' +
                    currentdate.getFullYear();
                const time =
                    currentdate.getHours() +
                    ':' +
                    currentdate.getMinutes() +
                    ':' +
                    currentdate.getSeconds();

                const userData = {
                    google_id: profile.id,
                    nama: profile.displayName,
                    email: profile.emails[0].value,
                    created_at: date + '@' + time,
                };
                await userModel.insertMany(userData);
                //callback ini akan ditangkap oleh router.get('/google/callback',
                // sebagai catatan, req dan res yang dipakai 
                return done(null, profile); // Berikan user baru ke callback
            }
        } catch (err) {
            return done(err); // Tangani error dengan callback
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }))

router.get('/google/callback',
    passport.authenticate('google'),
    async (req, res) => {
        if(req.user.email){
            req.session.user_id = req.user._id
            req.flash('msg', 'Berhasil masuk ke akun ') // berhasil
            res.redirect('/')
        }
        else{
            if(req.user.emails[0].value){
                const newUser = await userModel.findOne({email : req.user.emails[0].value})
                if(newUser){
                    req.session.user_id = newUser._id
                    req.flash('msg', 'Berhasil membuat akun ') // berhasil
                    res.redirect('/')
                }
            }
            else{
                res.redirect('failure-login-register')
            }
        }
        
}),


router.get('/failure-login-register', (req, res) => {
    res.send('Something went wrong...')    
})

//ngedirect ke halaman login
router.get('/login', auth.loginPage)
//proses ngecocokin data yang ada di database untuk login
router.post('/login', async (req, res) => {
    // check ke database
    const userAccount = await userModel.findOne({ 'email': req.body.email })
    if (!userAccount) {
        res.render('login', {
            layout: 'layouts/main-layout',
            title: 'Register Page',
            msg: 'Akun tidak ditemukan, silakan coba lagi'
        })
    }
    else {
        const isValid = await bcrypt.compare(req.body.password, userAccount.password)
        if (!isValid) {
            req.flash('msg', 'Wrong password')
            res.redirect('/login')
        }
        else {
            req.session.user_id = userAccount._id
            req.flash("msg", 'Berhasil masuk ke akun') // berhasil
            res.redirect('/')
        }
    }
})

router.get('/logout', checkAuth.isAuthenticated, (req, res) => {
    req.session.user_id = undefined
    res.locals.isAuthenticated = req.session.user_id
    res.redirect('/login')
})


module.exports = router