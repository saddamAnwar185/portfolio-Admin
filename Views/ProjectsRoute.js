const express = require('express')
const router = express.Router()
const { VerifyUserAuth } = require('../Middlewares/Auth')
const { handleAddProject, handleDeleteProject, handleEditProject, handleShowProjects } = require('../Controllers/controller')

router.get('/showProjects', handleShowProjects)
router.post('/addProject', VerifyUserAuth, handleAddProject)
router.delete('/deleteProject/:id', VerifyUserAuth, handleDeleteProject)
router.post('/editProject/:id', VerifyUserAuth, handleEditProject)


module.exports = router