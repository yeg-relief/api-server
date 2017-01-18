"use strict";
var key_1 = require("./key");
/*
export interface IProgramCondition {
  key: IKey;
  value: boolean | string | number;
  type: 'boolean' | 'text' | 'number';
  qualifier?: string | 'lessThan' | 'lessThanOrEqual' | 'equal' | 'greaterThanOrEqual' | 'greaterThan';
}

*/
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
