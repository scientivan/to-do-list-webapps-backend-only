const express = require('express')
const router = express.Router()
const loggedIn = require('../controllers/loggedInController')
const checkAuth = require('../middleware/checkAuth')

router.get('/',checkAuth.isAuthenticated, loggedIn.mainpage)
router.get('/add',checkAuth.isAuthenticated, loggedIn.add)
router.get('/edit/:id',checkAuth.isAuthenticated, loggedIn.edit) 
router.put('/edit',checkAuth.isAuthenticated, loggedIn.editData)
router.get('/completed',checkAuth.isAuthenticated,loggedIn.completed)
router.get('/completed/:sort',checkAuth.isAuthenticated,loggedIn.completedSort)
router.get('/status/:id',checkAuth.isAuthenticated, loggedIn.statusById) 
router.post('/add',checkAuth.isAuthenticated, loggedIn.addData)
router.get('/:sort',checkAuth.isAuthenticated, loggedIn.sort)

router.delete('/delete',checkAuth.isAuthenticated, loggedIn.deleteData)
router.delete('/completed/delete',checkAuth.isAuthenticated, loggedIn.deleteCompletedData)

module.exports = router