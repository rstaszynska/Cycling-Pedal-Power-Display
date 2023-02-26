function show_results() {

    challenge_is_ongoing = false;

    if (display == "left") {
        disconnectBicycle(1);
    }
    else {
        disconnectBicycle(2);
    }

    var applianceEnergyDurationInSeconds = 0;
    var applianceEnergyDuration = "";
    var generatedEnergyDuration = "";

    if (mode === "Solo Mode" || mode === "Competition Mode") {
        // Energy generated by the user in kWh
        var energyGeneratedkWh = (energyInJoules / 3600000).toFixed(5);
    }
    // Cooperation Mode
    else {
        var energyGeneratedkWh = ((energyInJoules + opponentEnergyInJoules) / 3600000).toFixed(5);
    }

    if (appliance === "toaster") {
        applianceEnergyDuration = "2 minutes (time required to toast two slices of bread)";
        applianceEnergyDurationInSeconds = 120;
    }
    else if (appliance === "kettle") {
        applianceEnergyDuration = "2 minutes and 15 seconds (time required to boil 1 litre of water)";
        applianceEnergyDurationInSeconds = 135.6;
    }
    else if (appliance === "washing machine") {
        applianceEnergyDuration = "one hour (one wash cycle)";
        applianceEnergyDurationInSeconds = 3600;
    }
    else if (appliance === "laptop"){
        applianceEnergyDuration = "one hour";
        applianceEnergyDurationInSeconds = 3600;
    }
    else if (appliance === "led light bulb") {
        applianceEnergyDuration = "one hour";
        applianceEnergyDurationInSeconds = 3600;
    }
    else if (appliance === "incandescent light bulb") {
        applianceEnergyDuration = "one hour";
        applianceEnergyDurationInSeconds = 3600;
    }

    // How long the generated energy could keep the appliance running
    var energyDurationInSeconds = (energyGeneratedkWh * 3600000 / energyGoal) * applianceEnergyDurationInSeconds;

    if (energyDurationInSeconds > 60) {
        var minutes = (energyDurationInSeconds - energyDurationInSeconds % 60) / 60;
        var seconds = energyDurationInSeconds % 60;
        generatedEnergyDuration = minutes + " minutes and " + Math.round(seconds) + " seconds";
    }
    else {
        generatedEnergyDuration = Math.round(energyDurationInSeconds) + " seconds";
    }
    // Based on a cost of £0.34 per 1 kWh of energy (British Gas)
    const cost = ((energyGoal / 3600000) * 0.34).toFixed(2);
    // Based on 193.38 grams of emissions per 1 kWh
    const carbonEmissions = Math.round((energyGoal / 3600000) * 193.38);

    
    var heading = document.querySelector("#heading");
    var subheading = document.querySelector("#subheading");
    document.querySelector("#progress-text").remove();
    document.querySelector("#progress-circle").remove();
    document.querySelector("#power-label").remove();
    document.querySelector("#power").remove();
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
        heading.innerHTML = "Your time is up...";
        if (mode === "Solo Mode") {
            subheading.innerHTML = "But you managed to generate " + (currentUserPercentage) + "% of the required energy!";
            resultText.innerHTML = "You weren't able to generate enough energy to run the " + appliance + " for " + applianceEnergyDuration + ", but you generated <b>" + energyGeneratedkWh + " kWh</b>, which is enough to run it for <b>" + generatedEnergyDuration + "</b>! Nice try! <br><br>";
        }
        else if (mode === "Cooperation Mode") {
            subheading.innerHTML = "But you managed to generate " + Math.round((energyInJoules + opponentEnergyInJoules) /  energyGoal * 100) + "% of the required energy!";
            resultText.innerHTML = "You weren't able to generate enough electricity to run the " + appliance + " for "+ applianceEnergyDuration +", but together you generated <b>" + energyGeneratedkWh + " kWh</b>, which is enough to run it for <b>" + generatedEnergyDuration + "</b>! Nice try! <br><br>";
        }
        else if (mode === "Competition Mode") {
            subheading.innerHTML = "Neither of you won the challenge. But you generated "+ currentUserPercentage + "% of the required energy!";
            resultText.innerHTML = "You weren't able to generate enough energy to run the " + appliance + " for " + applianceEnergyDuration + ", but you generated <b>" + energyGeneratedkWh + " kWh</b>, which is enough to run it for <b> " + generatedEnergyDuration + "</b>! Nice try! <br><br>";
        }
    }

    // Goal reached
    else {
        timer_paused = true;
        add_animation_effect();
        if (goalReached) {
            // Solo mode, player won
            heading.innerHTML = "Goal reached!";
            subheading.innerHTML = "You generated 100% of the required energy!";
            resultText.innerHTML = "You were able to generate enough energy to run the " + appliance + " for "+ applianceEnergyDuration + "! That's a total of <b>" + energyGeneratedkWh + " kWh</b>! Well done! <br><br>";
        }
        else if (userWon) {
            // Duo mode, player won
            heading.innerHTML = "You won the challenge!";
            subheading.innerHTML = "You generated 100% of the required energy!";
            resultText.innerHTML = "You were able to generate enough energy to run the " + appliance + " for " + applianceEnergyDuration + "! That's a total of <b>" + energyGeneratedkWh + " kWh</b>! Well done! <br><br>";
        }
        else if (opponentWon) {
            // Duo mode, opponent won
            heading.innerHTML = "Your opponent won the challenge";
            subheading.innerHTML = "But you managed to generate " + currentUserPercentage + "% of the required energy!";
            resultText.innerHTML = "You weren't able to generate enough energy to run the " + appliance + " for " + applianceEnergyDuration + ", but you generated <b>" + energyGeneratedkWh + " kWh</b>, which is enough to run it for <b>" + generatedEnergyDuration + "</b>! Nice try! <br><br>";
        }
        else if (commonGoalReached){
            // Duo cooperative mode, goal reached
            heading.innerHTML = "Goal reached!";
            subheading.innerHTML = "Together, you generated 100% of the required energy!";
            resultText.innerHTML = "You were able to generate enough energy to run the " + appliance + " for " + applianceEnergyDuration + "! That's a total of <b>" + (energyGeneratedkWh) + "  kWh</b>! Great teamwork! <br><br>";
        }
    }

    resultText.innerHTML += "On average, " + applianceEnergyDuration + " of " + appliance + " usage costs £" + cost + " and contributes approximately " + carbonEmissions + " grams of CO₂e. Check out the information on the large screen to understand this data in context.";
    document.getElementById("middle").appendChild(resultText);
    
    var retryButton = document.querySelector("#button");
    retryButton.innerHTML = "RETRY";
    retryButton.style.marginTop = "55%";
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