"use strict";
var condition_1 = require("./condition");
var guid_1 = require("./guid");
/*
need to handle id somehow someway
https://github.com/yeg-relief/api-server/blob/55cfabf5eccde671b7774b094fec4ffb7ea8f42c/app/es/percolator/init-percolator.js#L132-L137
*/
var ProgramQuery = (function () {
    function ProgramQuery(query) {
        this.guid = query.guid;
        this.id = query.id;
        this.conditions = query.conditions.slice();
    }
    ProgramQuery.isProgramQuery = function (query) {
        var programQuery = query;
        for (var untestedQuery in programQuery.conditions) {
            if (!condition_1.ProgramCondition.isProgramCondition(untestedQuery)
                && (!condition_1.BooleanCondition.isBooleanCondition(programQuery) || !condition_1.NumberCondition.isNumberCondition(programQuery))) {
                return false;
            }
        }
        return guid_1.Guid.isGuid(programQuery.guid) && typeof programQuery.id === 'string';
    };
    return ProgramQuery;
}());
exports.ProgramQuery = ProgramQuery;
