const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let appliance = params.appliance;
let mode = params.mode;
let display = params.display;


function go_back() {
    if (mode === "Solo Mode") {
        location.href = "mode_selection.html?appliance=" + appliance + "&display=" + display;
    } else {
        location.href = "duo_mode.html?appliance=" + appliance + "&display=" + display;
    }
}

function go_to_home() {
    location.href = "appliance_selection.html?display=" + display;
}

function select(duration) {
    if (mode === "Solo Mode") {
        location.href = "start_screen.html?appliance=" + appliance + "&mode=" + mode + "&duration=" + duration + "&display=" + display;
    }
    else {
        location.href = "synchronization_screen.html?appliance=" + appliance + "&mode=" + mode + "&duration=" + duration + "&display=" + display;
    }
}