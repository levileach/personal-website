

d3.csv("all_data.csv").then(function(all_data) {

    // add the menu options to the dropdown search menu
    function addMenuOptions() {
        let allSongs = []
        all_data.forEach(function(d) {
            let title = d["name"]
            let artist = "by " + formatArtist(d["artists"])
            let infoDict = {"artist": d["artists"], "title": d["name"], "text-display": title + " - " + artist}
            allSongs.push(infoDict)

        })

        allSongs.forEach(function(songDict) {
            d3.select("#dropdown-container")
                .data([songDict])
                .append("mark")
                .html(songDict["text-display"])
                .classed("song-menu-option", true)
        })

        // format the initial styling of all elements to be hidden
        let div = document.getElementById("dropdown-container");
        let a = div.getElementsByTagName("mark");
        let i;

        for (i = 0; i < a.length; i++) {
            a[i].style.display = "none";
        }
    }

    // format the string representing the artists of a track
    function formatArtist(artistName) {
        let noBrackets = artistName.replace("[", '').replace("]", '')

        return noBrackets.replaceAll("'", '').replaceAll('"', '')
    }

    addMenuOptions()

})