const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let appliance = params.appliance;
let display = params.display;

function go_back() {
    location.href = "appliance_info.html?appliance=" + appliance;
}

function go_to_home() {
    location.href = "appliance_selection.html";
}

function select(mode) {
    if (mode === "solo mode") {
        location.href = "timer_duration_selection.html?appliance=" + appliance + "&mode=Solo Mode&display=" + display;
    } else {
        location.href = "duo_mode.html?appliance=" + appliance + "&display=" + display;
    }
}