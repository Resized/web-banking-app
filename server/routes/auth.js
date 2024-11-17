const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require("../controllers/authController");
const { validate } = require('../middleware/validate');

router.post('/login',
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail({ gmail_remove_dots: false }),
    check("password")
        .not()
        .isEmpty()
        .withMessage("Password cannot be empty"),
    validate,
    authController.login);

router.post('/register',
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail({ gmail_remove_dots: false }),
    check("password")
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    validate,
    authController.register
);

router.post('/verify-email',
    check("email")
        .isEmail()
        .withMessage("Email is missing")
        .normalizeEmail({ gmail_remove_dots: false }),
    validate,
    authController.verifyEmail);

router.get('/refresh-token', authController.refreshToken);

router.post('/reset-password',
    check('email')
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail({ gmail_remove_dots: false }),
    validate,
    authController.requestPasswordReset);

router.patch('/reset-password/confirm',
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail({ gmail_remove_dots: false }),
    check("token")
        .notEmpty()
        .withMessage("Token is required"),
    check("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    validate,
    authController.confirmPasswordReset
);

router.delete('/logout', authController.logout);

module.exports = router;