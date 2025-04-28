import * as HID from "node-hid"
import { addItem } from "./items.js";

const ASCIIKeys = {
    0x04: 0x61, // 'a'
    0x05: 0x62, // 'b'
    0x06: 0x63, // 'c'
    0x07: 0x64, // 'd'
    0x08: 0x65, // 'e'
    0x09: 0x66, // 'f'
    0x0A: 0x67, // 'g'
    0x0B: 0x68, // 'h'
    0x0C: 0x69, // 'i'
    0x0D: 0x6A, // 'j'
    0x0E: 0x6B, // 'k'
    0x0F: 0x6C, // 'l'
    0x10: 0x6D, // 'm'
    0x11: 0x6E, // 'n'
    0x12: 0x6F, // 'o'
    0x13: 0x70, // 'p'
    0x14: 0x71, // 'q'
    0x15: 0x72, // 'r'
    0x16: 0x73, // 's'
    0x17: 0x74, // 't'
    0x18: 0x75, // 'u'
    0x19: 0x76, // 'v'
    0x1A: 0x77, // 'w'
    0x1B: 0x78, // 'x'
    0x1C: 0x79, // 'y'
    0x1D: 0x7A, // 'z'
    0x1E: 0x31, // '1'
    0x1F: 0x32, // '2'
    0x20: 0x33, // '3'
    0x21: 0x34, // '4'
    0x22: 0x35, // '5'
    0x23: 0x36, // '6'
    0x24: 0x37, // '7'
    0x25: 0x38, // '8'
    0x26: 0x39, // '9'
    0x27: 0x30, // '0'
    0x28: 0x0D, // 'Enter'
    0x2C: 0x20, // 'Space'
    0x2D: 0x2D, // '-'
    0x2E: 0x3D, // '='
    0x2F: 0x5B, // '['
    0x30: 0x5D, // ']'
    0x31: 0x5C, // '\'
    0x33: 0x3B, // ';'
    0x34: 0x27, // '\''
    0x35: 0x60, // '`'
    0x36: 0x2C, // ','
    0x37: 0x2E, // '.'
    0x38: 0x2F, // '/'
};

let devices = null;
let selectedDevice = null;

let buffer = null;

export function getDevices() {
    //get all available HID devices
    devices = HID.devices();

    //return devices
    return devices;
}

export function selectDevice(index) {
    //close current device if not null
    if(selectedDevice != null) { selectedDevice.close(); }

    // Find a specific device by vendorId and productId
    try {
        selectedDevice = new HID.HID(devices[index].path);
    } catch(error) {
        console.log(error);
    }

    // Read data from the device
    selectedDevice.on('data', data => {
        //reset buffer if needed
        if(buffer == null) {
            buffer = new String();
        }

        //interpret data
        const characterData = data[2];
        if(characterData != 0) {
            //call callback and flush buffer if enter key hit
            if(characterData == 0x28) {
                //debug log
                console.log(buffer, buffer.length);

                //add item to scanned list
                addItem(buffer);
                
                //flush buffer
                buffer = '';
            } 
            //otherwise push to buffer
            else {
                buffer += String.fromCharCode(ASCIIKeys[characterData]);
            }
        }
    });
}
