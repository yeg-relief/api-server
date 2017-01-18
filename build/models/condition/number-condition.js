"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var program_condition_1 = require("./program-condition");
var NumberCondition = (function (_super) {
    __extends(NumberCondition, _super);
    function NumberCondition(condition) {
        var _this = _super.call(this, condition) || this;
        _this.value = condition.value;
        return _this;
    }
    NumberCondition.validateQualifier = function (qualifier) {
        var validQualifiers = ['lessThan', 'lessThanOrEqual', 'equal', 'greaterThanOrEqual', 'greaterThan'];
        var isString = typeof qualifier === 'string';
        var validQualifier = false;
        validQualifiers.forEach(function (q) {
            if (q === qualifier) {
                validQualifier = true;
            }
        });
        return isString && validQualifier;
    };
    NumberCondition.isNumberCondition = function (condition) {
        return program_condition_1.ProgramCondition.isProgramCondition(condition)
            && typeof condition.value === 'number'
            && NumberCondition.validateQualifier(condition.qualifier);
    };
    return NumberCondition;
}(program_condition_1.ProgramCondition));
exports.NumberCondition = NumberCondition;
