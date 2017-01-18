"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var program_condition_1 = require("./program-condition");
var BooleanCondition = (function (_super) {
    __extends(BooleanCondition, _super);
    function BooleanCondition(condition) {
        var _this = _super.call(this, condition) || this;
        _this.value = condition.value;
        return _this;
    }
    BooleanCondition.isBooleanCondition = function (condition) {
        return program_condition_1.ProgramCondition.isProgramCondition(condition) && typeof condition.value === 'boolean';
    };
    return BooleanCondition;
}(program_condition_1.ProgramCondition));
exports.BooleanCondition = BooleanCondition;
