const {ipcRenderer} = require("electron");

/* =========================================================================================================
    Portions of the following code have been adapted from software released under the MIT license:
    Project: PedalPower https://github.com/Tankiolegend/PedalPower
*/

var bicyclePower = 0;

class Bicycle {
    device;

    async connectBicycle(bicycleName) {
        await navigator.bluetooth
            .requestDevice({
                filters: [
                    {
                        name: [bicycleName],
                        services: ["00001818-0000-1000-8000-00805f9b34fb"],
                    },
                ],
            })
            .then((device) => {
                this.device = device;
                this.device.addEventListener("gattserverd", function () {
                    setTimeout(function () {
                        reconnectBicycle(bicycleName);
                    }, 2000);
                });

                this.startConnection(bicycleName);
            });
    }

    async startConnection(bicycleName) {
        this.device.gatt.connect();
        await this.device.gatt
            .connect()
            .then((reserver) => {
                return reserver.getPrimaryService("00001818-0000-1000-8000-00805f9b34fb");
            })
            .then((service) => {
                return service.getCharacteristic("00002a63-0000-1000-8000-00805f9b34fb");
            })
            .then((characteristic) => characteristic.startNotifications())

            .then((characteristic) => {
                characteristic.addEventListener("characteristicvaluechanged", function () {
                    testChange(event, bicycleName);
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
            console.log("gatt issue");
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
    if (bicycleNumber == 1) {
        await deviceOne.connectBicycle("Tacx Flux 27168");
        console.log("connected bike 1");
        console.log(deviceOne.device.name + "\n");
        // Tacx Flux 27168
    } else {
        await deviceTwo.connectBicycle("Tacx Flux 27280");
        console.log("connected bike 2");
        console.log(deviceTwo.device.name + "\n\n");
        // Tacx Flux 27280
    }
}

async function reconnectBicycle(bicycleNumber) {
    if (bicycleNumber == 1) {
        await deviceOne.startConnection("Tacx Flux 27168");
        if (!deviceOne.isConnected()) {
            setTimeout(function () {
                reconnectBicycle("Tacx Flux 27168");
            }, 5000);
        }
    } else {
        deviceTwo.startConnection("Tacx Flux 27280");
        if (!deviceTwo.isConnected()) {
            setTimeout(function () {
                reconnectBicycle("Tacx Flux 27280");
            }, 5000);
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

// =========================================================================================================

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let appliance = params.appliance;
let mode = params.mode;
let duration = params.duration;
let display = params.display;

const timer = document.querySelector("#duration");
timer.innerHTML = duration;
const mode_type = document.querySelector("#mode");
mode_type.innerHTML = mode;
const box_styling = document.querySelector(".box-styling");
box_styling.style.border = "10px solid #4D9FFF";

const appliance_img = document.querySelector("#chosen-appliance-img");
appliance_img.src = "../images/" + appliance + ".png";
const name = document.querySelector("#appliance-name");
const wattage = document.querySelector("#appliance-wattage");

var background_color;
var secondary_color;

if (appliance === "led" || appliance === "kettle" || appliance === "laptop") {
    background_color = "#7CC0FF";
    secondary_color = "#b5dbfc";

    if (appliance === "led") {
        name.innerHTML = "LED Light Bulb";
        wattage.innerHTML = "W";
    } else if (appliance === "kettle") {
        name.innerHTML = "Electric Kettle";
        wattage.innerHTML = "W";
    } else if (appliance === "laptop") {
        name.innerHTML = "Laptop";
        name.style.marginTop = "10vh";
        wattage.innerHTML = "W";
        appliance_img.style.height = "50%";
        appliance_img.style.marginLeft= "10%";
    }
} else {
    background_color = "#99ECF8";
    secondary_color = "#baf3fc";

    if (appliance === "incandescent") {
        name.innerHTML = "Incandescent Light Bulb";
        wattage.innerHTML = "W";
    } else if (appliance === "toaster") {
        name.innerHTML = "Toaster";
        name.style.marginTop = "10vh";
        wattage.innerHTML = "W";
        appliance_img.style.height = "45%";
    } else if (appliance === "washingmachine") {
        name.innerHTML = "Washing Machine";
        wattage.innerHTML = "W";
    }
}

box_styling.style.backgroundColor = background_color;

var heading = document.querySelector("#heading");
var subheading = document.querySelector("#subheading");

heading.innerHTML = "Are you ready for the challenge?";
subheading.innerHTML = "Sit comfortably and select start when you are ready to begin";

if (mode === "Solo Mode") {
    const image_to_hide = document.querySelector("#image-right");
    image_to_hide.style.display = "none";

    const image_to_show = document.querySelector("#image-left");
    image_to_show.src = "../images/girl-on-bicycle.png";
    image_to_show.style.marginRight = "0px";
}

document.querySelector(".start").onclick = function() {start()};

var timer_paused = false;


function start() {
    document.querySelectorAll(".start-screen-element").forEach((element) => element.remove());

    if (appliance === "led" || appliance === "incandescent") {
        heading.innerHTML = "Can you power an " + appliance + " light bulb?";
    } else {
        heading.innerHTML = "Can you power a " + appliance + "?";
    }
    subheading.innerHTML = "Cycle to generate electricity";

    if (display === "left") {
        connectBicycle(1);
    }
    else if (display === "right") {
        connectBicycle(2);
    }

    // Loading...
    // if (!bicycleConnected) {
    //     document.querySelector(".left").style.opacity = "0%";
    //     var loading = document.createElement("h1");
    //     loading.innerHTML = "Loading";
    //     loading.id = "loading";
    //     document.getElementById("middle").appendChild(loading);
    //     var dotsNumber = 0;
    //     var dots = setInterval(function () {
    //         if (dotsNumber === 3) {
    //             dotsNumber = 0;
    //             loading.innerHTML = "Loading";
    //         } else {
    //             loading.innerHTML += ".";
    //             dotsNumber++;
    //         }
    //     }, 1500);
    // } else {
    //     document.querySelector("#loading").remove();

    //     // Countdown
    //     var countdownNumber = document.createElement("h1");
    //     countdownNumber.id = "countdown";
    //     document.getElementById("middle").appendChild(countdownNumber);
    //     var number = 3;
    //     var countdown = setInterval(function () {
    //         if (number < 1) {
    //             clearInterval(countdown);
    //             countdownNumber.innerHTML = "GO!";
    //         } else {
    //             countdownNumber.innerHTML = number;
    //             number--;
    //         }
    //     }, 1000);

        // document.querySelector("#countdown").remove();

        document.querySelector(".left").style.opacity = "100%";

        var progressCircle = document.createElement("div");
        progressCircle.id = "progress-circle";
        var angle = 0;
        progressCircle.style.background =
            "radial-gradient(" + background_color + " 50%, transparent 51%), conic-gradient(black 0deg " + angle + "deg, " + secondary_color + " " + (angle + 1) + "deg 360deg)";

        var progressText = document.createElement("div");
        progressText.id = "progress-text";

        var progressPercentage = document.createElement("p");
        progressPercentage.innerHTML = 0 + "%";
        progressPercentage.id = "progress-percentage";
        progressText.appendChild(progressPercentage);

        var percentageDescriptor = document.createElement("p");
        percentageDescriptor.innerHTML = "of power generated";
        progressText.appendChild(percentageDescriptor);

        document.getElementById("middle").appendChild(progressCircle);
        document.getElementById("middle").appendChild(progressText);

        var timerLabel = document.createElement("p");
        timerLabel.id = "timer-label";

        var timer = document.createElement("p");
        timer.innerHTML = "";
        timer.id = "timer";

        var pauseButton = document.createElement("button");
        pauseButton.style.marginTop = "30px";
        pauseButton.innerHTML = "PAUSE";
        pauseButton.id = "button";
        pauseButton.onclick = function () {
            if (!timer_paused) {
                timer_paused = true;
                document.getElementById("button").innerHTML = "RESUME";
            } else {
                timer_paused = false;
                document.getElementById("button").innerHTML = "PAUSE";
            }
        };

        document.getElementById("right").appendChild(timerLabel);
        document.getElementById("right").appendChild(timer);

        if (mode === "Competition Mode" || mode === "Cooperation Mode"){
            var opponentScore = document.createElement("div");
            opponentScore.style.backgroundColor = secondary_color;
            opponentScore.id = "opponent-score";
            var score = document.createElement("p");
            score.id = "score-text";
            score.innerHTML = "CURRENT OPPONENT SCORE";
            var scorePercentage = document.createElement("h1");
            scorePercentage.id = "score-percentage";
            scorePercentage.style.fontSize = "50px";
            opponentScore.appendChild(score);
            opponentScore.appendChild(scorePercentage);
            document.getElementById("right").appendChild(opponentScore);
        }

        document.getElementById("right").appendChild(pauseButton);

        // Challenge screen setup done

        beginTimer();

        // Start timer if the bicycle is connected
        // var y = setInterval(function () {
        //     if (bicycleConnected) {
        //         beginTimer();
        //         clearInterval(y)
        //     }
        // }, 1000);
    }

    var opponentScore = 0;

    function beginTimer() {
        if (duration === "No timer") {
            document.querySelector("#timer-label").innerHTML = "TIME ELAPSED";

            // Elapsed time
            var minutesElapsed = 0;
            var secondsElapsed = 0;
            var minutes = "";
            var seconds = "";

            var x = setInterval(function () {
                if (!timer_paused) {
                    minutes = minutesElapsed;

                    if (secondsElapsed < 9) {
                        seconds = "0" + secondsElapsed;
                    }
                    else {
                        seconds = secondsElapsed;
                    }
                
                    document.getElementById("timer").innerHTML = minutes + ":" + seconds;
                    
                    if (seconds === 59) {
                        secondsElapsed = 0;
                        minutesElapsed += 1;
                    }
                    else {
                        secondsElapsed += 1;
                    }

                    // Goal not yet reached 
                    if (bicyclePower >= 0 && Math.round(bicyclePower *10 / 100) <= 100) {
                        var percentage = Math.round(bicyclePower *10 / 100);
                        angle = percentage * 0.01 * 360;
                        document.querySelector("#progress-circle").style.background =
                            "radial-gradient(" +
                            background_color +
                            " 50%, transparent 51%), conic-gradient(black 0deg " +
                            angle +
                            "deg, " +
                            secondary_color +
                            " " +
                            (angle + 1) +
                            "deg 360deg)";
                        document.querySelector("#progress-percentage").innerHTML = Math.round(percentage) + "%";


                        // Functionality for DUO MODE
                        // Time remaining, and the current user has not won yet
                        if (mode === "Competition Mode" || mode === "Cooperation Mode") {
                            // Get information about the other bicycle
                            if (display === "left") {
                                ipcRenderer.send("get-right-bicycle-power", [Math.round(bicyclePower)]);
                                ipcRenderer.on("updated-right-bicycle-stats", (event, data) => {
                                    opponentScore = data[0];
                                    document.querySelector("#score-percentage").innerHTML = opponentScore + "%";
                                })
                            }
                            else {
                                ipcRenderer.send("get-left-bicycle-power", [Math.round(bicyclePower)]);
                                ipcRenderer.on("updated-left-bicycle-stats", (event, data) => {
                                    opponentScore = data[0];
                                    document.querySelector("#score-percentage").innerHTML = opponentScore + "%";
                                })
                            }

                            // // Cooperation mode, should display a common goal
                            // if (mode === "Cooperation Mode") {

                            // }

                            // // Competition mode, should display opponent score next to it
                            // else {

                            // }
                        }
                    }

                    // Goal reached
                    else {
                        // timer_paused = true;
                        document.querySelector("#button").remove();
                        clearInterval(x);
                        document.querySelector("#progress-percentage").innerHTML = "100%";
                 
                        // Make the circle 100% black   
                        

                        // Disconnect bicycle
                        if (display === "left") {
                            disconnectBicycle(1);
                        }
                        else {
                            disconnectBicycle(2);
                        }
                    }
                }
            }, 1000);

        } else {
            document.querySelector("#timer-label").innerHTML = "TIME REMAINING";

            if (duration === "30 seconds") {
                var time = new Date().getTime() + 32000;
            } else if (duration === "1 minute") {
                var time = new Date().getTime() + 62000;
            } else if (duration === "3 minutes") {
                var time = new Date().getTime() + 182000;
            }

            var x = setInterval(function () {
                if (!timer_paused) {
                    var distance = time - new Date().getTime();

                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    if (seconds < 10) {
                        seconds = "0" + seconds;
                    }

                    // Time still remaining
                    if (distance > 0) {
                        document.getElementById("timer").innerHTML = minutes + ":" + seconds;

                        // Goal not yet reached 
                        if (bicyclePower >= 0 && Math.round(bicyclePower *10 / 100) <= 100) {
                            var percentage = Math.round(bicyclePower *10 / 100);
                            angle = percentage * 0.01 * 360;
                            document.querySelector("#progress-circle").style.background =
                                "radial-gradient(" +
                                background_color +
                                " 50%, transparent 51%), conic-gradient(black 0deg " +
                                angle +
                                "deg, " +
                                secondary_color +
                                " " +
                                (angle + 1) +
                                "deg 360deg)";
                            document.querySelector("#progress-percentage").innerHTML = Math.round(percentage) + "%";


                            // Functionality for DUO MODE
                            // Time remaining, and the current user has not won yet
                            if (mode === "Competition Mode" || mode === "Cooperation Mode") {
                                // Get information about the other bicycle
                                if (display === "left") {
                                    ipcRenderer.send("get-right-bicycle-power", [Math.round(bicyclePower)]);
                                    ipcRenderer.on("updated-right-bicycle-stats", (event, data) => {
                                        opponentScore = data[0];
                                        console.log(data[0]);
                                        console.log(data[1]);
                                        document.querySelector("#score-percentage").innerHTML = Math.round(opponentScore*10 / 100) + "%";
                                    })
                                }
                                else {
                                    ipcRenderer.send("get-left-bicycle-power", [Math.round(bicyclePower)]);
                                    ipcRenderer.on("updated-left-bicycle-stats", (event, data) => {
                                        opponentScore = data[0];
                                        document.querySelector("#score-percentage").innerHTML = Math.round(opponentScore*10 / 100) + "%";
                                    })
                                }

                                // // Cooperation mode, should display a common goal
                                // if (mode === "Cooperation Mode") {

                                // }

                                // // Competition mode, should display opponent score next to it
                                // else {

                                // }
                            }
                        }

                        // Goal reached
                        else {
                            // timer_paused = true;
                            document.querySelector("#button").remove();
                            clearInterval(x);
                            document.querySelector("#progress-percentage").innerHTML = "100%";

                            // Disconnect bicycle
                            if (display === "left") {
                                disconnectBicycle(1);
                            }
                            else {
                                disconnectBicycle(2);
                            }
                        }
                    }
                    // Time's up
                    else {
                        clearInterval(x);
                    }
                } else {
                    time += 1000;
                }
            }, 1000);
        }
    }

    document.querySelector("#back-arrow").onclick = function() {go_back()};
    function go_back() {
        location.href = "timer_duration_selection.html?appliance=" + appliance + "&mode=" + mode;
    }

    document.querySelector("#home-button").onclick = function() {go_to_home()};
    function go_to_home() {
        location.href = "appliance_selection.html";
    }