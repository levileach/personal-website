
// play the typing animation upon page loading and rendering
document.addEventListener('DOMContentLoaded', function() {
    const textElements = Array.from(document.getElementsByClassName('play-animation'));
    typeLetters();
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
    const fullText = textElement.textContent;
    let index = 0;
    const speed = 100;
    textElement.textContent = '';
    typeLetterHelper(textElement, fullText, index, speed);
}

function typeLetterHelper(textElement, fullText, index, speed) {
    if (index < fullText.length) {
        textElement.textContent = fullText.substring(0, index + 1);
        index++;
        setTimeout(typeLetterHelper, speed, textElement, fullText, index, speed);
    }
}


function toggleProjects() {
    const mainNav = document.getElementById("main-navigation");
    const projNav = document.getElementById("project-navigation");


    // get our current display mode
    var r = document.querySelector(":root");
    var rs = getComputedStyle(r);
    var displayMode = rs.getPropertyValue("--site-display");
    console.log(displayMode);

    // update the display mode
    if (displayMode === "default") {
        r.style.setProperty("--site-display", "projects");
        mainNav.style.setProperty("display", "none");
        projNav.style.setProperty("display", "flex");
        typeLetters(renderHello = false);
    }
    else {
        r.style.setProperty("--site-display", "default");
        mainNav.style.setProperty("display", "flex");
        projNav.style.setProperty("display", "none");
        typeLetters(renderHello = false);
    }
}