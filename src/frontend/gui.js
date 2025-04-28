let filteredDevices = null;
let filter = '';

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
        if(devices[i].usage & 0b100 && devices[i].usage & 0b010) {
            //create element and assign its value as the array index
            const element = document.createElement("option");
            element.value = deviceIndex;
            element.innerText = devices[i].product;

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
        APIbridge.selectDevice(event.target.value)
    });
}

async function updateLast(code, value) {
    const container = document.getElementById("last-scanned-item");
    container.children[0].innerText = code;
    container.children[1].innerText = value;
}

async function populateScannedList() {
    const list = document.getElementById("scanned-item-list");

    //repopulate with filtered items
    let listIndex = 0;
    const items = await APIbridge.returnFiltered(filter);
    for(const [code, count] of items) {
        //create parent div element
        const div = document.createElement('div');
        div.classList.add('scanned-item');

        //set name p
        const p1 = document.createElement('p');
        p1.innerText = code;
        div.appendChild(p1);
        
        //set value p
        const p2 = document.createElement('p');
        p2.innerText = count;
        div.appendChild(p2);

        //append to list
        if(listIndex < list.children.length) {
            list.children[listIndex].innerHTML = '';
            list.children[listIndex].appendChild(div);
        } else {
            const li = document.createElement('li');
            li.appendChild(div);
            list.appendChild(li);
        }
        
        //increment list index
        listIndex++
    };
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
  

export function initUIListeners() {
    //update scanned list
    populateScannedList();

    //event listener to update GUI list when list changes
    APIbridge.invokeItemListchange(async (lastCode, lastValue) => {
        //update last changed
        updateLast(lastCode, lastValue);

        //update scanned list
        populateScannedList();
    });

    //async stuff for input device
    const list = document.getElementById("input-device-selection");
    setupInputDevicesListeners(list);

    //update GUI list when filter changes
    document.getElementById("scanned-filter").addEventListener("input", async (event) => {
        filter = event.target.value;
        await populateScannedList();
    });

    //save output file event
    document.getElementById("output-sheet-button").addEventListener("click", async () => {
        //grab files
        const catalogFile = document.getElementById("input-catalog-sheet-selection").files[0];
        const adjustFile = document.getElementById("input-adjust-sheet-selection").files[0];

        //verify they are validc
        if(catalogFile == undefined) {
            alert("Catalog file not selected");
            return;
        }
        else if(adjustFile == undefined) {
            alert("Adjustment file not selected");
            return;
        }

        //read file data
        const catalogData = await loadFile(catalogFile);
        const adjustData = await loadFile(adjustFile);

        //output
        APIbridge.outputFile(catalogData, adjustData);
    });
}