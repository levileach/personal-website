
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
            // do nothing if it's hello text
        }
        else {
            typeLetter(textElements[i]);
        }
    }
}

function typeLetter(textElement) {
    const fullText = textElement.getAttribute("data-text");
    const typeFast = textElement.getAttribute("data-speed");

    let index = -5;
    let speed = 100;

    if (typeFast === null) {
        // do nothing
    }
    else if (typeFast == "fast") {
        speed = speed / 2;
    }
    else if (typeFast == "faster") {
        speed = speed / 6;
    }

    textElement.textContent = '';
    typeLetterHelper(textElement, fullText, index, speed);
}

function typeLetterHelper(textElement, fullText, index, speed) {
    if (index < fullText.length) {
        textElement.textContent = fullText.substring(0, index + 1);
        textElement.text = fullText.substring(0, index + 1);
        index++;
        setTimeout(typeLetterHelper, speed, textElement, fullText, index, speed);
    }
}


function toggleNav(clickedVal = "default") {
    const mainNav = document.getElementById("main-navigation");
    const projNav = document.getElementById("project-navigation");
    const abotNav = document.getElementById("about-navigation");

    // update the display mode
    if (clickedVal === "default") {
        mainNav.style.setProperty("display", "flex");
        projNav.style.setProperty("display", "none");
        abotNav.style.setProperty("display", "none");
    }
    else if (clickedVal === "projects") {
        mainNav.style.setProperty("display", "none");
        projNav.style.setProperty("display", "flex");
        abotNav.style.setProperty("display", "none");
    }
    else {
        mainNav.style.setProperty("display", "none");
        projNav.style.setProperty("display", "none");
        abotNav.style.setProperty("display", "flex");
    }

    typeLetters(renderHello = false);
}