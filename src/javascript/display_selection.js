function select(display) {
    if (display === "large"){
        location.href = "large_display.html";
    }
    else {
        location.href = "welcome_screen.html?display=" + display;
    }
}