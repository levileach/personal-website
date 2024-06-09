document.addEventListener('DOMContentLoaded', function() {
//    const textElement = document.getElementById('text');
    const textElements = Array.from(document.getElementsByClassName('play-animation'));
//    Array.from(textElements).forEach((textElement) => typeLetter(textElement));

    for (let i = 0; i < textElements.length; i++) {
      setTimeout(doNothing, 10000)
      typeLetter(textElements[i])
      setTimeout(doNothing, 5000)
    }
});

function typeLetter(textElement) {
    const fullText = textElement.textContent;
    let index = -5;
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

function doNothing() {
    console.log('Timeout')
}
