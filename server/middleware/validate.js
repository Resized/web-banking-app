const { validationResult } = require("express-validator");

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
        let error = {};
        errors.array().map((err) => {
            error.status = 400;
            error.error = "VALIDATION_ERROR";
            error.message = err.msg;
        });
        return res.status(422).json(error);
    }
    next();
};
