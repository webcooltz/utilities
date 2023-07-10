/* csvConverter.js
// - Reads a CSV file
// - Converts it to JSON
// - Writes the JSON to a file
*/
// ---Dependencies---
const fs = require("fs");
// ---Filepaths---
const csvFilePath = "./csv-to-json/results/imdbData.csv";
const jsonFilePath = "./csv-to-json/results/imdbData.json";
// ---Helpers---
const { cleanupData } = require("../../helper-utilities/dataCleaner");
// const { writeOutputData } = require("../../helper-utilities/writeOutputData");
const { writeToLogfile } = require("../../helper-utilities/logger");
// --- Variables---
let isTvEpisodes = false;

const convertCsvToJson = () => {
  // ---Read the CSV file---
  fs.readFile(csvFilePath, "utf-8", (err, fileContent) => {
    if (err) {
      writeToLogfile("Error", `Error reading CSV file:\n-${err}`);
      throw new Error(err);
    }
    const jsonArray = [];

    // ---Clean the data---
    fileContent = cleanupData(fileContent);
    fileContent = fileContent.replace(/"/g, "");
    fileContent = fileContent.replace(/\r/g, "");
    let episodeCount = 0;
    // If the file contains "Ep" -- (if it's a tv show)
    if (fileContent.includes("Episodes")) {
      fileContent = fileContent.replace(/S(\d+),\s*Ep(\d+)/gi, (match, season, episode) => {
        episodeCount++;
        return `S${season}-Ep${episode}`;
      });
      isTvEpisodes = true;
    }

    // ---Get data---
    // -Split the CSV file into an array of strings
    // -First line = headers
    const lines = fileContent.split("\n");
    let headers = lines.shift().split(",");
    headers = headers.splice(2, headers.length - 1);

    console.log("headers: ", headers);

    // ---Create objects---
    // -Create an object for each line
    lines.forEach((line) => {
      const obj = {};
      // if the comma is between quotes, don't split
      const currentline = line.split(",");
      console.log("currentline: ", currentline);

      // if it's a show title or other
      if (!isTvEpisodes) {
          // if the description has a comma
          const lastElementIndex = currentline.length-1;
          const lastElement = currentline[currentline.length-1];
          const secondToLastElement = currentline[currentline.length-2];
        if (currentline.length - 3 === headers.length) {
          // combine last two elements
          currentline[currentline.length-2] = `${secondToLastElement},${lastElement}`;
          // remove last element
          currentline.splice(lastElementIndex, 1);
        }
      }

      // if tv show only
      let scrapeOrder;
      let scrapeOrderDivided;
      let scrapeFinder;
      if (isTvEpisodes) {
        scrapeOrder = currentline[0].split("-")[1].trim();
        scrapeOrderDivided = Math.ceil(scrapeOrder / episodeCount);
        // finds the index of the object in the array
        scrapeFinder = 21 - (scrapeOrder - (scrapeOrderDivided * (episodeCount))) * -1;
      }

      let columnIndex = 0;
      headers.forEach((header) => {
        // console.log("header: ", header);
        obj[header] = "";
        // if the cell is not empty
        if (currentline[columnIndex+2] !== "") {
          const cellValue = currentline[columnIndex+2].trim();
          console.log("cellValue: ", cellValue);
          obj[header] = cellValue;
          if (isTvEpisodes) {
            // wait for initial episodes to be created
            if (scrapeOrder > episodeCount) {
              jsonArray[scrapeFinder][header] = currentline[columnIndex+2];
            }
          }
          // } else {
          //   if (headers.length-2 < columnIndex)
          // }
          // split season and episode
          if (header === "episodeNumber") {
            obj["seasonNumber"] = parseInt(cellValue.split("-")[0].trim().replace("S", ""));
            const episode = parseInt(cellValue.split("-")[1].trim().replace("Ep", ""));
            obj[header] = episode;
          }
        }
          columnIndex++;
      });
      jsonArray.push(obj);
    });

    // remove excess objects
    jsonArray.splice(episodeCount, jsonArray.length - 1);

    // put seasonNumber at the beginning of each object
    if (isTvEpisodes) {
      jsonArray.forEach((obj, index) => {
        const { seasonNumber, ...rest } = obj;
        jsonArray[index] = { seasonNumber, ...rest };
      });
    }

    let stuffToWrite;
    // if it's one element, remove the array
    if (jsonArray.length === 1) {
      stuffToWrite = jsonArray[0];
    } else {
      stuffToWrite = jsonArray;
    }

    fs.writeFile(jsonFilePath, JSON.stringify(stuffToWrite, null, 4), (err) => {
      if (err) {
        writeToLogfile("Error", `Error writing to JSON file:\n-${err}`);
        throw new Error(err);
      }
      writeToLogfile("Success", `JSON successfully written to ${jsonFilePath}`);
    });
  });
};

convertCsvToJson();
