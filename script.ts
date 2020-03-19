import { Http2SecureServer } from "http2";

let darkSkyKey: string = '<your darkSky key>';
let mapBoxKey: string = '<you mapBox key>';

const readline = require('readline');
const https = require('https');

async function showForecast(requestedPlace: any): Promise<any> {
    let places: any | undefined;
    try {
        places = await findPlace(requestedPlace);
    }
    catch (er) { return er; }
    if (!places) return undefined;
    if (places.features.count == 0) return "Wrong input";
    let placesDataArray: any = places.features.map(s => {
        return {
            latitude: s.geometry.coordinates[0],
            longitude: s.geometry.coordinates[1],
            placeName: s.place_name,
        }
    });
    return Promise.all(placesDataArray.map(s => requireForecast(s.latitude, s.longitude)
        .then(e => displayForecast(e, s.placeName))
        .catch(er => er)));

    function findPlace(place: string): Promise<any> {
        let url: URL | string = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?access_token=${mapBoxKey}`);
        return new Promise<any>(function (resolve, reject) {
            https.get(url, (response: any) => {
                let body = "";
                if (response.statusCode != 200) reject(`Request for MapBox was rejected with code: ${response.statusCode}, ${place}`);
                response.on("data", data => { body += data; });
                response.on("end", () => {
                    resolve(JSON.parse(body));
                });
            });
        });
    }
    function requireForecast(latitude: number, longitude: number): Promise<any> {
        let url: URL | string = new URL(`https://api.darksky.net/forecast/${darkSkyKey}/${latitude},${longitude}`);
        return new Promise<any>(function (resolve, reject) {
            https.get(url, response => {
                let body: string = "";
                if (response.statusCode != 200) reject(`Request for DarkSky was rejected with code: ${response.statusCode} [x: ${latitude}, y: ${longitude}];`);
                response.on("data", data => { body += data; });
                response.on("end", () => {
                    resolve(JSON.parse(body));
                });
            });
        });
    }
    function displayForecast(forecast: any, place_name: string): string[] {
        /*
            Grodno, 32695 Juárez, Chihuahua, Mexico
            Mon Jan 19 1970 11:10:23 GMT+0300 (GMT+03:00)
            ┌───────────[geo data]──────────┬───────[forecast]────────┐
            │ latitude: 37.8267             │ Mostly Cloudy           │
            │ longitude: -122.4233          │ wind speed: 7.07 (9.82) │
            │ timezone: America/Los_Angeles │ temperature: 10         │
            └───────────────────────────────┴─────────────────────────┘
        */
        let geoDataHeader: string = "[geo data]",
            forecastHeader: string = "[forecast]",
            dataTable: any = [
                [
                    ` latitude: ${forecast.latitude} `,
                    ` longitude: ${forecast.longitude} `,
                    ` timezone: ${forecast.timezone} `,
                ],
                [
                    ` ${forecast.currently.summary} `,
                    ` wind speed: ${forecast.currently.windSpeed} (${forecast.currently.windGust}) `,
                    ` temperature: ${forecast.currently.temperature} °F`,
                ],
            ];
        let columnWidth: number[] = tableLengths(dataTable).map(s => findMaxLength(s));
        geoDataHeader = fillWithHyphens(geoDataHeader, columnWidth[0]);
        forecastHeader = fillWithHyphens(forecastHeader, columnWidth[1]);
        for (let i = 0; i < dataTable.length; i++)
            dataTable[i] = alignWithSpaces(dataTable[i], columnWidth[i]);
        return [
            String(new Date(forecast.currently.time)),
            place_name,
            "┌" + geoDataHeader + "┬" + forecastHeader + "┐",
            "│" + dataTable[0][0] + "│" + dataTable[1][0] + "│",
            "│" + dataTable[0][1] + "│" + dataTable[1][1] + "│",
            "│" + dataTable[0][2] + "│" + dataTable[1][2] + "│",
            "└" + insertHyphens(columnWidth[0]) + "┴" + insertHyphens(columnWidth[1]) + "┘",
        ]
        function addSpaces(str: string, c: number): string {
            return new Array(c - str.length + 1).join(' ');
        }
        function alignWithSpaces(strTable: any, c: number): any {
            return strTable.map(s => Array.isArray(s) ? alignWithSpaces(s, c) : s + addSpaces(String(s), c));
        }
        function insertHyphens(c: number): string {
            return new Array(c + 1).join("─");
        }
        function fillWithHyphens(str: string, c: number): string {
            if ((c - str.length) % 2 != 0) str += "─";
            return insertHyphens((c - str.length) / 2) + str + insertHyphens((c - str.length) / 2);
        }
        function findMaxLength(arr: number[]): number {
            return Math.max(...arr);
        }
        function tableLengths(strTable: any): any {
            return strTable.map(s => Array.isArray(s) ? tableLengths(s) : String(s).length);
        }
    }
}
async function main(): Promise<void> {

    let input: string = await userInput();
    let answer: any = await showForecast(input);
    console.log(answer);
}
function userInput(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(function (resolve, reject) {
        rl.question("Input: ", (answer: string) => {
            resolve(answer);
            rl.close();
        });
    });
}

main();