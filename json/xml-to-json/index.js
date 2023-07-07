const fs = require("fs");

const file = "./test-io/output.json";
let xmlInput;
let xmlType;
let containerTagName;
let childTagName;
let isXmlContainer;

/* Cleans the XML input by the user
  (takes out extra spaces, indents, etc.)
  *
  * @param {string} xml - XML input by the user (from another file).
  * @returns {string} - The XML after it has been cleaned.
*/
function cleanupXml(xml) {
  return xml.replace(/\r?\n|\r| /g, "");
}

/* Checks if the XML is in a container-type tag
  <container>, <menu>, etc.
  *
  * @param {string} xml - XML after being cleaned (from cleanupXml()).
  * @returns nothing.
  * Sets the isXmlContainer, containerTagName global vars 
*/
function isInContainer(xml) {
  const openingTags = xml.match(/<\w*\>/g);
  const closingTags = xml.match(/<\/\w*\>/g);
  const openingTagAfterCut = cutTags(openingTags[0]);
  const lastTagInArray = closingTags.length - 1;
  const closingTagAfterCut = cutTags(closingTags[lastTagInArray]);

  // if the first tag is repeated multiple times, it isn't a container
  for (var o = 1; o < openingTags.length - 1; o++) {
    if (openingTags[o] === openingTags[0]) {
      isXmlContainer = false;
      return;
    }
  }

  // if the first and last tags are the same, it is a container
  if (openingTagAfterCut === closingTagAfterCut) {
    containerTagName = openingTagAfterCut;
    isXmlContainer = true;
  } else if (openingTagAfterCut !== closingTagAfterCut) {
    isXmlContainer = false;
  } else {
    console.log("Container detection error. Make sure XML is valid.");
    return;
  }
}

/* Checks if XML should be array
 * Changes the XML into an array of strings (based on same tags)
 *
 * @param {string} xml - XML after being cleaned (from cleanupXml()).
 * @returns [string] splitByObjectTag - An array of strings by similar tags.
 * @returns [string] [xml] - A string turned into an array of 1.
 * Sets the xmlType global var ("Array", "String", "Unknown").
 */
function changeXmlToArray(xml) {
  const tags = xml.match(/<\w*\>/g);
  let mainObjectTag;
  if (isXmlContainer === true) {
    const splitMe = xml.split("<" + containerTagName + ">");
    tags.splice(containerTagName, 1);
    mainObjectTag = tags[0];
    const cleaned = splitMe[1];
    const splitCleaned = cleaned.split("</" + containerTagName + ">");
    const joinCleaned = splitCleaned[0];
    const splitByObjectTag = joinCleaned.split(mainObjectTag);
    splitByObjectTag.splice(0, 1);

    for (var i = 0; i < splitByObjectTag.length; i++) {
      splitByObjectTag[i] = mainObjectTag + splitByObjectTag[i];
    }
    return splitByObjectTag;
  }

  mainObjectTag = tags[0];
  const objectTagCount = xml.match(new RegExp(mainObjectTag, "gi"));

  // if it is an array -- clean it up, return it
  if (objectTagCount.length > 1) {
    xmlType = "Array";

    let splitByObjectTag = xml.split(mainObjectTag);
    splitByObjectTag.splice(0, 1);

    for (var i = 0; i < splitByObjectTag.length; i++) {
      splitByObjectTag[i] = mainObjectTag + splitByObjectTag[i];
    }

    return splitByObjectTag;
    // if it is not an array -- turn it into an array with 1 index
  } else if (objectTagCount.length < 2) {
    xmlType = "String";
    return [xml];
  } else {
    xmlType = "Unknown";
    console.log("error");
    return;
  }
}

/* Cuts off the angled brackets from XML
 * For container tags, property tags, property values (between tags)
 *
 * @param {string} tagString - String of a tag.
 * @returns {string} tagCutterEnd[0] - When property value or a tag -- the property value or tag name.
 * @returns {string} tagCutterEnd[1] - When container closing tag -- the tag name/property name.
 */
function cutTags(tagString) {
  let tagCutterBeginning;
  let tagCutterEnd;
  const isAClosingTag = tagString.match(/<\/\w*>/g);

  if (!tagString) {
    return;
  } else if (tagString.includes("</")) {
    // if it's a container closing tag
    if (isAClosingTag) {
      // console.log("isAClosingTag: ", isAClosingTag);
      tagCutterBeginning = tagString.split(">");
      tagCutterEnd = tagCutterBeginning[0].split("</");
      return tagCutterEnd[1];
      // if it's a property value
    } else if (!isAClosingTag) {
      tagCutterBeginning = tagString.split(">");
      tagCutterEnd = tagCutterBeginning[1].split("</");
      return tagCutterEnd[0];
    } else {
      console.log("tagString error");
      return;
    }
    // for tag/property names
  } else {
    tagCutterBeginning = tagString.split("<");
    tagCutterEnd = tagCutterBeginning[1].split(">");
    return tagCutterEnd[0];
  }
}

/* Puts JSON puncuation in place
 * For properties/property values
 *
 * @param {string} propertyName - The property name/title from the openingTags array, after tags are cut.
 * @param {string} value - The property value from the propertyList array.
 * @returns {string} - The property name and value with quotes and a colon to make it JSON.
 */
function jsonify(propertyName, value) {
  return '"' + propertyName + '"' + ": " + '"' + value + '"';
}

/* Parses the XML to JSON
 *
 * @param {string} xml - The user-input XML after it has been cleaned and checked for containers and arrays
 * @returns {string} finalResultString - The final result: The XML after it has been cut, cleaned, and JSONifyed.
 */
function parseXml(xml) {
  if (!xml) {
    console.log("generic error");
  } else {
    let finalResult = [];
    let finalResultString;

    for (var j = 0; j < xml.length; j++) {
      // finds all properties within the tags
      const propertyValues = xml[j].match(/>\w*\<\//g);
      //   const propertyValues = xml[j].match(/>[^<]*<\/\w+>/g);
      // const propertyValues = xml[j].match(/>.*<\/\w+>/g);
      // const elementContents = xml[j].match(/>(.*?)<\/\w*>/g).map(match => match.slice(1, -2));

      // console.log("xml[j]: ", xml[j]);
      // console.log("elementContents: ", elementContents);

      // finds all XML tags by '<' and '>'
      const openingTags = xml[j].match(/<\w*\>/g);

      // finds object name
      const mainObjectTag = openingTags[0];
      //   console.log("mainObjectTag: ", mainObjectTag);
      const objectNameAfterCut = cutTags(mainObjectTag);

      let propertyList = [];
      let tagList = [];

      // console.log("openingTags: ", openingTags);
      // console.log("propertyValues: ", propertyValues);

      // makes property tags into JSON and pushes them to an array
      for (var k = 0; k < propertyValues.length - 1; k++) {
        const jsonProperty = propertyValues[k];
        // console.log("jsonProperty: ", jsonProperty);
        const propertyAfterCut = cutTags(jsonProperty);
        // console.log("propertyAfterCut: ", propertyAfterCut);
        propertyList.push(propertyAfterCut);
      }

      // makes property tags into JSON format and pushes them to an array
      for (var m = 1; m < openingTags.length; m++) {
        // change? -- const tagsAfterCut = cutTags(openingTags[m]);
        const jsonTag = openingTags[m];
        const tagsAfterCut = cutTags(jsonTag);

        if (m === openingTags.length - 1) {
          tagList.push(jsonify(tagsAfterCut, propertyList[m - 1]));
        } else {
          tagList.push(jsonify(tagsAfterCut, propertyList[m - 1]) + ", ");
        }
      }

      // joins the array of tags
      const squishedTags = tagList.join("");

      let jsonResult;

      // adds the quotes & brackets for JSON objects
      if (isXmlContainer === true) {
        jsonResult = " { " + squishedTags + " } ";
      } else if (isXmlContainer === false) {
        jsonResult =
          "{ " +
          '"' +
          objectNameAfterCut +
          '"' +
          ": " +
          " { " +
          squishedTags +
          " } }";
      } else {
        console.log("jsonResult container error");
        return;
      }

      if (j === xml.length - 1) {
        finalResult.push(jsonResult);
      } else {
        finalResult.push(jsonResult + ",");
      }
    }

    // if container, it changes the format at the end
    if (isXmlContainer === true) {
      finalResultString =
        "{ " +
        '"' +
        containerTagName +
        '"' +
        ": " +
        "{ " +
        childTagName +
        " [ " +
        finalResult.join("") +
        " ]" +
        " }" +
        " }";
    } else if (isXmlContainer === false) {
      // turns it into an array
      if (xmlType === "Array") {
        finalResultString = "[" + finalResult.join("") + "]";
      } else {
        finalResultString = finalResult.join("");
      }
    } else {
      console.log("xmlContainer error");
      return;
    }

    console.log("Final Result: ", finalResult);
    // console.log("Final Result: ", finalResultString);

    fs.writeFile(file, finalResultString, (err) => {
      if (err) throw err;
      console.log("Data has been written to file: ", file);
    });

    return finalResultString;
  }
}

// input-xml-singular
// input-xml-messy
// input-xml
function main(xml) {
  // fs.readFile("./test-io/input-xml-singular.xml", "utf8", (err, xmlData) => {
  // if (err) {
  //   return console.log(err);
  // } else {
  //   xmlInput = "<student><firstName>Tyler</firstName><lastName>Turner</lastName></student>";
  xmlInput = xml;
  const cleanInput = cleanupXml(xmlInput);
  isInContainer(cleanInput);
  const arrayInput = changeXmlToArray(cleanInput);
  const endResult = parseXml(arrayInput);
  // }
  // });
  return endResult;
  // return isTagContainer;
}

main(
  '<?xmlversion="1.0"encoding="UTF-8"?><breakfast_menu><food><name>Belgian Waffles</name><price>$5.95</price></food><food><name>Strawberry BelgianWaffles</name><price>$7.95</price></food><food><name>Berry-BerryBelgianWaffles</name><price>$8.95</price></food><food><name>FrenchToast</name><price>$4.50</price></food><food><name>HomestyleBreakfast</name><price>$6.95</price></food></breakfast_menu>'
);
// main("<?xml version=\"1.0\" encoding=\"UTF-8\"?> <student>  <firstName>Tyler</firstName>    <lastName>Turner</lastName> </student>  <student>   <firstName>Tyler</firstName>    <lastName>Turner</lastName> </student>");

module.exports = main;

// TO-DO
// see if xml objects have their own objects?
