"use strict";
var Key = (function () {
    function Key() {
    }
    Key.isKey = function (key) {
        return /'[a-z]+_?[a-z]+?'/.test(key.name) && (key.type === 'number' || key.type === 'boolean');
    };
    return Key;
}());
exports.Key = Key;
