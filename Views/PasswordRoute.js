const express = require('express')
const router = express.Router()
const { verifyPassword, addPassword, handleIsVerify } = require('../Controllers/controller')
const { VerifyUserAuth } = require('../Middlewares/Auth')

router.post('/signup', addPassword)
router.post('/login', verifyPassword)
router.get('/isVerify', VerifyUserAuth ,handleIsVerify)


module.exports = router