const fs = require("fs");

const file = "./test-io/output-json.json";
let xmlInput;
let xmlType;

// cleans the XML (takes out extra spaces, indents, etc.)
function cleanupXml(xml) {
  const cleanXmlString = xml.replace(/\r?\n|\r| /g, "");
  return cleanXmlString;
}

// turns the XML into an array of strings (based on same tags)
function changeXmlToArray(xml) {
  const tags = xml.match(/<\w*\>/g);
  const mainObjectTag = tags[0];
  const objectTagCount = xml.match(new RegExp(mainObjectTag, "gi"));
  if (objectTagCount.length > 1) {
    xmlType = "Array";

    let splitByObjectTag = xml.split(mainObjectTag);
    splitByObjectTag.splice(0, 1);

    for (var i = 0; i < splitByObjectTag.length; i++) {
      splitByObjectTag[i] = mainObjectTag + splitByObjectTag[i];
    }
    return splitByObjectTag;
  } else if (objectTagCount.length < 2) {
    xmlType = "String";
    const stringToArray = [xml];
    return stringToArray;
  } else {
    xmlType = "Unknown";
    console.log("error");
    return;
  }
}

// cuts off the angled brackets in the tags
function cutTags(tagString) {
  let tagCutterBeginning;
  let tagCutterEnd;
  if (!tagString) {
    return;
  } else if (tagString.includes("</")) {
    tagCutterBeginning = tagString.split(">");
    tagCutterEnd = tagCutterBeginning[1].split("</");
    return tagCutterEnd[0];
  } else {
    tagCutterBeginning = tagString.split("<");
    tagCutterEnd = tagCutterBeginning[1].split(">");
    return tagCutterEnd[0];
  }
}

// main function
function parseXml(xml) {
  if (!xml) {
    console.log("generic error");
  } else {
    let finalResult = [];
    let finalResultString;

    for (var j = 0; j < xml.length; j++) {
      // finds all properties within the tags
      const propertyValues = xml[j].match(/>\w*\<\//g);

      // finds all XML tags by '<' and '>'
      const openingTags = xml[j].match(/<\w*\>/g);

      // finds object name
      const mainObjectTag = openingTags[0];
      const objectNameAfterCut = cutTags(mainObjectTag);

      let propertyList = [];
      let tagList = [];

      // makes property tags into JSON and pushes them to an array
      for (var k = 0; k < propertyValues.length - 1; k++) {
        const jsonProperty = propertyValues[k];
        const propertyAfterCut = cutTags(jsonProperty);

        propertyList.push(propertyAfterCut);
      }

      // makes property tags into JSON format and pushes them to an array
      for (var m = 1; m < openingTags.length; m++) {
        const jsonTag = openingTags[m];
        const tagsAfterCut = cutTags(jsonTag);

        if (m === openingTags.length - 1) {
          tagList.push(
            '"' + tagsAfterCut + '"' + ": " + '"' + propertyList[m - 1] + '"'
          );
        } else {
          tagList.push(
            '"' +
              tagsAfterCut +
              '"' +
              ": " +
              '"' +
              propertyList[m - 1] +
              '"' +
              ", "
          );
        }
      }

      // joins the array of tags
      const squishedTags = tagList.join("");

      // adds the quotes & brackets for JSON objects
      const jsonResult =
        "{ " +
        '"' +
        objectNameAfterCut +
        '"' +
        ": " +
        " { " +
        squishedTags +
        " } }";

      if (j === xml.length - 1) {
        finalResult.push(jsonResult);
      } else {
        finalResult.push(jsonResult + ",");
      }
    }

    // turns it into an array in JSON
    if (xmlType === "Array") {
      finalResultString = "[" + finalResult.join("") + "]";
    } else {
      finalResultString = finalResult.join("");
    }

    console.log("Final Result: ", finalResult);
    // console.log("Final Result: ", finalResultString);

    fs.writeFile(file, finalResultString, (err) => {
      if (err) throw err;
      console.log("Data has been written to file: ", file);
    });
  }
}

// input-xml-singular
// input-xml-messy
// input-xml
fs.readFile("./test-io/input-xml-messy.xml", "utf8", (err, xmlData) => {
  if (err) {
    return console.log(err);
  } else {
    xmlInput = xmlData;
    const cleanInput = cleanupXml(xmlInput);
    const arrayInput = changeXmlToArray(cleanInput);
    parseXml(arrayInput);
  }
});

// module.exports = parseXml(xmlInput);
