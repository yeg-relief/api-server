"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Guid = (function () {
    function Guid() {
    }
    Guid.generateGuid = function (guid) {
        if (Guid.isGuid(guid) && guid !== 'new') {
            return guid;
        }
        else if (guid === 'new') {
            return guid.v4();
        }
        else {
            throw new InvalidGuid(guid);
        }
    };
    Guid.isGuid = function (guid) {
        return typeof guid === 'string';
    };
    return Guid;
}());
exports.Guid = Guid;
var InvalidGuid = (function (_super) {
    __extends(InvalidGuid, _super);
    function InvalidGuid(message) {
        var _this = _super.call(this) || this;
        _this.name = 'InvalidGuid';
        _this.message = message;
        _this.stack = new Error().stack;
        return _this;
    }
    InvalidGuid.prototype.toString = function () {
        return this.name + ': ' + this.message;
    };
    return InvalidGuid;
}(Error));
exports.InvalidGuid = InvalidGuid;
