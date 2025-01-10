const express = require('express')
const router = express.Router()
const loggedIn = require('../controllers/loggedInController')
const checkAuth = require('../middleware/checkAuth')

router.get('/',checkAuth.isAuthenticated, loggedIn.mainpage)
router.get('/:sort',checkAuth.isAuthenticated, loggedIn.sort)
router.get('/add',checkAuth.isAuthenticated, loggedIn.add)
router.post('/add',checkAuth.isAuthenticated, loggedIn.addData)
router.get('/edit',checkAuth.isAuthenticated, loggedIn.edit) 
router.put('/edit/:title',checkAuth.isAuthenticated, loggedIn.editData)
router.delete('/delete',checkAuth.isAuthenticated, loggedIn.deleteData)
router.delete('/completed/delete',checkAuth.isAuthenticated, loggedIn.deleteCompletedData)
router.get('/status/:id',checkAuth.isAuthenticated, loggedIn.statusById) 

module.exports = router