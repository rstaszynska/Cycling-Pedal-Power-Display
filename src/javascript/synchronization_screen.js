const {ipcRenderer} = require("electron");
require('events').EventEmitter.defaultMaxListeners = 1000;


const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let appliance = params.appliance;
let mode = params.mode;
let duration = params.duration;
let display = params.display;

var settingsUpdated = false;

setup_start_screen();

document.querySelector(".continue").onclick = function() {synchronize()};

function synchronize() {

    // Check if the settings match up
   
    var opponentMode;
    var opponentDuration;
    var opponentAppliance;

    // BUG: when you change settings on one of the screens, it doesn't update, and it also doesn't receive data again

    var x = setInterval(function () {
        ipcRenderer.send("get-"+display+"-bicycle-settings", [mode, duration, appliance]);
        ipcRenderer.on("updated-"+display+"-bicycle-settings", (event, data) => {
            settingsUpdated = true;
            opponentMode = data[0];
            opponentDuration = data[1];
            opponentAppliance = data[2];
            console.log("checking...");
            if (opponentMode === "Competition Mode" || opponentMode === "Cooperation Mode") {
                console.log(mode, opponentMode, appliance, opponentAppliance, duration, opponentDuration);
                if (mode === opponentMode && appliance === opponentAppliance && duration === opponentDuration) {
                    console.log("match");
                    
                    // GO TO START
                    location.href = "start_screen.html?appliance=" + appliance + "&mode=" + mode + "&duration=" + duration + "&display=" + display;
                }
                else {
                    
                    console.log("no match");

                }
                clearInterval(x);
            }
        })
    }, 1000);
    
}

document.querySelector("#back-arrow").onclick = function() {go_back()};
function go_back() {
    settingsUpdated = false;
    location.href = "timer_duration_selection.html?appliance=" + appliance + "&mode=" + mode;
}

document.querySelector("#home-button").onclick = function() {go_to_home()};
function go_to_home() {
    location.href = "appliance_selection.html";
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
    
    if (appliance === "led light bulb" || appliance === "kettle" || appliance === "laptop") {
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
    
        if (appliance === "incandescent light bulb") {
            name.innerHTML = "Incandescent Light Bulb";
            wattage.innerHTML = "W";
        } else if (appliance === "toaster") {
            name.innerHTML = "Toaster";
            name.style.marginTop = "10vh";
            wattage.innerHTML = "W";
            appliance_img.style.height = "45%";
        } else if (appliance === "washing machine") {
            name.innerHTML = "Washing Machine";
            wattage.innerHTML = "W";
        }
    }
    
    box_styling.style.backgroundColor = background_color;
    
    var heading = document.querySelector("#heading");
    var subheading = document.querySelector("#subheading");
    
    heading.innerHTML = "Would you like to continue with the duo challenge?";
    subheading.innerHTML = "Both players must select the same challenge options";
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

