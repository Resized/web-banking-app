const express = require('express');
const router = express.Router();

const authController = require("../controllers/authController");
const transactionController = require("../controllers/transactionController");
const { checkCache } = require('../middleware/redis');

router.post('/', authController.checkAuth, transactionController.makeTransaction);
router.get('/', authController.checkAuth, checkCache, transactionController.viewTransactions);
// router.ws('/events', transactionController.notifyTransaction);

module.exports = router;
