const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let appliance = params.appliance;
let mode = params.mode;
let display = params.display;

function go_back() {
    if (mode === "Solo Mode") {
        location.href = "mode_selection.html?appliance=" + appliance;
    } else {
        location.href = "duo_mode.html?appliance=" + appliance;
    }
}

function go_to_home() {
    location.href = "appliance_selection.html";
}

function select(duration) {
    location.href = "start_screen.html?appliance=" + appliance + "&mode=" + mode + "&duration=" + duration + "&display=" + display;
}