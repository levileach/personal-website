
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
    const text = textElement.innerText;
    const typeSpeed = textElement.getAttribute("data-speed");
    let currentIndex = 0;
    let speed = 100;

    if (typeSpeed == "fast") {
        speed = speed / 2
    }
    else if (typeSpeed == "faster") {
        speed = speed / 6
    }

    textElement.innerHTML = `<span style="color: rgba(0, 0, 0, 0)">${text}</span>`

    // change the color by making letters transparent if they aren't typed yet
    function changeColor() {
        if (currentIndex <= text.length) {
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




// toggle which main menu to display
function toggleNav(clickedVal = "default") {
    const mainNav = document.getElementById("main-navigation");
    const projNav = document.getElementById("project-navigation");
    const abotNav = document.getElementById("about-navigation");
    const contNav = document.getElementById("contact-navigation");

    // update the display mode
    if (clickedVal === "default") {
        mainNav.style.setProperty("display", "flex");
        projNav.style.setProperty("display", "none");
        abotNav.style.setProperty("display", "none");
        contNav.style.setProperty("display", "none");
    }
    else if (clickedVal === "projects") {
        mainNav.style.setProperty("display", "none");
        projNav.style.setProperty("display", "flex");
        abotNav.style.setProperty("display", "none");
        contNav.style.setProperty("display", "none");
    }
    else if (clickedVal === "contact") {
        mainNav.style.setProperty("display", "none");
        projNav.style.setProperty("display", "none");
        abotNav.style.setProperty("display", "none");
        contNav.style.setProperty("display", "flex");
    }
    else if (clickedVal === "about") {
        mainNav.style.setProperty("display", "none");
        projNav.style.setProperty("display", "none");
        abotNav.style.setProperty("display", "flex");
        contNav.style.setProperty("display", "none");
    }

    typeLetters(renderHello = false);
}




//function typeLetter(textElement) {
//    const fullText = textElement.getAttribute("data-text");
//    const typeFast = textElement.getAttribute("data-speed");
//
//    let index = 0;
//    let speed = 100;
//
//    if (typeFast === null) {
//        // do nothing
//    }
//    else if (typeFast == "fast") {
//        speed = speed / 2;
//    }
//    else if (typeFast == "faster") {
//        speed = speed / 5;
//    }
//
//    textElement.textContent = '';
//    typeLetterHelper(textElement, fullText, index, speed);
//}
//
//function typeLetterHelper(textElement, fullText, index, speed) {
//    if (index < fullText.length) {
//        textElement.textContent = fullText.substring(0, index + 1);
//        textElement.text = fullText.substring(0, index + 1);
//        index++;
//        setTimeout(typeLetterHelper, speed, textElement, fullText, index, speed);
//    }
//}