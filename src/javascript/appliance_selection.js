const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let display = params.display;

function navigate(appliance) {
    location.href = "appliance_info.html?appliance=" + appliance + "&display=" + display;
}