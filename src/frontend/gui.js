let filteredDevices = null;
let filter = '';
let inputBuffer = "";
let inputTimeout;

async function populateDeviceList(devices, list, lastSelected) {
    //wait for async event
    devices = await devices;

    //remove children from list
    list.innerHTML = '';

    //filter devices
    filteredDevices = new Map();
    let deviceIndex = 0;
    for(let i = 0; i < devices.length; i++) {
        //continue if bad usage flags
        if(true) {
            //create element and assign its value as the array index
            const element = document.createElement("option");
            element.value = i;
            element.innerText = devices[i].product;
            console.log(deviceIndex);

            //assign default text if it doesnt exist
            if(element.innerText.length === 0) {
                element.innerText = "Unknown Device"
            }
            
            //append element
            list.appendChild(element);

            //add element to map
            filteredDevices.set(deviceIndex, i);

            //increment device index
            deviceIndex++;
        }
    };

    //set selected element to lastSelected
    list.value = lastSelected;
}

function setupInputDevicesListeners(list) {
    //initial device list population
    populateDeviceList(APIbridge.getDevices(), list, null);
    
    //event listener for opening input options
    list.addEventListener("mousedown", () => {
        populateDeviceList(APIbridge.getDevices(), list, list.value);
    });

    //event listener for changing the option
    list.addEventListener("change", (event) => {
        //open device at index
        console.log(event.target.value);
        APIbridge.selectDevice(event.target.value)
    });
}

function createItemEntry(code, count) {
    //create parent div element
    const item = document.createElement('div');
    item.classList.add('common-item');

    //set name p
    const p1 = document.createElement('p');
    p1.innerText = code;
    item.appendChild(p1);

    //create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add("item-buttons-container");

    //append count to button container
    const p2 = document.createElement('p');
    p2.innerText = count;
    buttonContainer.appendChild(p2);
    
    //create add button
    const addBtn = document.createElement('button');
    addBtn.innerText = "+";
    addBtn.addEventListener("click", () => {
        APIbridge.addItem(code);
    })
    buttonContainer.appendChild(addBtn);

    //create remove button
    const removeBtn = document.createElement('button');
    removeBtn.innerText = "-";
    removeBtn.addEventListener("click", () => {
        APIbridge.removeItem(code);
    })
    buttonContainer.appendChild(removeBtn);

    //append buttonContainer to item
    item.appendChild(buttonContainer);

    //return
    return item;
}

async function updateLast(code, value) {
    //get container
    const container = document.getElementById("last-scanned-item");
    container.innerHTML = '';

    //update contents if value is valid
    if(value != undefined) {
        container.appendChild(createItemEntry(code, value));
    }
}

async function populateScannedList() {
    //get list and add button
    const list = document.getElementById("scanned-item-list");
    const manualAddButton = document.getElementById('manual-add-button');

    //get filtered items
    const items = await APIbridge.returnFiltered(filter);

    //remove add button and display items if any exist
    let listIndex = 0;
    if(items.size > 0) {
        //make button invisible
        manualAddButton.style.display = 'none';

        //repopulate with filtered items
        for(const [code, count] of items) {
            //get new item
            const item = createItemEntry(code, count);

            //append item to list
            if(listIndex < list.children.length) {
                list.children[listIndex].innerHTML = '';
                list.children[listIndex].appendChild(item);
            } else {
                const li = document.createElement('li');
                li.appendChild(item);
                list.appendChild(li);
            }
            
            //increment list index
            listIndex++
        };
    }
    //no items shown, make button visible
    else {
        manualAddButton.style.display = 'inline';
    }

    //remove remaining children in list
    while(listIndex < list.children.length) {
        list.children[listIndex].remove();
    }
}

async function loadFile(file) {
    const reader = new FileReader();

    const promise = new Promise((resolve) => {
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        reader.readAsArrayBuffer(file);
    });
    return await promise; 
}

async function autoSave() {
    localStorage['auto'] = JSON.stringify(Array.from((await APIbridge.returnFiltered('')).entries()));
}

function showOutputResults(container, results) {
    //populate total adjusted
    document.getElementById("output-total-adjusted-item").children[1].innerText = results['itemsAdjusted']

    //verify sheets were good first
    if(!results['catalogValid']) {
        alert("Bad catalog sheet was detected. Please make sure columns are setup properly per usage instructions. Output has failed.");
        return;
    }
    if(!results['adjustmentvalid']) {
        alert("Bad adjustment sheet was detected. Please make sure columns are setup properly per usage instructions. Output has failed.");
        return;
    }

    function populateInfo(list, results, secondaryKey) {
        //clear list
        list.innerHTML = '';

        //append items to list
        for(const item of results) {
            const li = document.createElement('li');

            //create parent div element
            const container = document.createElement('div');
            container.classList.add('common-item');

            //set name p
            const p1 = document.createElement('p');
            p1.innerText = item['code'];
            container.appendChild(p1);
            
            //set value p
            const p2 = document.createElement('p');
            p2.innerText = item[secondaryKey];
            container.appendChild(p2);
            
            li.appendChild(container);
            list.appendChild(li);
        }
    }
    
    //populate errors and suboptimals
    populateInfo(document.getElementById("error-list"), results['badItems'], 'reason');
    populateInfo(document.getElementById("suboptimal-list"), results['suboptimalItems'], 'reason');

    //make output visible
    container.style.display = "flex";
    
    //add event to clear
    document.getElementById("clear-results-button").addEventListener("click", () => {
        container.style.display = "none";
    })
}

export function initUIListeners() {
    //update scanned list
    populateScannedList();

    //event listener to update GUI list when list changes
    APIbridge.invokeItemListchange(async (lastCode, lastValue) => {
        //update last changed
        updateLast(lastCode, lastValue);

        //update scanned list
        populateScannedList();

        //auto save
        autoSave();
    });

    //async stuff for input device
    //const list = document.getElementById("input-device-selection");
    //setupInputDevicesListeners(list);
    document.addEventListener("keydown", (event) => {
        //refresh timeout to flush buffer
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => {
            inputBuffer = "";
            console.log("Buffer timed out");
        }, 1000);

        //flush buffer if enter is hit
        console.log(event.key);
        if(event.key == "Enter") {
            APIbridge.addItem(inputBuffer);
            inputBuffer = "";
        }
        //else add input
        else {
            inputBuffer += event.key
        }
    })

    //update GUI list when filter changes
    document.getElementById("scanned-filter").addEventListener("input", async (event) => {
        filter = event.target.value;
        await populateScannedList();
    });

    //manual add from filter when no items are shown
    document.getElementById('manual-add-button').addEventListener("click", () => {
        const code = document.getElementById("scanned-filter").value;
        APIbridge.addItem(code);
    });

    //calculate and save output
    document.getElementById("output-sheet-button").addEventListener("click", async () => {
        //show pending feedback
        const pendingContainer = document.getElementById("pending-results-container")
        pendingContainer.style.display = "flex"
        try {
            //get output container
            const outputContainer = document.getElementById("output-results-container");

            //grab files
            const catalogFile = document.getElementById("input-catalog-sheet-selection").files[0];
            const adjustFile = document.getElementById("input-adjust-sheet-selection").files[0];

            //verify they are valid
            if(catalogFile == undefined) {
                throw new Error("Catalog file not selected");
            }
            else if(adjustFile == undefined) {
                throw new Error("Adjustment file not selected");
            }

            //read file data
            const catalogData = await loadFile(catalogFile);
            const adjustData = await loadFile(adjustFile);

            //populate and show results after outputting
            showOutputResults(outputContainer, await APIbridge.outputFile(catalogData, adjustData))
        } catch(error) {
            alert(error);
        }

        //remove pending container
        pendingContainer.style.display = "none"
    });

    //save session event
    document.getElementById("header-save-button").addEventListener("click", async () => {
        localStorage['manual'] = JSON.stringify(Array.from((await APIbridge.returnFiltered('')).entries()));
        console.log(localStorage.getItem('manual'));
    });

    //load saved session event
    document.getElementById("header-load-button").addEventListener("click", async () => {
        const storage = localStorage.getItem('manual');
        if(storage != null) {
            await APIbridge.setItems(new Map(JSON.parse(storage)));
            populateScannedList();
            console.log("Restored saved session");
        }
    });

    //restore session event
    document.getElementById("header-restore-button").addEventListener("click", async () => {
        const storage = localStorage.getItem('auto');
        if(storage != null) {
            await APIbridge.setItems(new Map(JSON.parse(storage)));
            populateScannedList();
            console.log("Restored auto saved session");
        }
    });

    //reset event
    document.getElementById("header-reset-button").addEventListener("click", async () => {
        await APIbridge.setItems(new Map());
        populateScannedList();
        console.log("Reset session");
    });
    
}