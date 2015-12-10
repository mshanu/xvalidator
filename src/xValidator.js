var customValidators = require("helper/customValidators"),
    langUtil = require("helper/langUtil"),
    _ = require("lodash");

var Validator = function () {
    this.validationsResults = {};
    this.isInValid = true;
    this._customValidations = {};
    this.requiredValidations = {};
};


Validator.prototype.validate = function (identifier, input) {
    if (!this.validationsResults[identifier].isDirty && !langUtil.isEmpty(input)) {
        this.validationsResults[identifier].isDirty = true;
    }
    this.validationsResults[identifier].result = this.validationsResults[identifier].result || {};
    var requiredValidations = this.requiredValidations[identifier];
    _.each(requiredValidations, function (eachValidationFnt) {
        var validationFn = customValidators[eachValidationFnt] || this._customValidations[eachValidationFnt];
        if (validationFn) {
            this.validationsResults[identifier].result[eachValidationFnt] = validationFn(input);
        } else {
            console.warn("No validation function registered with " + eachValidationFnt);
        }
    }.bind(this));

    this.validationsResults[identifier].isInValid = !_.reduce(_.values(this.validationsResults[identifier].result), function (result, eachResult) {
        return result && eachResult;
    }.bind(this), true);

    this.validationsResults[identifier].isDirtyAndInvalid = this.validationsResults[identifier].isDirty && this.validationsResults[identifier].isInValid;

    this.isInValid = !_.reduce(_.pluck(_.values(this.validationsResults), "isInValid"), function (result, eachInvalidResult) {
        return result && !eachInvalidResult;
    }, true);

    return this.validationsResults[identifier];

};

Validator.prototype.register = function (ftnName, fntn) {
    this._customValidations[ftnName] = fntn;
};

Validator.prototype.add = function () {
    var identifier = arguments[0], validations = _.slice(arguments, 1);
    this.validationsResults[identifier] = {isDirty: false, isDirtyAndInvalid: false};
    this.requiredValidations[identifier] = validations;
};

Validator.prototype.isDirtyAndInvalidFor = function (identifier, input, fntn) {
    if (this.validationsResults[identifier] && this.validationsResults[identifier].isDirty) {
        return this.validationsResults[identifier].result[fntn] ? !this.validationsResults[identifier].result[fntn] : this.validate(identifier, input, fntn).isDirtyAndInvalid;
    }
    return false;
};

module.exports = Validator;