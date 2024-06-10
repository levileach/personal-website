let attributes = ['Acousticness', 'Danceability', 'Energy', 'Liveness', 'Speechiness', 'Valence']

// set the dimensions and margins of the bar graph
let barMargin = {top: 40, right: 20, bottom: 60, left: 60},
    barWidth = Math.max(windowWidth, minWidth) * 0.75 - barMargin.left - barMargin.right,
    barHeight = 500 - barMargin.top - barMargin.bottom;

// initialize the SVG object for the scatter plot
let barSVG = d3.select("#search-viz")
    .append("svg")
    .attr("id", "bar-svg-main")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");

// set the width of the median marker for the final graph
let medianMarkerWidth = 5

// initialize the value for the user's previous scroll position
let previousScrollBar = 10000;

d3.csv("all_data.csv").then(function(data) {
    d3.csv("medians.csv").then(function(medianData) {


        // add an event listener so the visualization can be resized when the window is resized
        // and one to animate the bars moving when the user scrolls into position
        window.addEventListener("resize", redraw);
        window.addEventListener("scroll", animateScroll);


        // nest the data so songs can be retrieved by their name and artist
        let nestedData = d3.group(data, (d) => d["artists"], (d) => d["name"])

        // adjust the attribute values to be numbers
        medianData.forEach(function(d) {
            d["value"] = +d["value"]
        })

        // initialize the domain and range of the x axis
        let x = d3.scaleBand()
            .domain(attributes)
            .range([0, barWidth])
            .padding(0.2)

        // initialize the domain and range of the y axis
        let y = d3.scaleLinear()
            .domain([0, 1])
            .range([barHeight, 0])

        // add the x axis to the bar graph
        barSVG.append("g")
            .attr("transform", "translate(0," + barHeight + ")")
            .call(d3.axisBottom(x))
            .attr("class", "x axis")
            .attr("id", "x-axis-bar");

        // add the y axis to the bar graph
        barSVG.append("g")
            .call(d3.axisLeft(y))
            .attr("class", "y axis")
            .attr("id", "y-axis-bar")

        // add the x-axis label to the bar graph
        barSVG.append("text")
            .attr("y", (barHeight + barMargin.bottom - 10))
            .attr("x", (barWidth / 2))
            .style("text-anchor", "middle")
            .text("Attribute")
            .classed("axis-label", true)
            .classed("x-label", true)
            .attr("id", "x-label-bar");

        // add the y-axis label to the bar graph
        barSVG.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -barMargin.left)
            .attr("x", 0 - (barHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Value")
            .classed("axis-label", true)
            .classed("y-label", true);

        // add the horizontal grid lines
        barSVG.append("g")
            .classed("grid", true)
            .classed("horiz-grid", true)
            .attr("id", "horiz-grid-bar")
            .call(d3.axisLeft(y)
                .tickSize(-barWidth)
                .tickFormat(""));

        // add the intial bars for the track data
        barSVG
            .selectAll(".track-bar")
            .data(medianData)
            .enter()
            .append("rect")
            .attr("x", function(d) {return x(d["attribute"])})
            .attr("y", function(d) {return y(d["value"])})
            .attr("rx", "5px")
            .attr("ry", "5px")
            .attr("width", x.bandwidth())
            .classed("track-bar", true)
            .attr("height", function(d) {return barHeight - y(d["value"])})
            .style("fill", accentColor)
            .style("opacity", 0.7)

        // add the lines for the median markers
        barSVG
            .selectAll(".median-marker")
            .data(medianData)
            .enter()
            .append("rect")
            .classed("median-marker", true)
            .attr("x", function(d) {return x(d["attribute"])})
            .attr("y", function(d) {return y(d["value"])})
            .attr("width", function() {return x.bandwidth()})
            .attr("height", medianMarkerWidth)
            .style("rx", "5px")
            .attr("transform", "translate(0," + (medianMarkerWidth * -0.5) + ")")
            .style("fill", secondColor)


        // add the legend text
        barSVG.append("text")
            .text("= database median")
            .attr("x", barWidth - 110)
            .attr("y", -15)
            .style("font-size", "13px")
            .attr("id", "legend-text-bar")
            .attr("fill", secondColor)

        // add the rect for the legend
        barSVG.append("rect")
            .attr("width", 50)
            .attr("height", medianMarkerWidth)
            .attr("x", barWidth - 120)
            .attr("y", -20)
            .style("rx", "5px")
            .style("fill", secondColor)
            .attr("transform", "translate(-50, 0)")
            .attr("id", "legend-rect-bar")


        // add the clicking functionality to the song options in the dropdown menu so when a song is clicked
        // the bar graph updated
        let allMarks = Array.from(d3.selectAll(".song-menu-option"))
        allMarks.forEach(function(m) {
            d3.select(m)
                .on("click", function() {
                    let songData = d3.select(m).data()
                    updateBars(songData[0])

                    // update the text section containing the name of the currently graphed track
                    d3.select("#current-song-info")
                        .html("Current track: " + songData[0]["text-display"])
                })
        })

        // update the bars in the bar graph when a new song is clicked in the dropdown menu
        function updateBars(songData) {
            let songArtist = songData["artist"]
            let songTitle = songData["title"]
            let songAttributes = getSongData(songArtist, songTitle)[0]

            // adjust the positions of all the bars
            barSVG.selectAll(".track-bar")
                .each(function() {
                    let attribute = d3.select(this).data()[0]["attribute"].toLowerCase()
                    d3.select(this)
                        .transition()
                        .ease(d3.easeCubic)
                        .duration(transitionDuration * Math.max(Math.random(), 0.8))
                        .attr("y", y(songAttributes[attribute]))
                        .attr("height", barHeight - y(songAttributes[attribute]))
                })
        }

        // get the data for a song given its artist and title
        function getSongData(songArtist, songTitle) {
            return nestedData.get(songArtist).get(songTitle)
        }

        // redraw the visualization when the user changes the width of the window
        function redraw() {

            // adjust the dimensions of the graph
            barWidth = Math.max(window.innerWidth, minWidth) * 0.75 - scatterMargin.left - scatterMargin.right;

            // adjust the width of the svg
            d3.select("#bar-svg-main").attr("width", barWidth + barMargin.left + barMargin.right)

            // adjust the range of the x axis and redraw it
            x.range([0, barWidth])
            d3.select("#x-axis-bar").call(d3.axisBottom(x))

            // change the horizontal grid lines for the new scale
            d3.select("#horiz-grid-bar")
                .call(d3.axisLeft(y)
                    .tickSize(-barWidth)
                    .tickFormat(""));

            // adjust the x positions and widths of all median lines on the graph
            d3.selectAll(".median-marker")
                .attr("x", function(d) {return x(d["attribute"])})
                .attr("width", x.bandwidth())

            // adjust the x positions and widths of all the bars on the graph
            d3.selectAll(".track-bar")
                .attr("x", function(d) {return x(d["attribute"])})
                .attr("width", x.bandwidth())

            // adjust the position of the x axis label
            d3.select("#x-label-bar").attr("x", (barWidth / 2))

            // adjust the position of the legend text
            d3.select("#legend-text-bar").attr("x", barWidth - 110)

            // adjust the position of the legend rectangle
            d3.select("#legend-rect-bar").attr("x", barWidth - 120)
        }

        // animate the bars moving when the user scrolls into position
        function animateScroll() {
            let documentScroll = document.documentElement.scrollTop;

            if (documentScroll >= 2500 && previousScrollBar < 2500) {
                animateBar()
            }
            else if (documentScroll < 2200) {
                // hide the bars
                d3.selectAll(".track-bar")
                    .attr("y", barHeight)
                    .attr("height", 0)

                // reset the positions of the median markers
                d3.selectAll(".median-marker").attr("y", barHeight)
            }
            previousScrollBar = documentScroll
        }

        // animate the bars coming into view when the user scrolls to the correct position
        function animateBar() {

            // first, hide the bars
            d3.selectAll(".track-bar")
                .attr("y", barHeight)
                .attr("height", 0)

            // animate the bars into position
            d3.selectAll(".track-bar")
                .transition()
                .ease(d3.easeCubic)
                .duration(transitionDuration * Math.max(0.4, Math.random()))
                .attr("y", function(d) {return y(d["value"])})
                .attr("height", function(d) {return barHeight - y(d["value"])})

            // reset the positions of the median markers
            d3.selectAll(".median-marker").attr("y", barHeight)
            d3.selectAll(".median-marker")
                .transition()
                .ease(d3.easeCubic)
                .duration(transitionDuration)
                .attr("y", function(d) {return y(d["value"])})
        }

        // redraw the graph upon loading
        redraw()
    })
})


// ------------------------------------------------------------------------------------------
// ---------- DROPDOWN MENU FUNCTIONS -------------------------------------------------------
// ------------------------------------------------------------------------------------------

// toggle between hiding and showing the dropdown menu when the user clicks the button
function toggleDropdown() {
    document.getElementById("dropdown-container").classList.toggle("show");
}

// filter the dropdown menu as the user types
function filterDropdown() {
    let input, filter, a, i;

    // get the current user input in the search bar converted to uppercase
    input = document.getElementById("song-search");
    filter = input.value.toUpperCase();

    // get the dropdown menu div and the elements inside
    let div = document.getElementById("dropdown-container");
    a = div.getElementsByTagName("mark");
    let shownSongs = 0

    for (i = 0; i < a.length; i++) {
        let txtValue = a[i].textContent || a[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1 && shownSongs <= 5) {
            a[i].style.display = "";
            shownSongs += 1;
        }
        // else if (shownSongs >= 3) {
        //     break;
        // }
        else {
            a[i].style.display = "none";
        }
    }
}
