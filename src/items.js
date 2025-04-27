let items = new Map();

export function addItem(code) {
    //create new entry starting at 0 if item doesnt exist in map yet
    if(items.count(code) === 0) {
        items.set(code, 0);
    }

    //increment by 1
    items.set(code, items.get(code)++);
}

export function removeItem(code) {
    //decrement by 1
    items.set(code, items.get(code)--);

    //remove item if less than 1 count (0)
    if(items.get(code) < 1) {
        items.delete(code);
    }
}

export function returnFiltered(filter) {
    //create a new map to reference
    let filtered = new Map();

    //append items that include substring
    items.forEach((count, code) => {
        if(code.includes(filter)) {
            filtered.set(code, count);
        }
    });

    //return new filtered map
    return filtered;
}