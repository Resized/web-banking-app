const { EMAIL_PASSWORD, EMAIL_USERNAME } = require("../config");
const nodemailer = require('nodemailer');

const secure_configuration = {
    EMAIL_USERNAME: EMAIL_USERNAME,
    PASSWORD: EMAIL_PASSWORD,
    HOST: 'smtp.gmail.com',
    PORT: 587 // Or 465 for SSL
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: secure_configuration.EMAIL_USERNAME,
        pass: secure_configuration.PASSWORD
    }
});

const getConfirmEmailTemplate = (confirmationCode) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Inline styles */
        body {
            font-family: Arial, sans-serif;
        }
        .container {
            padding: 20px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 10px;
            max-width: 512px;
            margin: auto;
        }
        .header {
            text-align: center;
            background-color: #4CAF50;
            color: white;
            padding: 10px 0;
            border-radius: 10px 10px 0 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Email Verification</h1>
        </div>
        <div class="content">
            <p>Hi there, you have recently entered your email on our website.</p>
            <p>Please enter the following confirmation code:</p>
            <h1>${confirmationCode}</h1>
            <p>Thanks.</p>
        </div>
    </div>
</body>
</html>
`;

const getResetEmailTemplate = (resetPasswordCode) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Inline styles */
        body {
            font-family: Arial, sans-serif;
        }
        .container {
            padding: 20px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 10px;
            max-width: 512px;
            margin: auto;
        }
        .header {
            text-align: center;
            background-color: #4CAF50;
            color: white;
            padding: 10px 0;
            border-radius: 10px 10px 0 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reset Password</h1>
        </div>
        <div class="content">
            <p>Hi there, a request has been made to reset your password.</p>
            <p>If you made this request, please enter the following code in the website:</p>
            <h1>${resetPasswordCode}</h1>
            <p>Thanks.</p>
        </div>
    </div>
</body>
</html>
`;

module.exports = { secure_configuration, transporter, getConfirmEmailTemplate, getResetEmailTemplate };