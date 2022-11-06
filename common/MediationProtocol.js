"use strict";
exports.__esModule = true;
exports.MediationProtocol = void 0;
var MediationProtocol = /** @class */ (function () {
    function MediationProtocol(stream) {
        var _this = this;
        this.stream = stream;
        this.listeners = new Map();
        stream.on('get_peers', function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = _this.listeners.get('get_peers')) === null || _a === void 0 ? void 0 : _a.forEach(function (callback) { return callback.apply(void 0, args); });
        });
        stream.on('peers', function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = _this.listeners.get('peers')) === null || _a === void 0 ? void 0 : _a.forEach(function (callback) { return callback.apply(void 0, args); });
        });
        stream.on('signal', function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = _this.listeners.get('signal')) === null || _a === void 0 ? void 0 : _a.forEach(function (callback) { return callback.apply(void 0, args); });
        });
        stream.on('announce', function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = _this.listeners.get('announce')) === null || _a === void 0 ? void 0 : _a.forEach(function (callback) { return callback.apply(void 0, args); });
        });
        stream.on('finish', function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = _this.listeners.get('finish')) === null || _a === void 0 ? void 0 : _a.forEach(function (callback) { return callback.apply(void 0, args); });
        });
    }
    MediationProtocol.prototype.on = function (event, callback) {
        var _a;
        if (!this.listeners.get(event)) {
            this.listeners.set(event, []);
        }
        (_a = this.listeners.get(event)) === null || _a === void 0 ? void 0 : _a.push(callback);
    };
    MediationProtocol.prototype.get_peers = function (fullHash) {
        this.stream.emit('get_peers', fullHash);
    };
    MediationProtocol.prototype.peers = function (fullHash, peerList) {
        this.stream.emit('peers', fullHash, peerList);
    };
    MediationProtocol.prototype.signal = function (full_hash, senderPeerId, receiverPeerId, signalData) {
        this.stream.emit('signal', full_hash, senderPeerId, receiverPeerId, signalData);
    };
    MediationProtocol.prototype.announce = function (seederPeerId, fullHash) {
        this.stream.emit('announce', seederPeerId, fullHash);
    };
    MediationProtocol.prototype.finish = function (seederPeerId, fullHash) {
        this.stream.emit('finish', seederPeerId, fullHash);
    };
    return MediationProtocol;
}());
exports.MediationProtocol = MediationProtocol;
