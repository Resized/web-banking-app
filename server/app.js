const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

const authRouter = require('./routes/auth');
const balanceRouter = require('./routes/balance');
const transactionRouter = require('./routes/transaction');
const { URI } = require('./config');

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:5173',
  ]
};

app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/dist')));

const dbURI = 'mongodb://mongo:27017/WebBankingApp?replicaSet=rs0';

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
mongoose.connect(URI, clientOptions)
  .then(() => {
    console.log('Successfully connected to MongoDB');
  }).catch(err => {
    console.error('Connection error', err);
    console.error('Connection error details:', err.reason);
    process.exit(1);
  });

app.use('/api/auth', authRouter);
app.use('/api/balance', balanceRouter);
app.use('/api/transactions', transactionRouter);

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

module.exports = app;
