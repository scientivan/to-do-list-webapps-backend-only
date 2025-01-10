exports.registerPage = (req,res) =>{
    res.render('register', {
        title : 'Register Page',
        layout: 'layouts/main-layout', 
    })
}

exports.loginPage = (req,res) =>{
    res.render('login', {
        layout: 'layouts/main-layout',
        title : 'Login Page',
        msg : req.flash('msg')
    })
}
