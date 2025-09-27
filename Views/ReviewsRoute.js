const express = require('express')
const router = express.Router()
const { VerifyUserAuth } = require('../Middlewares/Auth')
const { handleShowReviews, handlePostReview, handleDeleteReview } = require('../Controllers/controller')

router.get('/showReviews', handleShowReviews)
router.post('/addReview', VerifyUserAuth , handlePostReview)
router.delete('/deleteReview/:id', VerifyUserAuth, handleDeleteReview)


module.exports = router