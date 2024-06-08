document.addEventListener('DOMContentLoaded', function() {
    const textElement = document.getElementById('text');
    const text = textElement.textContent;
    let index = -5;
    const speed = 125; // typing speed in milliseconds

    function typeLetter() {
        if (index < text.length) {
            textElement.textContent = text.substring(0, index + 1);
            index++;
            setTimeout(typeLetter, speed);
        }
    }

    textElement.textContent = ''; // Clear the initial content
    typeLetter();
});
