const {ipcRenderer} = require("electron");
require('events').EventEmitter.defaultMaxListeners = 100;

var opponentEnergyInJoules = 0;
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
var challenge_is_ongoing = false;
var currentUserPercentage = 0;

var challenge_setup_complete = false;


// Unique challenge goals for each appliance (in joules)
var energyGoal = 0;

// Takes two minutes for a 700W toaster to toast two slices
// 700 x 120 seconds = 84000 Joules
if (appliance === "toaster") {
    energyGoal = 84000;
}
// 1L of water boiled in a 3000W kettle
// = 0.113 kwh => 406800 joules (takes 135.6 seconds )
else if (appliance === "kettle") {
    energyGoal = 406800;
}
// 900 watt washing machine used for a 1 hour cycle = 0.9kwh = 3240000
else if (appliance === "washing machine") {
    energyGoal = 3240000;
}

// late 2016 macbook pro with touchbar has a 76 watt hour
// and lasts 11 hours
// meaning that one hour of usage typically uses about 6.9 watt hours = 0.0069 = 24840 joules
else if (appliance === "laptop"){
    energyGoal = 24840;
}
// 10 W for 1 hour = 0.01kwh or 36,000 joules
else if (appliance === "led light bulb") {
    energyGoal = 36000;
}
// 100 W for 1 hour = 360,000 joules
else if (appliance === "incandescent light bulb") {
    energyGoal = 360000;
}



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
            if (!challenge_setup_complete) {
                setup_challenge_screen();
            }
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
        if (!challenge_setup_complete) {
            setup_challenge_screen();
        }
        beginTimer();
    }
}

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

                // Check if the other player has paused the challenge
                if (mode === "Competition Mode" || mode === "Cooperation Mode") {
                    var modal_two = document.querySelector("#modal-two");
                    var modal_three = document.querySelector("#modal-three");

                    ipcRenderer.on("request-to-pause", (event, data) => {
                        if (data[0] === true) {
                            timer_paused = true;  
                            modal_two.style.display = "block";

                            // Resume challenge 
                            ipcRenderer.on("request-to-resume", (event, data) => {
                                if (data[0] === true) {
                                    timer_paused = false;
                                    modal_two.style.display = "none";     
                                }
                            })


                             // Other player left the challenge 
                             ipcRenderer.on("request-to-end", (event, data) => {
                                if (data[0] === true) {
                                    modal_two.style.display = "none";   
                                    modal_three.style.display = "block";   
                                    document.querySelector("#return_to_main_page").onclick = function() {go_to_home()};
                                    document.querySelector("#setup_challenge_in_solo_mode").onclick = function() {duo_to_solo_challenge()};
                                }
                            })
                        }
                    });
                }
            
                minutes = minutesElapsed;

                if (secondsElapsed <= 9) {
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

                // Challenge ends when user reaches the goal or exits the game
                begin_challenge();
            }
        }, 1000);
    } 

    // Timer duration selected -> countdown present
    else {
        document.querySelector("#timer-label").innerHTML = "TIME REMAINING";

        if (duration === "30 seconds") {
            var time = new Date().getTime() + 31000;
        } else if (duration === "1 minute") {
            var time = new Date().getTime() + 61000;
        } else if (duration === "3 minutes") {
            var time = new Date().getTime() + 181000;
        }

        var x = setInterval(function () {
            if (!timer_paused) {

                // Check if the other player has paused the challenge
                if (mode === "Competition Mode" || mode === "Cooperation Mode") {
                    var modal_two = document.querySelector("#modal-two");
                    var modal_three = document.querySelector("#modal-three");
                    ipcRenderer.on("request-to-pause", (event, data) => {
                        if (data[0] === true) {
                            timer_paused = true;  
                            modal_two.style.display = "block";

                            // Resume challenge 
                            ipcRenderer.on("request-to-resume", (event, data) => {
                                if (data[0] === true) {
                                    timer_paused = false;
                                    modal_two.style.display = "none";   
                                }
                            })

                            // Other player left the challenge 
                            ipcRenderer.on("request-to-end", (event, data) => {
                                if (data[0] === true) {
                                    modal_two.style.display = "none";   
                                    modal_three.style.display = "block";   
                                    document.querySelector("#return_to_main_page").onclick = function() {go_to_home()};
                                    document.querySelector("#setup_challenge_in_solo_mode").onclick = function() {duo_to_solo_challenge()};
                                }
                            })
                            
                        }
                    });
                }

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
    if (challenge_is_ongoing) {
        if (mode === "Competition Mode || Cooperation Mode") {
            ipcRenderer.send("pause-challenge", [true, display]);
        }
        pause_timer();
        modal.style.display = "block";
    }
    
    else {
        location.href = "timer_duration_selection.html?appliance=" + appliance + "&mode=" + mode + "&display=" + display;
    }
}

document.querySelector("#yes-button").onclick = function() {
    if (mode === "Competition Mode" || mode === "Cooperation Mode") {
        ipcRenderer.send("end-challenge", [true, display]);    
    }
    location.href = "timer_duration_selection.html?appliance=" + appliance + "&mode=" + mode + "&display=" + display;
};

document.querySelector("#no-button").onclick = function() {
    modal.style.display = "none";
};

var close = document.querySelector("#close")
close.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function pause_timer() {
    if (mode === "Solo Mode") {
        if (!timer_paused) {
            timer_paused = true;
            document.getElementById("button").innerHTML = "RESUME";
        } else {
            timer_paused = false;
            document.getElementById("button").innerHTML = "PAUSE";
        }
    }

    else if (mode === "Competition Mode" || mode === "Cooperation Mode") {
        // Pause the challenge for the other player
        if (!timer_paused) {
            ipcRenderer.send("pause-challenge", [true, display]);
            timer_paused = true;
            document.getElementById("button").innerHTML = "RESUME";
            currentUserPausedChallenge = true;
        }

        // Resume is activated
        else {
            ipcRenderer.send("resume-challenge", [true, display]);
            timer_paused = false;
            document.getElementById("button").innerHTML = "PAUSE";
            currentUserPausedChallenge = false;
        }
    }
};

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
    if (appliance === "kettle") {
        appliance_on_img.src = "../images/" + appliance.split(" ").join("") + "_on.gif";
    }
    else if (appliance === "toaster") {
        appliance_img.src = "../images/toaster_layer_4.png";
        appliance_on_img.src = "../images/toaster_layer_2.png";
    }
    else {
        appliance_on_img.src = "../images/" + appliance.split(" ").join("") + "_on.png";
    }
    
    if (appliance === "led light bulb" || appliance === "kettle" || appliance === "laptop") {
        background_color = "#7CC0FF";
        secondary_color = "#b5dbfc";
    
        if (appliance === "led light bulb") {
            name.innerHTML = "LED Light Bulb";
            wattage.innerHTML = "10 W";
            appliance_on_img.id = "led-light";
        } else if (appliance === "kettle") {
            name.innerHTML = "Electric Kettle";
            wattage.innerHTML = "3000 W";
            appliance_on_img.id = "kettle";
        } else if (appliance === "laptop") {
            name.innerHTML = "Laptop";
            name.style.marginTop = "10vh";
            wattage.innerHTML = "6.9 W";
            appliance_img.style.height = "50%";
            appliance_img.style.marginLeft= "10%";
            appliance_on_img.id = "laptop-screen";
        }
        document.querySelector(".left").appendChild(appliance_on_img);
    } else {
        background_color = "#99ECF8";
        secondary_color = "#baf3fc";
    
        if (appliance === "incandescent light bulb") {
            name.innerHTML = "Incandescent Light Bulb";
            wattage.innerHTML = "100 W";
            appliance_on_img.id = "incandescent-light";
            document.querySelector(".left").appendChild(appliance_on_img);

        } else if (appliance === "toaster") {
            name.innerHTML = "Toaster";
            name.style.marginTop = "10vh";
            wattage.innerHTML = "700 W";
            appliance_img.id = "toaster-layer-4";
            appliance_on_img.id = "toaster-bread-2";

            const toaster_layer_3 = document.createElement("img");
            toaster_layer_3.src = "../images/toaster_layer_3.png";
            toaster_layer_3.id = "toaster-layer-3";

            const toaster_bread_2 = document.createElement("img");
            toaster_bread_2.src = "../images/toaster_layer_2.png";
            toaster_bread_2.id = "toaster-bread-1";

            const toaster_layer_1 = document.createElement("img");
            toaster_layer_1.src = "../images/toaster_layer_1.png";
            toaster_layer_1.id = "toaster-layer-1";

            const toaster_layer_0 = document.createElement("img");
            toaster_layer_0.src = "../images/toaster_layer_0.png";
            toaster_layer_0.id = "toaster-layer-0";
            

            document.querySelector(".left").appendChild(appliance_on_img);
            document.querySelector(".left").appendChild(toaster_layer_3);
            document.querySelector(".left").appendChild(toaster_bread_2);
            document.querySelector(".left").appendChild(toaster_layer_1);
            document.querySelector(".left").appendChild(toaster_layer_0);

        } else if (appliance === "washing machine") {
            name.innerHTML = "Washing Machine";
            wattage.innerHTML = "900 W";
            appliance_on_img.id = "washing-machine";
            document.querySelector(".left").appendChild(appliance_on_img);
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
}

function setup_challenge_screen() {
    document.querySelectorAll(".start-screen-element").forEach((element) => element.remove());

    if (appliance === "toaster") {
        heading.innerHTML = "Can you toast two slices of bread?";
    }
    else if (appliance === "kettle") {
        heading.innerHTML = "Can you boil 1 litre of water from room temperature?";
    }
    else if (appliance === "washing machine") {
        heading.innerHTML = "Can you run one laundry cycle (1 hour)?"
    }
    else if (appliance === "laptop"){
        heading.innerHTML = "Can you keep a laptop running for one hour?";
    }
    else if (appliance === "led light bulb") {
        heading.innerHTML = "Can you keep the light on for one hour?"; 
    }
    else if (appliance === "incandescent light bulb") {
        heading.innerHTML = "Can you keep the light on for one hour?";
    }

    
    subheading.innerHTML = "Cycle to generate energy";

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
    progressPercentage.innerHTML = "0.00" + "%";
    progressText.appendChild(progressPercentage);

    var percentageDescriptor = document.createElement("p");
    percentageDescriptor.innerHTML = "of energy generated";
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

    var powerLabel = document.createElement("p");
    powerLabel.id = "power-label";
    powerLabel.innerHTML = "INSTANTANEOUS POWER";
    var power = document.createElement("p");
    power.id = "power";
    power.innerHTML = "0 W";

    var pauseButton = document.createElement("button");
    pauseButton.style.marginTop = "30px";
    pauseButton.innerHTML = "PAUSE";
    pauseButton.id = "button";
    if (mode ==="Solo Mode") {
        pauseButton.style.marginTop = "55%";
    }
    else {
        pauseButton.style.marginLeft = "10%";
    }
    pauseButton.onclick = function () { pause_timer()};

    document.getElementById("right").appendChild(timerLabel);
    document.getElementById("right").appendChild(timer);

    if (mode === "Competition Mode" || mode === "Cooperation Mode") {
        var opponentScore = document.createElement("div");
        opponentScore.style.backgroundColor = secondary_color;
        var score = document.createElement("p");
        score.id = "score-text";
        var scorePercentage = document.createElement("h1");
        scorePercentage.id = "opponent-score-percentage";

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
    document.getElementById("middle").appendChild(powerLabel);
    document.getElementById("middle").appendChild(power);

    challenge_setup_complete = true;
}



function update_progress(percentage, instantaneousPower) {
    var angle = percentage * 0.01 * 360;
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
    document.querySelector("#progress-percentage").innerHTML = percentage + "%";
    document.querySelector("#power").innerHTML = instantaneousPower + " W";
}

function begin_challenge() {

    challenge_is_ongoing = true;
    currentUserPercentage = (energyInJoules / energyGoal * 100).toFixed(2);

    if (mode === "Solo Mode") {
        // Time remaining and goal not yet reached 
        if (energyInJoules >= 0 && currentUserPercentage <= 100) {
            // Update progress circle and percentage
            update_progress(currentUserPercentage, instantaneousPower);
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
            update_progress(currentUserPercentage, instantaneousPower);
        
            // Display opponent stats
            if (display === "left") {
                ipcRenderer.send("get-right-bicycle-power", [energyInJoules.toFixed(2)]);
                ipcRenderer.on("updated-right-bicycle-stats", (event, data) => {
                    opponentEnergyInJoules = data[0];
                })
            }
            else {
                ipcRenderer.send("get-left-bicycle-power", [energyInJoules.toFixed(2)]);
                ipcRenderer.on("updated-left-bicycle-stats", (event, data) => {
                    opponentEnergyInJoules = data[0];
                })
            }
            document.querySelector("#opponent-score-percentage").innerHTML = (opponentEnergyInJoules / energyGoal * 100).toFixed(2) + "%";
        }

        // Check if the current user won
        if (currentUserPercentage >= 100) {
            userWon = true;
            show_results();
        }

        // Check if the opponent won
        if ((opponentEnergyInJoules / energyGoal * 100).toFixed(2) >= 100) {
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
                ipcRenderer.send("get-right-bicycle-power", [energyInJoules.toFixed(2)]);
                ipcRenderer.on("updated-right-bicycle-stats", (event, data) => {
                    opponentEnergyInJoules = data[0];
                })
            }
            else {
                ipcRenderer.send("get-left-bicycle-power", [energyInJoules.toFixed(2)]);
                ipcRenderer.on("updated-left-bicycle-stats", (event, data) => {
                    opponentEnergyInJoules = data[0];
                })
            }
            document.querySelector("#user-score-percentage").innerHTML = currentUserPercentage + "%";
            document.querySelector("#opponent-score-percentage").innerHTML = (opponentEnergyInJoules / energyGoal * 100).toFixed(2) + "%";
            
            // Update progress circle and percentage
            update_progress(((energyInJoules + opponentEnergyInJoules) / energyGoal * 100).toFixed(2), instantaneousPower);
        }

        if ((energyInJoules + opponentEnergyInJoules) / energyGoal * 100 >= 100) {
            commonGoalReached = true;
            show_results();
        }
    }
}

function duo_to_solo_challenge() {
    location.href = "start_screen.html?appliance=" + appliance + "&mode=Solo Mode" + "&duration=" + duration + "&display=" + display;
};


