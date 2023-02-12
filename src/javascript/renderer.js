const {ipcRenderer} = require("electron");
// const { clearInterval } = require("timers");
require('events').EventEmitter.defaultMaxListeners = 100;

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

// =========================================================================================================

var userWon = false;
var opponentWon = false;
var goalReached = false;
var commonGoalReached = false;
var timesUp = false;

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let appliance = params.appliance;
let mode = params.mode;
let duration = params.duration;
let display = params.display;

var timer_paused = false;


setup_start_screen();
document.querySelector(".start").onclick = function() {start()};

function start() {
    if (mode === "Competition Mode" || mode === "Cooperation Mode") {
        ipcRenderer.send("get-"+ display + "-ready-status", [true]);
        ipcRenderer.on("permission-to-begin", (event, data) => {
            if (display === "left") {
                connectBicycle(1);
            }
            else if (display === "right") {
                connectBicycle(2);
            } 
            setup_challenge_screen();
            beginTimer();
        })
    }

    else {
        if (display === "left") {
            connectBicycle(1);
        }
        else if (display === "right") {
            connectBicycle(2); 
        } 
        setup_challenge_screen();
        beginTimer();
    }
}

var opponentScore = 0;

function beginTimer() {

    // No timer duration selected -> count elapsed time instead
    if (duration === "No timer") {
        document.querySelector("#timer-label").innerHTML = "TIME ELAPSED";

        // Elapsed time
        var minutesElapsed = 0;
        var secondsElapsed = 1;
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

                // Challenge ends when user reaches the goal or pauses/exits the game
                begin_challenge();
            }
        }, 1000);
    } 

    // Timer duration selected -> countdown present
    else {
        document.querySelector("#timer-label").innerHTML = "TIME REMAINING";

        if (duration === "30 seconds") {
            var time = new Date().getTime() + 3000;
            // var time = new Date().getTime() + 31000;
        } else if (duration === "1 minute") {
            var time = new Date().getTime() + 61000;
        } else if (duration === "3 minutes") {
            var time = new Date().getTime() + 181000;
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
                    begin_challenge();    
                }

                // Time's up
                else {
                    clearInterval(x);
                    timesUp = true;
                    show_results(); // Goal not reached
                }
            } else {
                time += 1000;
            }
        }, 1000);
    }
}

document.querySelector("#back-arrow").onclick = function() {go_back()};
function go_back() {
    location.href = "timer_duration_selection.html?appliance=" + appliance + "&mode=" + mode + "&display=" + display;
}

document.querySelector("#home-button").onclick = function() {go_to_home()};
function go_to_home() {
    location.href = "appliance_selection.html?display=" + display;
}

var background_color;
var secondary_color;

function setup_start_screen() {
    const timer = document.querySelector("#duration");
    timer.innerHTML = duration;
    const mode_type = document.querySelector("#mode");
    mode_type.innerHTML = mode;
    const box_styling = document.querySelector(".box-styling");
    box_styling.style.border = "10px solid #4D9FFF";
    
    const appliance_img = document.querySelector("#chosen-appliance-img");
    appliance_img.src = "../images/" + appliance.split(" ").join("") + ".png";
    const name = document.querySelector("#appliance-name");
    const wattage = document.querySelector("#appliance-wattage");

    const appliance_on_img = document.createElement("img");
    appliance_on_img.src = "../images/" + appliance.split(" ").join("") + "_on.png";
    
    if (appliance === "led light bulb" || appliance === "kettle" || appliance === "laptop") {
        background_color = "#7CC0FF";
        secondary_color = "#b5dbfc";
    
        if (appliance === "led light bulb") {
            name.innerHTML = "LED Light Bulb";
            wattage.innerHTML = "10 W";
        } else if (appliance === "kettle") {
            name.innerHTML = "Electric Kettle";
            wattage.innerHTML = "3000 W";
        } else if (appliance === "laptop") {
            name.innerHTML = "Laptop";
            name.style.marginTop = "10vh";
            wattage.innerHTML = "430 W";
            appliance_img.style.height = "50%";
            appliance_img.style.marginLeft= "10%";
            appliance_on_img.id = "laptop-screen";
        }
    } else {
        background_color = "#99ECF8";
        secondary_color = "#baf3fc";
    
        if (appliance === "incandescent light bulb") {
            name.innerHTML = "Incandescent Light Bulb";
            wattage.innerHTML = "100 W";
        } else if (appliance === "toaster") {
            name.innerHTML = "Toaster";
            name.style.marginTop = "10vh";
            wattage.innerHTML = "850 W";
            appliance_img.style.height = "45%";
        } else if (appliance === "washing machine") {
            name.innerHTML = "Washing Machine";
            wattage.innerHTML = "900 W";
            appliance_on_img.id = "washing-machine";
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
    
    document.querySelector(".left").appendChild(appliance_on_img);
}

function setup_challenge_screen() {
    document.querySelectorAll(".start-screen-element").forEach((element) => element.remove());

    if (appliance === "led light bulb" || appliance === "incandescent") {
        heading.innerHTML = "Can you power an " + appliance + " ?";
    } else {
        heading.innerHTML = "Can you power a " + appliance + "?";
    }
    subheading.innerHTML = "Cycle to generate electricity";

    document.querySelector(".left").style.opacity = "100%";

    var progressCircle = document.createElement("div");
    progressCircle.id = "progress-circle";
    var angle = 0;
    progressCircle.style.background =
        "radial-gradient(" + background_color + " 50%, transparent 51%), conic-gradient(black 0deg " + angle + "deg, " + secondary_color + " " + (angle + 1) + "deg 360deg)";

    var progressText = document.createElement("div");
    progressText.id = "progress-text";

    var progressPercentage = document.createElement("p");
    progressPercentage.id = "progress-percentage";
    progressPercentage.innerHTML = 0 + "%";
    progressText.appendChild(progressPercentage);

    var percentageDescriptor = document.createElement("p");
    percentageDescriptor.innerHTML = "of power generated";
    progressText.appendChild(percentageDescriptor);

    document.querySelector("#middle").appendChild(progressCircle);
    document.querySelector("#middle").appendChild(progressText);

    var timerLabel = document.createElement("p");
    timerLabel.id = "timer-label";

    var timer = document.createElement("p");
    if (duration === "30 seconds") {
        timer.innerHTML = "0:30";
    } else if (duration === "1 minute") {
        timer.innerHTML = "1:00";
    } else if (duration === "3 minutes") {
        timer.innerHTML = "3:00";
    }
    else {
        timer.innerHTML = "0:00";
    }
    timer.id = "timer";

    var pauseButton = document.createElement("button");
    pauseButton.style.marginTop = "30px";
    pauseButton.innerHTML = "PAUSE";
    pauseButton.id = "button";
    if (mode ==="Solo Mode") {
        pauseButton.style.marginTop = "45%";
    }
    else {
        pauseButton.style.marginLeft = "10%";
    }
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

    if (mode === "Competition Mode" || mode === "Cooperation Mode") {
        var opponentScore = document.createElement("div");
        opponentScore.style.backgroundColor = secondary_color;
        var score = document.createElement("p");
        score.id = "score-text";
        var scorePercentage = document.createElement("h1");
        scorePercentage.id = "score-percentage";

        if (mode === "Cooperation Mode") {   
            score.innerHTML = "PARTNER SCORE"; 
            opponentScore.id = "both-scores";        
            var userScore = document.createElement("p");
            userScore.id = "score-text";
            userScore.innerHTML = "MY SCORE";
            var userScorePercentage = document.createElement("h1");
            userScorePercentage.id = "user-score-percentage";
            userScorePercentage.style.fontSize = "50px";
            userScorePercentage.style.marginTop = "-20px";
            scorePercentage.style.fontSize = "50px";
            scorePercentage.style.marginTop = "-20px";
            score.style.marginTop =  "-5px";

            opponentScore.appendChild(userScore);
            opponentScore.appendChild(userScorePercentage);
            opponentScore.appendChild(score);
            opponentScore.appendChild(scorePercentage);
        }

        else {
            score.innerHTML = "OPPONENT SCORE";
            opponentScore.id = "opponent-score";
            scorePercentage.style.fontSize = "50px";
            opponentScore.appendChild(score);
            opponentScore.appendChild(scorePercentage);
        }
        document.getElementById("right").appendChild(opponentScore);
    }

    document.getElementById("right").appendChild(pauseButton);
}


function begin_challenge() {
    if (mode === "Solo Mode") {
        // Time remaining and goal not yet reached 
        if (bicyclePower >= 0 && Math.round(bicyclePower *10 / 100) <= 100) {
            // Update progress circle and percentage
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
        }

        // Time remaining and goal reached
        else {
            goalReached = true;
            show_results();
        }
    }

    else if (mode === "Competition Mode") {

        // Time remaining and no user has reached the goal yet
        if (!userWon || !opponentWon) {
            
            // Update progress circle and percentage
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
        
            // Display opponent stats
            if (display === "left") {
                ipcRenderer.send("get-right-bicycle-power", [Math.round(bicyclePower)]);
                ipcRenderer.on("updated-right-bicycle-stats", (event, data) => {
                    opponentScore = data[0];
                })
            }
            else {
                ipcRenderer.send("get-left-bicycle-power", [Math.round(bicyclePower)]);
                ipcRenderer.on("updated-left-bicycle-stats", (event, data) => {
                    opponentScore = data[0];
                })
            }
            document.querySelector("#score-percentage").innerHTML = Math.round(opponentScore*10 / 100) + "%";
        }

        // Check if the current user won
        if (Math.round(bicyclePower *10 / 100) >= 100) {
            userWon = true;
            show_results();
        }

        // Check if the opponent won
        if (Math.round(opponentScore*10 / 100) >= 100) {
            opponentWon = true;
            show_results();
        }
    }


    // Cooperation mode
    else {
        // Time remaining and the users have not reached the goal yet
        if (!commonGoalReached) {

            // Get stats from cooperator
            if (display === "left") {
                ipcRenderer.send("get-right-bicycle-power", [Math.round(bicyclePower)]);
                ipcRenderer.on("updated-right-bicycle-stats", (event, data) => {
                    opponentScore = data[0];
                })
            }
            else {
                ipcRenderer.send("get-left-bicycle-power", [Math.round(bicyclePower)]);
                ipcRenderer.on("updated-left-bicycle-stats", (event, data) => {
                    opponentScore = data[0];
                })
            }
            document.querySelector("#user-score-percentage").innerHTML = Math.round(bicyclePower*10 / 100) + "%";
            document.querySelector("#score-percentage").innerHTML = Math.round(opponentScore*10 / 100) + "%";
            
            // Update progress circle and percentage
            var percentage = Math.round((bicyclePower + opponentScore) *10 / 100);
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
        }

        if ((bicyclePower + opponentScore) *10 / 100 >= 100) {
            commonGoalReached = true;
            show_results();
        }
    }
}



 // ================================================= RESULTS SCREEN =================================================
function show_results() {

    if (display == "left") {
        disconnectBicycle(1);
    }
    else {
        disconnectBicycle(2);
    }

    var cost = 0;
    var carbonEmissions = 0;
    var minutes = 0;
    
    var heading = document.querySelector("#heading");
    var subheading = document.querySelector("#subheading");

    document.querySelector("#progress-text").remove();
    document.querySelector("#progress-circle").remove();
    var resultText = document.createElement("p");
    resultText.id = "results-text";

    if (mode === "Competition Mode") {  
        document.querySelector("#opponent-score").remove();
    }
    else if (mode === "Cooperation Mode") {
        document.querySelector("#both-scores").remove();
    }

    add_animation_effect();

    // Goal not reached
    if (timesUp) {
        heading.innerHTML = "You've ran out of time...";
        if (mode === "Solo Mode") {
            subheading.innerHTML = "But you managed to generate " + (bicyclePower *10 / 100) + "% of the required power!";
            resultText.innerHTML = "You weren't able to generate enough electricity to power on the " + appliance + " for one hour, but you generated <b>" + bicyclePower + " watts</b>, which is enough to power it on for <b>" + minutes + " minutes</b>! Nice try! <br><br>";
        }
        else if (mode === "Cooperation Mode") {
            subheading.innerHTML = "But you managed to generate " + ((bicyclePower + opponentScore) *10 / 100) + "% of the required power!";
            resultText.innerHTML = "You weren't able to generate enough electricity to power on the " + appliance + " for one hour, but together you generated <b>" + (bicyclePower + opponentScore) + " watts</b>, which is enough to power it on for <b>" + minutes + " minutes</b>! Nice try! <br><br>";
        }
        else if (mode === "Competition Mode") {
            subheading.innerHTML = "Neither of you won the challenge. But you generated "+ (bicyclePower) *10 / 100 + "% of the required power";
            resultText.innerHTML = "You weren't able to generate enough electricity to power on the " + appliance + " for one hour, but you generated <b>" + bicyclePower + " watts</b>, which is enough to power it on for <b> " + minutes + " minutes</b>! Nice try! <br><br>";
        }
    }

    // Goal reached
    else {
        timer_paused = true;
        // add_animation_effect();
        if (goalReached) {
            // Solo mode, player won
            heading.innerHTML = "Goal reached!";
            subheading.innerHTML = "You generated 100% of the required power!";
            resultText.innerHTML = "You were able to generate enough electricity to power on the " + appliance + " for one hour! That's a total of <b>" + bicyclePower + " watts</b>! Well done! <br><br>";
        }
        else if (userWon) {
            // Duo mode, player won
            heading.innerHTML = "You won the challenge!";
            subheading.innerHTML = "You generated 100% of the required power!";
            resultText.innerHTML = "You were able to generate enough electricity to power on the " + appliance + " for one hour! That's a total of <b>" + bicyclePower + " watts</b>! Well done! <br><br>";
        }
        else if (opponentWon) {
            // Duo mode, opponent won
            heading.innerHTML = "Your opponent won the challenge";
            subheading.innerHTML = "But you managed to generate " + (bicyclePower *10 / 100) + "% of the required power!";
            resultText.innerHTML = "You weren't able to generate enough electricity to power on the " + appliance + " for one hour, but you generated <b>" + bicyclePower + " watts</b>, which is enough to power it on for <b>" + minutes + " minutes</b>! Nice try! <br><br>";
        }
        else if (commonGoalReached){
            // Duo cooperative mode, goal reached
            heading.innerHTML = "Goal reached!";
            subheading.innerHTML = "Together, you generated 100% of the required power!";
            resultText.innerHTML = "You were able to generate enough electricity to power on the " + appliance + " for one hour! That's a total of <b>" + (bicyclePower + opponentScore) + "  watts</b>! Great teamwork! <br><br>";
        }
    }

    resultText.innerHTML += "On average, one hour of " + appliance + " usage costs £" + cost + " and contributes " + carbonEmissions + "kg of CO₂e. Check out the information on the large screen to understand this data in context.";
    document.getElementById("middle").appendChild(resultText);
    
    var retryButton = document.querySelector("#button");
    retryButton.innerHTML = "RETRY";
    retryButton.onclick = function () {
        location.href = "start_screen.html?appliance=" + appliance + "&mode=" + mode + "&duration=" + duration + "&display=" + display;
    }
}

function add_animation_effect() {

    if (appliance === "laptop") {
        document.querySelector("#laptop-screen").classList += "fade-in-image";
        document.querySelector("#laptop-screen").style.opacity = "100%";
    }
    else if (appliance === "washing machine") {
        document.querySelector("#washing-machine").classList += "rotate-image";
    }
}