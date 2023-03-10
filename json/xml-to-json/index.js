const fs = require('fs');

const file = './output-json.json';
let xmlInput;
let xmlType;

function cleanXml(xml) {
    // remove <?xml version='1.0' encoding='UTF-8'?>, ?> ,'\r', '\n, and space'
    // const extraTags = ['<?xml', '<xml', '?>', '</xml>'];
    const xmlString = xml.replace(/\r?\n|\r| /g, "");
    const tagSearch = xmlString.match(/<\?.*\?>/g);
    let cleanXml = xmlString.split(tagSearch).splice(1, 1).join('');

    return cleanXml;
}

function xmlArrayCreater(xml) {
    const tagSearch = xml.match(/<\w*\>/g);
    // console.log("tagSearch: ", tagSearch);
    const objectName = tagSearch[0];
    // console.log("objectName: ", objectName);
    const objectNameCount = (xml.match(new RegExp(objectName, 'gi')));
    if (objectNameCount.length > 1) {
        xmlType = 'Array';

        let objectSplit = xml.split(objectName);
        // console.log("objectSplit: ", objectSplit);

        objectSplit.splice(0, 1);

        for (var m = 0; m < objectSplit.length; m++) {
            objectSplit[m] = objectName + objectSplit[m];
        }

        // console.log("objectSplit 2: ", objectSplit);

        return objectSplit;

    } else if (objectNameCount.length < 2) {
        xmlType = 'String';
    } else {
        xmlType = 'Unknown';
        console.log('error');
        return;
    }
}

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

function parseXml(xml) {
    if (!xml) {
        console.log(err);
    } else {
        let finalResult = [];
        let finalResultString;

        for (var i = 0; i < xml.length; i++) {
            // finds all properties within the tags
            let propertySearch = xml[i].match(/>\w*\<\//g);
            // console.log('propertySearch: ', propertySearch);

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
        // console.log('finalResultString: ', finalResultString);

        fs.writeFile(file, finalResultString, (err) => {
            if (err) throw err;
            console.log('Data has been written to file: ', file);
        });
    }
}

fs.readFile('./input-xml-messy.xml', 'utf8', (err, xmlData) => {
    if (err) {
      return console.log(err);
    } else {
        xmlInput = xmlData;
        const cleanString = cleanXml(xmlInput);
        // const arrayString = isXmlArray(cleanString);
        let arrayString = xmlArrayCreater(cleanString);
        // console.log(arrayString);
        parseXml(arrayString);
    }
});

// module.exports = parseXml(xmlInput);
