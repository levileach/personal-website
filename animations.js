
// play the typing animation upon page loading and rendering
document.addEventListener('DOMContentLoaded', function() {
    const textElements = Array.from(document.getElementsByClassName('play-animation'));
    typeLetters();
    toggleNav();
});


function typeLetters(renderHello = true) {
    const textElements = Array.from(document.getElementsByClassName('play-animation'));

    for (let i = 0; i < textElements.length; i++) {
        currElement = textElements[i];
        currElementID = currElement.id;

        if (renderHello == false && currElementID == "hello") {
            // do nothing if it's hello text and we don't want to render it
        }
        else {
            typeLetter(textElements[i]);
        }
    }
}


// type out the letters of the given text element
function typeLetter(textElement) {
    var text = textElement.innerText;
    var typeSpeed = textElement.getAttribute("data-speed");
    var elemSection = textElement.getAttribute("data-section")
    var currSection = getComputedStyle(document.body).getPropertyValue("--current-section");

    let currentIndex = 0;
    let speed = 60;

    if (typeSpeed == "fast") {
        speed = speed / 2
    }
    else if (typeSpeed == "faster") {
        speed = speed / 8
    }

    textElement.innerHTML = `<span style="color: rgba(0, 0, 0, 0)">${text}</span>`

    // change the color by making letters transparent if they aren't typed yet
    function changeColor() {
        if (currentIndex <= text.length && (elemSection == currSection || elemSection == "all")) {
            let lText = text.substring(0, currentIndex);
            let rText = text.substring(currentIndex, text.length);
            let rHTML = `<span style="color: rgba(0, 0, 0, 0)">${rText}</span>`
            let fHTML = lText + rHTML
            textElement.innerHTML = fHTML;
            currentIndex++;
            setTimeout(changeColor, speed);
        }
    }
    changeColor()
}


// clear out all the text whose animation should play
function clearText() {
    const textElements = Array.from(document.getElementsByClassName('play-animation'));

    for (let i = 0; i < textElements.length; i++) {
        let currElement = textElements[i];
        let currText = currElement.innerText;
        let elemSection = currElement.getAttribute("data-section");

        if (elemSection != "all") {
            currElement.innerHTML = `<span style="color: rgba(0, 0, 0, 0)">${currText}</span>`;
        }
    }
}


// toggle which main menu to display
function toggleNav(clickedVal = "default") {
    clearText();
    const mainNav = document.getElementById("main-navigation");
    const projNav = document.getElementById("project-navigation");
    const abotNav = document.getElementById("about-navigation");
    const contNav = document.getElementById("contact-navigation");
    var currSection = getComputedStyle(document.body).getPropertyValue("--current-section");

    // update the display mode
    if (clickedVal === "default") {
        document.documentElement.style.setProperty("--current-section", "default");
        mainNav.style.setProperty("display", "flex");
        projNav.style.setProperty("display", "none");
        abotNav.style.setProperty("display", "none");
        contNav.style.setProperty("display", "none");
    }
    else if (clickedVal === "projects") {
        document.documentElement.style.setProperty("--current-section", "projects");
        mainNav.style.setProperty("display", "none");
        projNav.style.setProperty("display", "flex");
        abotNav.style.setProperty("display", "none");
        contNav.style.setProperty("display", "none");
    }
    else if (clickedVal === "contact") {
        document.documentElement.style.setProperty("--current-section", "contact");
        mainNav.style.setProperty("display", "none");
        projNav.style.setProperty("display", "none");
        abotNav.style.setProperty("display", "none");
        contNav.style.setProperty("display", "flex");
    }
    else if (clickedVal === "about") {
        document.documentElement.style.setProperty("--current-section", "about");
        mainNav.style.setProperty("display", "none");
        projNav.style.setProperty("display", "none");
        abotNav.style.setProperty("display", "flex");
        contNav.style.setProperty("display", "none");
    }

    typeLetters(renderHello = false);
}