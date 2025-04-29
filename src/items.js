import { window } from "./index.js";

let items = new Map();

export function addItem(code) {
    //make uppercase
    code = code.toUpperCase();
    
    //create new entry starting at 0 if item doesnt exist in map yet
    if(items.get(code) == null) {
        items.set(code, 0);
    }

    //increment by 1
    items.set(code, items.get(code) + 1);

    //call callback
    window.webContents.send('invoke-item-list-change', code, items.get(code));
}

export function removeItem(code) {
    //decrement by 1
    items.set(code, items.get(code) - 1);

    //remove item if less than 1 count (0)
    if(items.get(code) < 1) {
        items.delete(code);
    }

    //call callback
    window.webContents.send('invoke-item-list-change', code, items.get(code));
}

export function returnFiltered(filter) {
    //if filter is set, proceed with filtering
    if(filter.length > 0) {
        //create a new map to reference
        let filtered = new Map();
        
        //filter
        for(const [code, count] of items) {
            if(code.includes(filter)) {
                filtered.set(code, count);
            }
        };

        //return filtered map
        return filtered;
    }
    //otherwise return all items
    else {
        
        return items;
    }    
}

export function setItems(newItems) { items = newItems; }