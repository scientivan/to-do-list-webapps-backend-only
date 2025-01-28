const express = require('express')
const router = express.Router()
const loggedIn = require('../controllers/loggedInController')
const checkAuth = require('../middleware/checkAuth')

router.use(checkAuth.isAuthenticated)

router.get('/', loggedIn.mainpage)
router.get('/add', loggedIn.add)
router.get('/edit/:id', loggedIn.edit) 
router.put('/edit', loggedIn.editData)
router.get('/completed',loggedIn.completed)
router.get('/completed/:sort',loggedIn.completedSort)
router.get('/status/:id', loggedIn.statusById) 
router.post('/add', loggedIn.addData)
router.get('/:sort', loggedIn.sort)

router.delete('/delete', loggedIn.deleteData)
router.delete('/completed/delete', loggedIn.deleteCompletedData)

module.exports = router