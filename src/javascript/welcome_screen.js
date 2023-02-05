const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let display = params.display;

if (display === "large") {
    document.querySelector("#touchscreen-message").remove();
}

function next() {
    location.href = "appliance_selection.html?display=" + display;
}