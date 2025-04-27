let filteredDevices = null;

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
            console.log(devices[i])

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
        APIbridge.selectDevice(event.target.value, )
    });
}

function populateScannedList(filter, items) {
    const list = document.getElementById("scanned-item-list");
    console.log(filter)
}

export function initUIListeners() {
    //async stuff for input device
    const list = document.getElementById("input-device-selection");
    setupInputDevicesListeners(list)

    //Scanned items filter
    document.getElementById("scanned-filter").addEventListener("input", (event) => {
        populateScannedList(event.target.value, null);
    })
}