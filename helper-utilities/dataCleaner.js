/* dataCleaner.js
// -cleans strings
// -cleans filepaths
// -cleans filenames
*/

// --- helpers ---
const { writeToLogfile } =  require("./logger");

const characters = {
    "–": "-", // en dash
    "…": "...", // ellipsis
    "—": "-", // em dash
    "&nbsp;": " ", // non-breaking space
    // "&": "and", // ampersand
    "“": '"', // left double quote
    "”": '"', // right double quote
    "‘": "'", // left single quote
    "’": "'", // right single quote
    " ": " ", // non-breaking space
    "Π": "pi", // pi
    // "'": "", // replace in titles
    ":": "-", // colon
};

const cleanupData = (inputData) => {
    if (!inputData) {
        // console.log("Failed to clean data. dataCleaner.js - dataCleaner() - inputData is null or undefined");
        writeToLogfile("Failed to clean data. dataCleaner.js - dataCleaner() - inputData is null or undefined");
        return inputData;
    } else {
        // console.log(inputData);
        let cleanedData = inputData;

        // removes "bad" characters
        for (const [badChar, goodChar] of Object.entries(characters)) {
            const regex = new RegExp(badChar, "g");
            cleanedData = cleanedData.replace(regex, goodChar);
        }

        // removes footnotes if footnotes are present
        cleanedData = cleanedData.replace(/\[([A-Z])\](.*?)\[[^\/\]]*\]/g, "");

        return cleanedData.trim();
    }
};

/* cleans filepath
// -replaces backslashes with forward slashes
// -adds a trailing slash if it doesn't exist
*/
const cleanupFilepath = (filepath) => {
    if (filepath.includes("\\")) {
        filepath = filepath.replace(/\\/g, "/");
    }
    if (filepath[filepath.length - 1] !== "/") {
        filepath += "/";
    }

    const successMessage = "Successfully cleaned file paths (main.cleanFilepath).";
    console.log(successMessage);
    writeToLogfile(successMessage);

    return filepath;
};

module.exports = { cleanupData, cleanupFilepath };
