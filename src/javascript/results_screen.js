

function show_results() {

    challenge_is_ongoing = false;

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
        add_animation_effect();
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
    else if (appliance === "incandescent light bulb") {
        document.querySelector("#incandescent-light").classList += "fade-in-image";
        document.querySelector("#incandescent-light").style.opacity = "100%";
    }
    else if (appliance === "led light bulb") {
        document.querySelector("#led-light").classList += "fade-in-image";
        document.querySelector("#led-light").style.opacity = "100%";
    }
    else if (appliance === "kettle") {
        document.querySelector("#kettle").style.opacity = "50%";
    }
    else {
        document.querySelector("#toaster-bread-1").classList += "toast-bread-1";
        document.querySelector("#toaster-bread-1").style.marginTop = "-5px" ;
        document.querySelector("#toaster-bread-2").classList += "toast-bread-2";
        document.querySelector("#toaster-bread-2").style.marginTop = "-15px" ;
    }
}