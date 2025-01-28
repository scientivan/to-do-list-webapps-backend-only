const express = require('express')
const router = express.Router()
const loggedIn = require('../controllers/loggedInController')
const checkAuth = require('../middleware/checkAuth')

router.use(checkAuth.isAuthenticated)

const routes = [
    { method: 'get', path: '/', action: loggedIn.mainpage },
    { method: 'get', path: '/add', action: loggedIn.add },
    { method: 'get', path: '/edit/:id', action: loggedIn.edit },
    { method: 'put', path: '/edit', action: loggedIn.editData },
    { method: 'get', path: '/completed', action: loggedIn.completed },
    { method: 'get', path: '/completed/:sort', action: loggedIn.completedSort },
    { method: 'get', path: '/status/:id', action: loggedIn.statusById },
    { method: 'post', path: '/add', action: loggedIn.addData },
    { method: 'get', path: '/:sort', action: loggedIn.sort },
    { method: 'delete', path: '/delete', action: loggedIn.deleteData },
    { method: 'delete', path: '/completed/delete', action: loggedIn.deleteCompletedData }
  ]
  
  routes.forEach(route => {
    router[route.method](route.path, route.action)
  })

module.exports = router