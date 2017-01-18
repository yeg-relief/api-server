"use strict";
var key_1 = require("../key");
var ProgramCondition = (function () {
    function ProgramCondition(condition) {
        this.key.name = condition.key.name;
        this.key.type = condition.key.type;
    }
    ProgramCondition.isProgramCondition = function (condition) {
        return key_1.Key.isKey(condition.key);
    };
    return ProgramCondition;
}());
exports.ProgramCondition = ProgramCondition;
