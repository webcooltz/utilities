const fs = require("fs");

const file = "./test-io/output-multiple.json";

function cleanupXml(xml) {
  const cleanXmlString = xml.replace(/\r?\n|\r| /g, "");
  return cleanXmlString;
}

fs.readFile("./test-io/input-children.xml", "utf8", (err, xmlData) => {
  if (err) {
    return console.log(err);
  } else {
    xmlInput = xmlData;
    const cleanInput = cleanupXml(xmlInput);

    fs.writeFile(file, cleanInput, (err) => {
      if (err) throw err;
      console.log("Data has been written to file: ", file);
    });

    return cleanInput;
  }
});

module.exports = cleanupXml;
