/* =========================================================================================================
    Portions of the following code have been adapted from software released under the MIT license:
    Project: PedalPower https://github.com/Tankiolegend/PedalPower
*/

var bicyclePower = 0;

class Bicycle {
    device;

    async connectBicycle(bicycleName, bicycleNumber) {
        await navigator.bluetooth
            .requestDevice({
                filters: [
                    {
                        name: [bicycleName],
                        // Cycling Power uuid
                        services: ["00001818-0000-1000-8000-00805f9b34fb"],
                    },
                ],
            })
            .then((device) => {
                this.device = device;
                this.device.addEventListener("gattserverd", function () {
                    setTimeout(function () {
                        reconnectBicycle(bicycleNumber);
                    }, 2000);
                });
                this.startConnection();
            });
    }

    async startConnection() {
        this.device.gatt.connect();
        await this.device.gatt
            .connect()
            .then((reserver) => {
                return reserver.getPrimaryService("00001818-0000-1000-8000-00805f9b34fb");
            })
            .then((service) => {
                // Cycling Power Measurement uuid
                return service.getCharacteristic("00002a63-0000-1000-8000-00805f9b34fb");
            })
            .then((characteristic) => characteristic.startNotifications())
            .then((characteristic) => {
                characteristic.addEventListener("characteristicvaluechanged", function () {
                    testChange(event);
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    async disconnectDevice() {
        try {
            await this.device.gatt.disconnect();
        }
        catch {
            console.log("disconnecting gatt issue");
        }
        
    }

    isConnected() {
        if (typeof this.device === "undefined") {
            return false;
        } else {
            return this.device.gatt.connected;
        }
    }
}

const deviceOne = new Bicycle();
const deviceTwo = new Bicycle();

async function connectBicycle(bicycleNumber) {
    if (bicycleNumber === 1) {
        await deviceOne.connectBicycle("Tacx Flux 27168", 1);
        console.log("Bike 1 connected") 
    } 
    
    else if  (bicycleNumber === 2) {
        await deviceTwo.connectBicycle("Tacx Flux 27280", 2);
        console.log("Bike 2 connected") 
    }
}

async function reconnectBicycle(bicycleNumber) {
    if (bicycleNumber == 1) {
        await deviceOne.startConnection("Tacx Flux 27168");
        if (!deviceOne.isConnected()) {
            setTimeout(function () {
                reconnectBicycle(1);
            }, 2000);
        }
    } else {
        deviceTwo.startConnection("Tacx Flux 27280");
        if (!deviceTwo.isConnected()) {
            setTimeout(function () {
                reconnectBicycle(2);
            }, 2000);
        }
    }
}

async function disconnectBicycle(bicycleNumber) {
    if (bicycleNumber == 1) {
        await deviceOne.disconnectDevice();
    } else {
        await deviceTwo.disconnectDevice();
    }
}

function testChange(event) {
    power = event.target.value.getUint8(2, true);
    bicyclePower += power;
}