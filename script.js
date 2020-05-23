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
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
var darkSkyKey = '523130e12259d2881cca1291f16e4f6f';
var mapBoxKey = 'pk.eyJ1Ijoic2hhbGVueWkiLCJhIjoiY2s3eHdsbzBsMDBwNzNlcnQ1cW1vc2N4ZyJ9.UAxB_mvsXh4QMioxPdbtMg';
var readline = require('readline');
var https = require('https');
function showForecast(requestedPlace) {
    return __awaiter(this, void 0, void 0, function () {
        function findPlace(place) {
            var url = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + place + ".json?access_token=" + mapBoxKey);
            return new Promise(function (resolve, reject) {
                https.get(url, function (response) {
                    var body = "";
                    if (response.statusCode != 200)
                        reject("Request for MapBox was rejected with code: " + response.statusCode + ", " + place);
                    response.on("data", function (data) { body += data; });
                    response.on("end", function () {
                        resolve(JSON.parse(body));
                    });
                });
            });
        }
        function requireForecast(latitude, longitude) {
            var url = new URL("https://api.darksky.net/forecast/" + darkSkyKey + "/" + latitude + "," + longitude);
            return new Promise(function (resolve, reject) {
                https.get(url, function (response) {
                    var body = "";
                    if (response.statusCode != 200)
                        reject("Request for DarkSky was rejected with code: " + response.statusCode + " [x: " + latitude + ", y: " + longitude + "];");
                    response.on("data", function (data) { body += data; });
                    response.on("end", function () {
                        resolve(JSON.parse(body));
                    });
                });
            });
        }
        function displayForecast(forecast, place_name) {
            /*
                Grodno, 32695 Juárez, Chihuahua, Mexico
                Mon Jan 19 1970 11:10:23 GMT+0300 (GMT+03:00)
                ┌───────────[geo data]──────────┬───────[forecast]────────┐
                │ latitude: 37.8267             │ Mostly Cloudy           │
                │ longitude: -122.4233          │ wind speed: 7.07 (9.82) │
                │ timezone: America/Los_Angeles │ temperature: 10         │
                └───────────────────────────────┴─────────────────────────┘
            */
            var geoDataHeader = "[geo data]", forecastHeader = "[forecast]", dataTable = [
                [
                    " latitude: " + forecast.latitude + " ",
                    " longitude: " + forecast.longitude + " ",
                    " timezone: " + forecast.timezone + " ",
                ],
                [
                    " " + forecast.currently.summary + " ",
                    " wind speed: " + forecast.currently.windSpeed + " (" + forecast.currently.windGust + ") ",
                    " temperature: " + forecast.currently.temperature + " \u00B0F",
                ],
            ];
            var columnWidth = tableLengths(dataTable).map(function (s) { return findMaxLength(s); });
            geoDataHeader = fillWithHyphens(geoDataHeader, columnWidth[0]);
            forecastHeader = fillWithHyphens(forecastHeader, columnWidth[1]);
            for (var i = 0; i < dataTable.length; i++)
                dataTable[i] = alignWithSpaces(dataTable[i], columnWidth[i]);
            return [
                String(new Date(forecast.currently.time)),
                place_name,
                "┌" + geoDataHeader + "┬" + forecastHeader + "┐",
                "│" + dataTable[0][0] + "│" + dataTable[1][0] + "│",
                "│" + dataTable[0][1] + "│" + dataTable[1][1] + "│",
                "│" + dataTable[0][2] + "│" + dataTable[1][2] + "│",
                "└" + insertHyphens(columnWidth[0]) + "┴" + insertHyphens(columnWidth[1]) + "┘",
            ];

        }
        var places, er_1, placesDataArray;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, findPlace(requestedPlace)];
                case 1:
                    places = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    er_1 = _a.sent();
                    return [2 /*return*/, er_1];
                case 3:
                    if (!places)
                        return [2 /*return*/, undefined];
                    if (places.features.count == 0)
                        return [2 /*return*/, "Wrong input"];
                    placesDataArray = places.features.map(function (s) {
                        return {
                            latitude: s.geometry.coordinates[0],
                            longitude: s.geometry.coordinates[1],
                            placeName: s.place_name
                        };
                    });
                    return [2 /*return*/, Promise.all(placesDataArray.map(function (s) {
                        return requireForecast(s.latitude, s.longitude)
                            .then(function (e) { return displayForecast(e, s.placeName); })["catch"](function (er) { return er; });
                    }))];
            }
        });
    });
}
function userInput() {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(function (resolve, reject) {
        rl.question("Input: ", function (answer) {
            resolve(answer);
            rl.close();
        });
    });
}
// userInput().then(input => showForecast(input).then(output => console.log(output)));
console.log(['bbb\naaa]']);
