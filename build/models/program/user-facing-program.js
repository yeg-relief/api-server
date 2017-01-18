"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var program_1 = require("./program");
var UserProgram = (function (_super) {
    __extends(UserProgram, _super);
    // this constructor is only called from ApplicationProgram... is there a better structure?
    function UserProgram(program) {
        var _this = _super.call(this, program) || this;
        _this.title = program.title;
        _this.details = program.details;
        _this.externalLink = program.externalLink;
        _this.tags = program.tags.slice();
        return _this;
    }
    UserProgram.isUserFacingProgram = function (program) {
        var title = program.title;
        var details = program.details;
        return typeof title === 'string' && typeof details === 'string';
    };
    return UserProgram;
}(program_1.Program));
exports.UserProgram = UserProgram;
var InvalidUserProgram = (function (_super) {
    __extends(InvalidUserProgram, _super);
    function InvalidUserProgram(message) {
        var _this = _super.call(this) || this;
        _this.name = 'InvalidUserProgram';
        _this.message = message;
        _this.stack = new Error().stack;
        return _this;
    }
    InvalidUserProgram.prototype.toString = function () {
        return this.name + ': ' + this.message;
    };
    return InvalidUserProgram;
}(Error));
exports.InvalidUserProgram = InvalidUserProgram;
