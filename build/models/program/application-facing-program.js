"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var user_facing_program_1 = require("./user-facing-program");
var program_1 = require("./program");
var ApplicationProgram = (function (_super) {
    __extends(ApplicationProgram, _super);
    function ApplicationProgram(program) {
        return _super.call(this, program) || this;
    }
    ApplicationProgram.isApplicationFacingProgram = function (program) {
        var user = {
            guid: program.guid,
            title: program.title,
            details: program.details,
            externalLink: program.externalLink,
            created: program.created,
            tags: program.tags.slice()
        };
        var application = Object.assign({}, user, {
            queries: program.queries.slice()
        });
        var guid = program.guid;
        return user_facing_program_1.UserProgram.isUserFacingProgram(user) && program_1.Program.isProgram(program);
    };
    return ApplicationProgram;
}(user_facing_program_1.UserProgram));
exports.ApplicationProgram = ApplicationProgram;
