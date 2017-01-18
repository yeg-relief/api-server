"use strict";
var guid_1 = require("../guid");
var Program = (function () {
    function Program(program) {
        this.guid = guid_1.Guid.generateGuid(program.guid);
        this.created = (new Date).getTime();
    }
    Program.isProgram = function (program) {
        return guid_1.Guid.isGuid(program.guid) && typeof program.created === 'number' && program.created > 0;
    };
    return Program;
}());
exports.Program = Program;
