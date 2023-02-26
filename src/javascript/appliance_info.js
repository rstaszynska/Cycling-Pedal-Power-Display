const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let appliance = params.appliance;
let display = params.display;

const appliance_img = document.querySelector("#appliance-img");
appliance_img.src = "../images/" + appliance.split(" ").join("") + ".png";



if (appliance === "led light bulb" || appliance === "kettle" || appliance === "laptop") {
    
    document.querySelector(".appliance-info").classList.add("darkblue");
    const name = document.querySelector("#appliance-name");
    const wattage = document.querySelector("#appliance-wattage");
    const cost = document.querySelector("#average-cost");
    const emissions = document.querySelector("#average-emissions");
    const question = document.querySelector("#appliance-name-q");
    var costValue = 0;
    var emissionsValue = 0;
    var energyRequired = 0; // Energy required in Joules

    if (appliance === "led light bulb") {
        energyRequired = 36000 * 10; // test value
        // Based on a cost of £0.34 per 1 kWh of energy (British Gas)
        costValue = ((energyRequired / 3600000) * 0.34).toFixed(2);
        // Based on 193.38 grams of emissions per 1 kWh
        emissionsValue = Math.round((energyRequired / 3600000) * 193.38);

        name.innerHTML = "LED Light Bulb";
        wattage.innerHTML = "Wattage: <b>10 W</b>";
        cost.innerHTML = "Cost per ten hours of usage: <b>£" + costValue + "</b>";
        emissions.innerHTML = "CO₂e emissions per ten hours of usage: <b>" + emissionsValue + " grams</b>";
        question.innerHTML = "Do you think you can keep the light on for 10 hours?";

    } else if (appliance === "kettle") {
        energyRequired = 406800;
        // Based on a cost of £0.34 per 1 kWh of energy (British Gas)
        costValue = ((energyRequired / 3600000) * 0.34).toFixed(2);
        // Based on 193.38 grams of emissions per 1 kWh
        emissionsValue = Math.round((energyRequired / 3600000) * 193.38);

        name.innerHTML = "Electric Kettle";
        wattage.innerHTML = "Wattage: <b>3000 W</b>";
        cost.innerHTML = "Cost per one hour of usage: <b>£" + costValue + "</b>";
        emissions.innerHTML = "CO₂e emissions per one hour of usage: <b>" + emissionsValue + " grams</b>";
        question.innerHTML = "Do you think you can boil 1 litre of water from room temperature?";

    } else if (appliance === "laptop") {
        energyRequired = 24840 * 10; // test value
        // Based on a cost of £0.34 per 1 kWh of energy (British Gas)
        costValue = ((energyRequired / 3600000) * 0.34).toFixed(2);
        // Based on 193.38 grams of emissions per 1 kWh
        emissionsValue = Math.round((energyRequired / 3600000) * 193.38);

        name.innerHTML = "Laptop";
        wattage.innerHTML = "Wattage (when idle): <b>6.9 W</b>";
        cost.innerHTML = "Cost per one hour of usage: <b>£" + costValue + "</b>";
        emissions.innerHTML = "CO₂e emissions per one hour of usage: <b>" + emissionsValue + " grams</b>";
        question.innerHTML = "Do you think you can keep a laptop running for 10 hours?";
        appliance_img.style.height = "60%";
        appliance_img.style.marginTop = "30%";
    }
}

else {
    document.querySelector(".appliance-info").classList.add("lightblue");
    const name = document.querySelector("#appliance-name");
    const wattage = document.querySelector("#appliance-wattage");
    const cost = document.querySelector("#average-cost");
    const emissions = document.querySelector("#average-emissions");
    const question = document.querySelector("#appliance-name-q");
    var costValue = 0;
    var emissionsValue = 0;
    var energyRequired = 0; // Energy required in Joules

    if (appliance === "incandescent light bulb") {
        energyRequired = 360000 * 10; // test value
        // Based on a cost of £0.34 per 1 kWh of energy (British Gas)
        costValue = ((energyRequired / 3600000) * 0.34).toFixed(2);
        // Based on 193.38 grams of emissions per 1 kWh
        emissionsValue = Math.round((energyRequired / 3600000) * 193.38);

        name.innerHTML = "Incandescent Light Bulb";
        wattage.innerHTML = "Wattage: <b>100 W</b>";
        cost.innerHTML = "Cost per ten hours of usage: <b>£" + costValue + "</b>";
        emissions.innerHTML = "CO₂e emissions per ten hours of usage: <b>" + emissionsValue + " grams</b>";
        question.innerHTML = "Do you think you can keep the light on for 10 hours?";

    } else if (appliance === "toaster") {
        energyRequired = 84000;
        // Based on a cost of £0.34 per 1 kWh of energy (British Gas)
        costValue = ((energyRequired / 3600000) * 0.34).toFixed(2);
        // Based on 193.38 grams of emissions per 1 kWh
        emissionsValue = Math.round((energyRequired / 3600000) * 193.38);

        name.innerHTML = "Toaster";
        wattage.innerHTML = "Wattage: <b>700 W</b>";
        cost.innerHTML = "Cost per one usage (two slices of bread): <b>£" + costValue + "</b>";
        emissions.innerHTML = "CO₂e emissions per one usage: <b>" + emissionsValue + " grams</b>";
        question.innerHTML = "Do you think you can toast two slices of bread?";
        appliance_img.style.height = "60%";
        appliance_img.style.marginTop = "30%";

    } else if (appliance === "washing machine") {
        energyRequired = 3240000; 
        // Based on a cost of £0.34 per 1 kWh of energy (British Gas)
        costValue = ((energyRequired / 3600000) * 0.34).toFixed(2);
        // Based on 193.38 grams of emissions per 1 kWh
        emissionsValue = Math.round((energyRequired / 3600000) * 193.38);

        name.innerHTML = "Washing Machine";
        wattage.innerHTML = "Wattage: <b>900 W</b>";
        cost.innerHTML = "Cost per one hour of usage: <b>£" + costValue + "</b>";
        emissions.innerHTML = "CO₂e emissions per one hour of usage: <b>" + emissionsValue + " grams</b>";
        question.innerHTML = "Do you think you can run one laundry cycle (1 hour)?";
    }
}

function go_back() {
    location.href = "appliance_selection.html?display=" + display;
}

function select() {
    location.href = "mode_selection.html?appliance=" + appliance + "&display=" + display;
}