const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let appliance = params.appliance;
let display = params.display;

function go_back() {
    location.href = "mode_selection.html?appliance=" + appliance + "&display=" + display;
}

function go_to_home() {
    location.href = "appliance_selection.html" + "&display=" + display;
}

function select(mode) {
    location.href = "timer_duration_selection.html?appliance=" + appliance + "&mode=" + mode + "&display=" + display;  
}