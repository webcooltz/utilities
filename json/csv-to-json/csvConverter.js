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

const filterEmptyCells = (row) => {
  const filteredRow = row.filter((cell) => cell !== ""); // Filter out empty cells
  return filteredRow;
};

const convertCsvToJson = () => {
  // ---Read the CSV file---
  fs.readFile(csvFilePath, "utf-8", (err, fileContent) => {
    if (err) {
      console.log(err);
      throw new Error(err);
    }
    const jsonArray = [];

    // ---Clean the data---
    fileContent = cleanupData(fileContent);
    fileContent = fileContent.replace(/"/g, "");
    fileContent = fileContent.replace(/\r/g, "");
    let episodeCount = 0;
    if (fileContent.includes("Ep")) { // If the file contains "Ep" (e.g. S1, Ep1) -- if it's a tv show
      fileContent = fileContent.replace(/S(\d+),\s*Ep(\d+)/gi, (match, season, episode) => {
        episodeCount++; // Increment the count for each replacement
        return `S${season}-Ep${episode}`;
      });
      console.log("episodeCount: ", episodeCount);
    }
    // console.log("fileContent: ", fileContent);

    // ---Get data---
    // -Split the CSV file into an array of strings
    // -First line = headers
    const lines = fileContent.split("\n");
    let headers = lines.shift().split(",");
    headers = headers.splice(2, headers.length - 1);
    // console.log("headers: ", headers);

    // ---Create objects---
    // -Create an object for each line
    lines.forEach((line) => {
      const obj = {};
      const currentline = line.split(",");
      console.log("currentline: ", currentline);
      // get first column, split it by a -, then get second part
      const scrapeOrder = currentline[0].split("-")[1].trim();
      console.log("scrapeOrder: ", scrapeOrder);
      // obj["scrapeOrder"] = scrapeOrder;
      // get scrape order, divide it by episodeCount
      const scrapeOrderDivided = Math.ceil(scrapeOrder / episodeCount);
      console.log("scrapeOrderDivided: ", scrapeOrderDivided);
      const scrapeFinder = 21 - (scrapeOrder - (scrapeOrderDivided * (episodeCount))) * -1;
      console.log("scrapeFinder: ", scrapeFinder);

      let columnIndex = 0;
      headers.forEach((header) => {
        obj[header] = "";
        console.log("obj: ", obj);
        if (currentline[columnIndex+2] !== "") {
          const cellValue = currentline[columnIndex+2].trim();
          console.log("cellValue: ", cellValue);
          obj[header] = cellValue;
          console.log("obj[header]: ", obj[header]);
          if (scrapeOrder > episodeCount) { // wait for initial episodes to be created
            console.log("jsonArray[scrapeFinder] (before): ", jsonArray[scrapeFinder]);
            console.log("scrapeFinder: ", scrapeFinder);
            jsonArray[scrapeFinder][header] = currentline[columnIndex+2];
            console.log("jsonArray[scrapeFinder]: ", jsonArray[scrapeFinder]);
          }
          // split season and episode
          if (header === "episodeNumber") {
            obj["seasonNumber"] = parseInt(cellValue.split("-")[0].trim().replace("S", ""));
            const episode = parseInt(cellValue.split("-")[1].trim().replace("Ep", ""));
            console.log("episode: ", episode);
            obj[header] = episode;
          }
        }
          columnIndex++;
          // console.log("columnIndex: ", columnIndex);
      });
      jsonArray.push(obj);
    });

    // remove excess objects
    jsonArray.splice(episodeCount, jsonArray.length - 1);

    // put seasonNumber at the beginning of each object
    jsonArray.forEach((obj, index) => {
      const { seasonNumber, ...rest } = obj;
      jsonArray[index] = { seasonNumber, ...rest };
    });

    // console.log("jsonArray: ", jsonArray);

    fs.writeFile(jsonFilePath, JSON.stringify(jsonArray, null, 4), (err) => {
      if (err) {
        console.log(err);
        throw new Error(err);
      }
      console.log("JSON saved!");
    });
  });
};

convertCsvToJson();

// module.exports = { convertCsvToJson };
