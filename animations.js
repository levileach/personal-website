
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
        currElementSection = currElement.getAttribute("data-section");

        if (renderHello == false && currElementSection == "all") {
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
    else if (typeSpeed == "slow") {
        speed = speed * 2
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
    const sectionIntro = document.getElementById("section-intro");
    const sectionAbout = document.getElementById("section-about");
    const sectionLinks = document.getElementById("section-links");
    const subsectionContact = document.getElementById("subsection-contact");
    const subsectionProject = document.getElementById("subsection-projects");
    const subsectionSpotify = document.getElementById("subsection-spotify");
    var currSection = getComputedStyle(document.body).getPropertyValue("--current-section");


    // update the display mode
    if (clickedVal === "default") {
        document.documentElement.style.setProperty("--current-section", "default");
        sectionIntro.style.setProperty("display", "flex");
        sectionAbout.style.setProperty("display", "flex");
        sectionLinks.style.setProperty("display", "flex");
        subsectionContact.style.setProperty("display", "none");
        subsectionProject.style.setProperty("display", "none");
        subsectionSpotify.style.setProperty("display", "none");
    }

    else if (clickedVal === "contact") {
        document.documentElement.style.setProperty("--current-section", "contact");
        sectionIntro.style.setProperty("display", "flex");
        sectionAbout.style.setProperty("display", "flex");
        sectionLinks.style.setProperty("display", "none");
        subsectionContact.style.setProperty("display", "flex");
        subsectionProject.style.setProperty("display", "none");
        subsectionSpotify.style.setProperty("display", "none");
    }

    else if (clickedVal === "projects") {
        document.documentElement.style.setProperty("--current-section", "projects");
        sectionIntro.style.setProperty("display", "flex");
        sectionAbout.style.setProperty("display", "flex");
        sectionLinks.style.setProperty("display", "none");
        subsectionContact.style.setProperty("display", "none");
        subsectionProject.style.setProperty("display", "flex");
        subsectionSpotify.style.setProperty("display", "none");
    }

    else if (clickedVal === "spotify") {
        document.documentElement.style.setProperty("--current-section", "spotify");
        sectionIntro.style.setProperty("display", "flex");
        sectionAbout.style.setProperty("display", "flex");
        sectionLinks.style.setProperty("display", "none");
        subsectionContact.style.setProperty("display", "none");
        subsectionProject.style.setProperty("display", "none");
        subsectionSpotify.style.setProperty("display", "flex");
    }

    typeLetters(renderHello = false);
}