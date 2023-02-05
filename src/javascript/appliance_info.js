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
    const usage = document.querySelector("#average-usage");
    const cost = document.querySelector("#average-cost");
    const emissions = document.querySelector("#average-emissions");
    const question = document.querySelector("#appliance-name-q");
    if (appliance === "led light bulb") {
        name.innerHTML = "LED Light Bulb";
        wattage.innerHTML = "Wattage: <b>10 W</b>";
        // usage.innerHTML = "Average monthly household usage: <b>kWh</b>";
        cost.innerHTML = "Cost per ten hours of usage: <b>£0.03</b>";
        emissions.innerHTML = "CO₂e emissions per ten hours of usage: <b>0.02 kg</b>";
        question.innerHTML = "Do you think you can power on an LED Light Bulb?";

    } else if (appliance === "kettle") {
        name.innerHTML = "Electric Kettle";
        wattage.innerHTML = "Wattage: <b>3000 W</b>";
        // usage.innerHTML = "Average monthly household usage: <b>kWh</b>";
        cost.innerHTML = "Cost per one hour of usage: <b>£1.02</b>";
        emissions.innerHTML = "CO₂e emissions per one hour of usage: <b>0.58 kg</b>";
        question.innerHTML = "Do you think you can power on a Kettle?"

    } else if (appliance === "laptop") {
        name.innerHTML = "Laptop";
        wattage.innerHTML = "Wattage (max CPU): <b>430 W</b>";
        // usage.innerHTML = "Average monthly household usage: <b>kWh</b>";
        cost.innerHTML = "Cost per one hour of usage: <b>£0.15</b>";
        emissions.innerHTML = "CO₂e emissions per one hour of usage: <b>0.08 kg</b>";
        question.innerHTML = "Do you think you can power on a Laptop?"
        appliance_img.style.height = "60%";
        appliance_img.style.marginTop = "30%";
    }
}

else {
    document.querySelector(".appliance-info").classList.add("lightblue");
    const name = document.querySelector("#appliance-name");
    const wattage = document.querySelector("#appliance-wattage");
    const usage = document.querySelector("#average-usage");
    const cost = document.querySelector("#average-cost");
    const emissions = document.querySelector("#average-emissions");
    const question = document.querySelector("#appliance-name-q");

    if (appliance === "incandescent light bulb") {
        name.innerHTML = "Incandescent Light Bulb";
        wattage.innerHTML = "Wattage: <b>100 W</b>";
        // usage.innerHTML = "Average monthly household usage: <b>kWh</b>";
        cost.innerHTML = "Cost per ten hours of usage: <b>£0.34</b>";
        emissions.innerHTML = "CO₂e emissions per ten hours of usage: <b>0.19 kg</b>";
        question.innerHTML = "Do you think you can power on an Incandescent Light Bulb?"

    } else if (appliance === "toaster") {
        name.innerHTML = "Toaster";
        wattage.innerHTML = "Wattage: <b>850 W</b>";
        // usage.innerHTML = "Average monthly household usage: <b>kWh</b>";
        cost.innerHTML = "Cost per one hour of usage: <b>£0.29</b>";
        emissions.innerHTML = "CO₂e emissions per one hour of usage: <b>0.16 kg</b>";
        question.innerHTML = "Do you think you can power on a Toaster?"
        appliance_img.style.height = "60%";
        appliance_img.style.marginTop = "30%";

    } else if (appliance === "washing machine") {
        name.innerHTML = "Washing Machine";
        wattage.innerHTML = "Wattage: <b>900 W</b>";
        // usage.innerHTML = "Average monthly household usage: <b>kWh</b>";
        cost.innerHTML = "Cost per one hour of usage: <b>£0.90</b>";
        emissions.innerHTML = "CO₂e emissions per one hour of usage: <b>0.17 kg</b>";
        question.innerHTML = "Do you think you can power on a Washing Machine?"
    }
}

function go_back() {
    location.href = "appliance_selection.html?display=" + display;
}

function select() {
    location.href = "mode_selection.html?appliance=" + appliance + "&display=" + display;
}