const express = require ('express');
const wikiController = require ('./../controller/wikiController');
const authController = require('../controller/authController')

const router = express.Router()

router.route('/article')
.get(authController.protect, authController.restrictTo("user"), wikiController.getAllArticles)
.post(authController.protect, wikiController.createArticle, authController.restrictTo("author"))
router
.route('/article/:id')
.patch(
    authController.protect,
    authController.restrictTo("author","admin"),  // only the author and admin can update or edit the article
    wikiController.updateArticle)
.delete(
    authController.protect,
    authController.restrictTo("author", "admin"),
    wikiController.deleteArticle
    );

router.route('/article/:title').get(
    authController.protect,
    authController.restrictTo("admin","author"),
    wikiController.getOneArticle);

module.exports = router;