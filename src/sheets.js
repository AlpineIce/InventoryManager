import * as XLSX from "xlsx"
import * as fs from 'node:fs'

import { returnFiltered } from "./items.js";

const SheetColumns = {
    catalogIdColumn: 'D',
    catalogScanCodeColumn: 'F',

    adjustIdColumn: 'B',
    adjustAdjustColumn: 'C',
    adjustQuantityColumn: 'D'
};

function searchCatalog(catalog, code) {

}

export function processOutput(catalog, adjustment) {
    console.log("Exporting");

    //read inputs
    const catalogBook = XLSX.read(catalog, { type: 'binary' });
    const adjustmentBook = XLSX.read(adjustment, { type: 'binary' });
    console.log("Loaded sheet data");

    //create array to store items that dont exist in catalog
    let badItems = new Array();

    //adjust output sheet based on items scanned
    for(const [code, count] of returnFiltered("")) {
        //find item in catalog first
        if(searchCatalog(catalogBook, code)) {

        }
        //if item wasnt found, add to bad array
        else {
            badItems.push({ code: code, count: count });
        }
    }

    return 0;
}