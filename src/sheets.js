import * as XLSX from "xlsx"
import * as fs from 'node:fs'

import { returnFiltered } from "./items.js";

function getSheetData(catalog, adjust) {
    //verify columns of catalog
    let catalogValid = true;
    catalogValid = catalogValid && catalog.Sheets['Export']['D1'].v === 'ProductID';
    catalogValid = catalogValid && catalog.Sheets['Export']['F1'].v === 'ScanCode';

    //verify columns of adjust
    let adjustValid = true;
    adjustValid = adjustValid && adjust.Sheets['Export']['B1'].v === 'ProductID';
    adjustValid = adjustValid && adjust.Sheets['Export']['C1'].v === 'Adjustment';
    adjustValid = adjustValid && adjust.Sheets['Export']['D1'].v === 'CurrentQty';

    //verification function
    function getSheetProperties(book, columns) {
        //return value
        let returnValues = new Map();

        //iterate colums for book
        for(const key in columns) {
            //return values
            let map = new Map();
            
            //iterate
            let index = 2; //start at 2 because 1 is the header
            let cell = book.Sheets['Export'][columns[key] + index];
            while(cell != undefined) {
                //set data
                map.set(String(cell['v']).toUpperCase(), index)

                //incrementations
                index++;
                cell = book.Sheets['Export'][columns[key] + index];
            }

            //assign scan code to the index this cell is in
            map.set(key, index);

            //set properties in return variable
            returnValues.set(key, map);
        }
        
        //return
        return returnValues;
    }

    //get sheet properties for catalog and adjustment
    const catalogColumns = {
        D: 'D', //this is for legacy barcodes, but functions like normal scan codes do
        F: 'F'
    };
    const adjustColumns = {
        B: 'B'
    };
    const catalogProperties = catalogValid ? getSheetProperties(catalog, catalogColumns) : null;
    const adjustProperties = adjustValid ? getSheetProperties(adjust, adjustColumns) : null;
    
    //return both sheets data
    return {
        catalog: {
            valid: catalogValid,
            properties: catalogProperties
        },
        adjust: {
            valid: adjustValid,
            properties: adjustProperties
        }
    };
}

export function processOutput(catalog, adjustment) {
    console.log("Exporting");

    //initialize return data
    let exportResults = {
        catalogValid: false,
        adjustmentvalid: false,
        itemsAdjusted: 0,
        suboptimalItems: new Array(),
        badItems: new Array()
    }

    //read inputs
    const catalogBook = XLSX.read(catalog, { type: 'binary' });
    const adjustmentBook = XLSX.read(adjustment, { type: 'binary' });
    console.log("Loaded sheet data");

    //verify sheets are correct
    const sheetData = getSheetData(catalogBook, adjustmentBook);

    //return error if catalog is bad
    if(!sheetData["catalog"]['valid']) return exportResults;
    else exportResults['catalogValid'] = true;

    //return error if adjust is bad
    if(!sheetData["adjust"]['valid']) return exportResults;
    else exportResults['adjustmentvalid'] = true;

    //adjust output sheet based on items scanned
    for(const [code, count] of returnFiltered("")) {
        //helper set adjustment function
        function setAdjustment(referenceKey) {
            //verify adjustment key
            if(sheetData['adjust']['properties'].get('B').has(referenceKey)) {
                //get adjustment index and quantity
                const adjustmentIndex = sheetData['adjust']['properties'].get('B').get(referenceKey);
                const currentQty = adjustmentBook.Sheets['Export']['D' + adjustmentIndex].v;

                //initialize adjustment if not already initialized
                if(adjustmentBook.Sheets['Export']['C' + adjustmentIndex] === undefined) {
                    adjustmentBook.Sheets['Export']['C' + adjustmentIndex] = {
                        t: 'n',
                        v: 0,
                    };
                }

                //change adjustment value
                adjustmentBook.Sheets['Export']['C' + adjustmentIndex].v = (count - currentQty);

                //increment total adjusted result
                exportResults['itemsAdjusted']++;
            }
            else {
                //well shit!
                exportResults['badItems'].push({
                    code: code,
                    reason: "Found in catalog, but not in adjustment sheet"
                });
            }
        }

        //first search normal scan code
        if(sheetData['catalog']['properties'].get('F').has(code)) {
            //get scan code index and reference key
            const scanCodeIndex = sheetData['catalog']['properties'].get('F').get(code)
            const referenceKey = catalogBook.Sheets['Export']['D' + scanCodeIndex].v;
            
            //adjust
            setAdjustment(String(referenceKey).toUpperCase());
        }
        //then legacy code if that failed
        else if(sheetData['catalog']['properties'].get('D').has(code)) {
            //get reference key from scan code
            const referenceIndex = sheetData['catalog']['properties'].get('D').get(code);
            const referenceKey = catalogBook.Sheets['Export']['D' + referenceIndex].v
            
            //adjust
            setAdjustment(String(referenceKey).toUpperCase());

            //log that it was suboptimal
            exportResults['suboptimalItems'].push({
                code: code,
                reason: "Was found as a reference, not a scan code"
            });
        }
        //bad item
        else {            
            exportResults['badItems'].push({
                code: code,
                reason: "Not found in catalog"
            });
        }
    }

    //save file to directory TODO
    XLSX.writeFile(adjustmentBook, "output.xlsx");

    //return data
    return exportResults;
}