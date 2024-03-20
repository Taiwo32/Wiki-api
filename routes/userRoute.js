const express = require ('express');
const userController = require('./../controller/userController');
const authController = require('../controller/authController')


const router = express.Router();
router.post('/signup',authController.signup);
router.post('/login', authController.login);
router.post("/forgetPassword", authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect)

router.patch(
    "/updateMyPassword",
    authController.updatePassword
);

router .patch("/updateMe", userController.updateMe);

router.use(authController.restrictTo('admin'));

router.route('/user').get(userController.getAllUsers)       
.post(userController.createUser)
router
.route('/user/:id')
.patch(userController.updateUser)
.delete(userController.deleteOneUser)

module.exports = router