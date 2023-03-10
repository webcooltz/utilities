const fs = require('fs');

const file = './output-json.json';
let xmlInput;
let xmlType;

// cleans the XML (takes out extra spaces, indents, etc.)
function cleanXml(xml) {
    const xmlString = xml.replace(/\r?\n|\r| /g, "");

    if (typeof xmlString === "Object") {
        const tagSearch = xmlString.match(/<\?.*\?>/g);
        const cleanXml = xmlString.split(tagSearch).splice(1, 1).join('');
        return cleanXml;
    } else {
        return xmlString;
    }
}

// turns the XML into an array of strings (based on same tags)
function xmlArrayCreater(xml) {
    const tagSearch = xml.match(/<\w*\>/g);
    const objectName = tagSearch[0];
    const objectNameCount = (xml.match(new RegExp(objectName, 'gi')));
    if (objectNameCount.length > 1) {
        xmlType = 'Array';

        let objectSplit = xml.split(objectName);
        objectSplit.splice(0, 1);

        for (var m = 0; m < objectSplit.length; m++) {
            objectSplit[m] = objectName + objectSplit[m];
        }
        return objectSplit;
    } else if (objectNameCount.length < 2) {
        xmlType = 'String';
        let stringToArray = [];
        stringToArray.push(xml);
        return stringToArray;
    } else {
        xmlType = 'Unknown';
        console.log('error');
        return;
    }
}

// cuts off the angled brackets in the tags
function tagCutter(tagString) {
    if (!tagString) {
        return;
    } else if (tagString.includes('</')) {
        let tagCutterBeg = tagString.split('>');
        let tagCutterEnd = tagCutterBeg[1].split('</');
        return tagCutterEnd[0];
    } else {
        let tagCutterBeg = tagString.split('<');
        let tagCutterEnd = tagCutterBeg[1].split('>');
        return tagCutterEnd[0];
    }
}

// main function
function parseXml(xml) {
    if (!xml) {
        console.log(err);
    } else {
        let finalResult = [];
        let finalResultString;

        for (var i = 0; i < xml.length; i++) {
            // finds all properties within the tags
            let propertySearch = xml[i].match(/>\w*\<\//g);

            // finds all XML tags by '<' and '>'
            let tagSearch = xml[i].match(/<\w*\>/g);

            // finds object name
            let objectName = tagSearch[0];
            let objectNameCut = tagCutter(objectName);

            let propList = [];
            let tagList = [];

            // makes property tags into JSON and pushes them to an array
            for (var j = 0; j < propertySearch.length - 1; j++) {
                let jsonProperty = propertySearch[j];
                let propCut = tagCutter(jsonProperty);

                propList.push(propCut);
            }
            
            // makes property tags into JSON format and pushes them to an array
            for (var k = 1; k < tagSearch.length; k++) {
                let jsonTag = tagSearch[k];
                let tagCut = tagCutter(jsonTag);

                if (k === tagSearch.length - 1) {
                    tagList.push('"' + tagCut + '"' + ': ' + '"' + propList[k-1]+ '"');
                } else {
                    tagList.push('"' + tagCut + '"' + ': ' + '"' + propList[k-1]+ '"' + ', ');
                }
            }

            // joins the array of tags
            let tagSquish = tagList.join('');
            // adds the quotes and brackets for JSON objects
            let jsonResult = '{ ' + '"' + objectNameCut + '"' + ': ' + ' { ' + tagSquish + ' } }';

            // console.log('jsonResult: ', jsonResult);

            if (i === xml.length - 1) {
                finalResult.push(jsonResult);
            } else {
                finalResult.push(jsonResult + ',');
            }
        }

        // turns it into an array in JSON
        if (xmlType === "Array") {
            finalResultString = '[' + finalResult.join('') + ']';
        } else {
            finalResultString = finalResult.join('');
        }

        console.log('finalResult: ', finalResult);

        fs.writeFile(file, finalResultString, (err) => {
            if (err) throw err;
            console.log('Data has been written to file: ', file);
        });
    }
}

// input-xml-singular
// input-xml-messy
fs.readFile('./input-xml-singular.xml', 'utf8', (err, xmlData) => {
    if (err) {
      return console.log(err);
    } else {
        xmlInput = xmlData;
        const cleanString = cleanXml(xmlInput);
        const arrayString = xmlArrayCreater(cleanString);
        parseXml(arrayString);
    }
});

// module.exports = parseXml(xmlInput);
