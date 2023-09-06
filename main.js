"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var promises_1 = require("fs/promises");
var node_fetch_1 = require("node-fetch");
var FormData = require("form-data");
var node_record_lpcm16_1 = require("node-record-lpcm16");
var record_1 = require("./record"); // ここでmainをインポート
function genConversation(input) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, node_fetch_1.default)("/api/generate", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ user: input }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [4 /*yield*/, generateVoice(data.result.content)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function generateVoice(userText) {
    return __awaiter(this, void 0, void 0, function () {
        var response, buffer, audioFilePath, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://deprecatedapis.tts.quest/v2/voicevox/audio/?text=".concat(userText, "&key=").concat(process.env.VOICE_KEY, "&speaker=1"))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.buffer()];
                case 2:
                    buffer = _a.sent();
                    audioFilePath = "/tmp/audio_output.wav";
                    return [4 /*yield*/, (0, promises_1.writeFile)(audioFilePath, buffer)];
                case 3:
                    _a.sent();
                    (0, child_process_1.exec)("aplay ".concat(audioFilePath), function (error) {
                        if (error) {
                            console.log("Error playing audio: ".concat(error));
                        }
                    });
                    return [3 /*break*/, 5];
                case 4:
                    e_2 = _a.sent();
                    console.log(e_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
var startRecording = function () {
    var audioChunks = [];
    var formData = new FormData();
    var endPoint = "https://api.openai.com/v1/audio/transcriptions";
    formData.append("model", "whisper-1");
    formData.append("language", "ja");
    var audioStream = node_record_lpcm16_1.default.record({
        sampleRate: 44100,
        threshold: 0.5
    });
    audioStream.on('data', function (data) {
        audioChunks.push(data);
    });
    audioStream.on('end', function () { return __awaiter(void 0, void 0, void 0, function () {
        var audioBlob, response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    audioBlob = Buffer.concat(audioChunks);
                    formData.append('file', audioBlob, 'audio.webm');
                    return [4 /*yield*/, (0, node_fetch_1.default)(endPoint, {
                            method: "POST",
                            headers: {
                                Authorization: "Bearer ".concat(process.env.NEXT_PUBLIC_NOT_INIAD_KEY),
                            },
                            body: formData,
                        })];
                case 1:
                    response = _a.sent();
                    // ここでmain関数（録音関連の処理）を呼び出す
                    return [4 /*yield*/, (0, record_1.main)()];
                case 2:
                    // ここでmain関数（録音関連の処理）を呼び出す
                    _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    return [4 /*yield*/, genConversation(data.text)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
};
// 3秒ごとにstartRecording関数を呼び出す
try {
    startRecording();
}
catch (e) {
    console.error("Error in startRecording:", e);
}
console.log("Started 3-second interval for startRecording.");
