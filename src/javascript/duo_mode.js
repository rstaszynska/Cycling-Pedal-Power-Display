const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let appliance = params.appliance;
let display = params.display;

function go_back() {
    location.href = "mode_selection.html?appliance=" + appliance;
}

function go_to_home() {
    location.href = "appliance_selection.html";
}

function select(mode) {
    if (mode === "compete") {
        location.href = "timer_duration_selection.html?appliance=" + appliance + "&mode=Competition Mode&display=" + display;
    } else if (mode === "cooperate") {
        location.href = "timer_duration_selection.html?appliance=" + appliance + "&mode=Cooperation Mode&display=" + display;
    }
}