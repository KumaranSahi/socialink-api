const express=require('express')
const router=express.Router();
const passport=require('passport')

//middlewares

//controller

const userController=require('../controllers/user.controller')

//User routes

router.post('/users/signin',userController.signinUser)
router.post('/users/signup',userController.signupUser)
router.post('/users/password',userController.changePassword)

module.exports=router;