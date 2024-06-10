
// get the width of the screen to set the sizing of the plot
let windowWidthLine = window.innerWidth;
let minWidthLine = +getComputedStyle(document.documentElement).getPropertyValue("--site-min-width")
let backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--background-color")
let secondColor = getComputedStyle(document.documentElement).getPropertyValue("--second-color")

// set the dimensions and margins of the graph
let lineMargin = {top: 10, right: 150, bottom: 60, left: 60},
    lineWidth = Math.max(windowWidthLine, minWidthLine) * 0.75 - lineMargin.left - lineMargin.right,
    lineHeight = 500 - lineMargin.top - lineMargin.bottom;

// create the format for parsing the date strings into actual date values
let parseTime = d3.timeParse("%Y");

// initialize the opacities of the objects in the visualizations
let opacity = {default: 0.8, hidden: 0, unselected: 0.2}

// set the x-position of the selection menu
let menuXPosition = lineWidth + lineMargin.left + 10

// initialize the user's last scroll position
let previousScroll = 10000;

// initialize the svg container for the entire visualization
let lineSVG = d3.select("#line-viz")
    .append("svg")
    .attr("id", "line-svg")
    .attr("width", lineWidth + lineMargin.left + lineMargin.right)
    .attr("height", lineHeight + lineMargin.top + lineMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")")


d3.csv("spotify_yearly.csv").then(function(data) {

    // initialize the list of possible attributes to graph on the axes and the color palette to be used
    let axisOptions = ['danceability', 'acousticness', 'energy', 'liveness', 'speechiness', 'valence', 'explicit']

    // convert the year to a date and the other columns to numbers
    data.forEach(function(d) {
        d.year = parseTime(d.year);
        axisOptions.forEach(function(a) {
            d[a] = +d[a]
        })
    })

    // set the color palette for the lines representing each attribute
    let colorPalette = d3.scaleOrdinal()
        .domain(axisOptions)
        .range(["DARKSLATEGRAY", "#63A088", "#56638A", "#483A58", "#56203D", "ORANGE", "#E75A7C"])


    // add an event listener so the visualization can be resized when the window is resized
    // and one to animate the bars moving when the user scrolls into position
    window.addEventListener("resize", redraw);
    window.addEventListener("scroll", animateScroll)

    // initialize the domain and range of the x axis
    let x = d3.scaleTime()
        .domain(d3.extent(data, function(d) {return d.year}))
        .range([0, lineWidth])

    // initialize the domain and range of the y axis
    let y = d3.scaleLinear()
        .domain(getFullDomain())
        .range([lineHeight, 0])

    // add the x axis to the svg
    lineSVG.append("g")
        .call(d3.axisBottom(x))
        .attr("transform", "translate(0," + lineHeight + ")")
        .attr("class", "x axis")
        .attr("id", "x-axis-line")

    // add the y axis to the svg
    lineSVG.append("g")
        .call(d3.axisLeft(y))
        .attr("class", "y axis")
        .attr("id", "y-axis-line")


    // add the axis option selections to the top of the svg
    let lineSelector = lineSVG.selectAll(".line-legend")
        .data(axisOptions)
        .enter().append("g")
        .attr("class", "line-legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 40 + ")"; });

    // add the text title to the option selection menu
    lineSVG.append("text")
        .attr("x", menuXPosition)
        .attr("y", 10)
        .classed("menu-option-object", true)
        .text("Click to Filter")
        .style("fill", secondColor)
        .style("font-size", "14px")
        .style("font-style", "italic")
        .style("text-anchor", "middle")


    // add the background rectangles for the attribute selection menu
    lineSelector.append("rect")
        .attr("width", 120)
        .attr("height", 30)
        .attr("id", function(d) {return "selection-rect-" + d})
        .attr("x", menuXPosition)
        .attr("y", 20)
        .style("fill", function(d) {return colorPalette(d)})
        .style("rx", "3px")
        .style("ry", "3px")
        .style("opacity", opacity.default)
        .attr("transform", "translate(-60, 0)")
        .classed("selected-line-option", true)
        .classed("menu-option-object", true)
        .on("click", function() {optionClicked(d3.select(this).data()[0])})
        .on("mouseover", function() {optionMouseover(d3.select(this).data()[0])})
        .on("mouseout", function() {optionMouseout(d3.select(this).data()[0])})

    // add the text options for the attribute selection menu
    lineSelector.append("text")
        .attr("x", menuXPosition)
        .attr("y", 40)
        .attr("id", function(d) {return "selection-text-" + d})
        .text(function(d) {return toTitleCase(d);})
        .style("fill", backgroundColor)
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .classed("selected-line-option", true)
        .classed("menu-option-object", true)
        .on("click", function() {optionClicked(d3.select(this).text().toLowerCase());})
        .on("mouseover", function() {optionMouseover(d3.select(this).text().toLowerCase())})
        .on("mouseout", function() {optionMouseout(d3.select(this).text().toLowerCase())})


    // adjust the legend and add/remove a line from the visualization when a legend option is clicked
    function optionClicked(attribute) {
        let rectAttribute = d3.select("#selection-rect-" + attribute)
        let textAttribute = d3.select("#selection-text-" + attribute)
        let lineAttribute = d3.select("#value-line-" + attribute)

        if (rectAttribute.classed("selected-line-option")) {
            rectAttribute.classed("selected-line-option", false)
            textAttribute.classed("selected-line-option", false)
            lineAttribute.classed("selected-line", false)
            rectAttribute.style("opacity", opacity.unselected)
        }
        else {
            rectAttribute.classed("selected-line-option", true)
            textAttribute.classed("selected-line-option", true)
            lineAttribute.classed("selected-line", true)
            rectAttribute.style("opacity", opacity.default)
        }

        // redraw the y axis
        y.domain(getYDomain())
        d3.select("#y-axis-line")
            .transition()
            .duration(transitionDuration)
            .call(d3.axisLeft(y))

        setLineStyling()
    }

    // highlight the rectangles/text in the menu when they are hovered on
    function optionMouseover(attribute) {
        let rectAttribute = d3.select("#selection-rect-" + attribute)
        rectAttribute.style("fill", secondColor)
    }

    // un-highlight the rectangles/text in the menu when they are hovered off
    function optionMouseout(attribute) {
        let rectAttribute = d3.select("#selection-rect-" + attribute)
        rectAttribute.style("fill", colorPalette(attribute))
    }

    // add the horizontal grid lines
    lineSVG.append("g")
        .classed("grid", true)
        .classed("horiz-grid-line", true)
        .attr("id", "horiz-grid-line")
        .call(d3.axisLeft(y)
            .tickSize(-lineWidth)
            .tickFormat(""));

    // add the vertical grid lines
    lineSVG.append("g")
        .classed("grid", true)
        .classed("verti-grid-line", true)
        .attr("id", "verti-grid-line")
        .call(d3.axisBottom(x)
            .tickSize(lineHeight)
            .tickFormat(""));

    // add the lines for each of the attributes in the visualization
    axisOptions.forEach(function(attribute) {
        let optionLine = d3.line()
            .x(function(d) {return x(d.year)})
            .y(function(d) {return y(d[attribute.toLowerCase()])})

        lineSVG.append("path")
            .data([data])
            .style("stroke", colorPalette(attribute.toLowerCase()))
            .style("stroke-width", "3px")
            .style("opacity", opacity.default)
            .attr("d", optionLine)
            .classed("value-line", true)
            .attr("id", "value-line-" + attribute)
            .classed("selected-line", true)
    })


    // add the x-axis label
    lineSVG.append("text")
        .attr("x", lineWidth / 2)
        .attr("y", lineHeight - lineMargin.top + lineMargin.bottom)
        .style("text-anchor", "middle")
        .text("Year")
        .classed("axis-label", true)
        .attr("id", "x-label-line");

    // add the y-axis label
    lineSVG.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - lineMargin.left)
        .attr("x", 0 - (lineHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Value")
        .classed("axis-label", true);

    // add the brush to the line chart
    let lineBrush = d3.brushX()
        .extent([[0, 0], [lineWidth, lineHeight]])
        .on("end", updateBrushed)
    lineSVG.call(lineBrush)

    // select the rest button to reset the chart when the button is clicked
    d3.select("#reset-line").on("click", resetLine)

    // reset the lines and axes when the reset button is clicked
    function resetLine() {
        let minYear = d3.min(data, function(d) {return d.year})
        let maxYear = d3.max(data, function(d) {return d.year})

        updateZoom(minYear, maxYear)
    }

    // redraw the visualization when the screen size has changed
    function redraw() {
        // compute the new width of the svg file
        lineWidth = Math.max(window.innerWidth, minWidthLine) * 0.75 - lineMargin.left - lineMargin.right
        menuXPosition = lineWidth + lineMargin.left + 10

        // adjust the width of the SVG itself
        d3.select("#line-svg").attr("width", lineWidth + lineMargin.left + lineMargin.right)

        // adjust the x-axis scale and redraw it
        x.range([0, lineWidth])
        d3.select("#x-axis-line").call(d3.axisBottom(x))

        // change the vertical grid lines for the new scale
        d3.select("#verti-grid-line")
            .call(d3.axisBottom(x)
                .tickSize(lineHeight)
                .tickFormat(""))

        // change the horizontal grid lines for the new scale
        d3.select("#horiz-grid-line")
            .call(d3.axisLeft(y)
                .tickSize(-lineWidth)
                .tickFormat(""));

        // move the menu
        d3.selectAll(".menu-option-object").attr("x", menuXPosition)

        // adjust all of the lines
        axisOptions.forEach(function(attribute) {
            let optionLine = d3.line()
                .x(function(d) {return x(d.year)})
                .y(function(d) {return y(d[attribute.toLowerCase()])})

            let lineID = "#value-line-" + attribute
            d3.select(lineID).attr("d", optionLine)
        })

        // change the extent of the brush
        lineBrush.extent([[0, 0], [lineWidth, lineHeight]])
        lineSVG.call(lineBrush)

        d3.select("#x-label-line").attr("x", lineWidth / 2)
    }


    // when the brush is changed, adjust the scale of the axes and lines drawn
    function updateBrushed(brushEvent) {
        let extent = brushEvent.selection;
        let year0 = getYearAt(extent[0])
        let year1 = getYearAt(extent[1])

        updateZoom(year0, year1)

        // clear the brush
        lineSVG.call(lineBrush.move, null)
    }

    // add the path clipping so the lines don't overlap the axes when the time scale is changed
    lineSVG.append("clipPath")
        .attr("id", "line-clip-rect")
        .append("rect")
        .attr("x", 0)
        .attr("y", -10)
        .attr("width", x.range()[1] - x.range()[0])
        .attr("height", y.range()[0] - y.range()[1] + 10)

    // update the zoom of the graph to only show data between the two given years (inclusive)
    function updateZoom(minYear, maxYear) {

        // adjust the domain of the x axis and redraw it
        x.domain([minYear, maxYear])
        d3.select("#x-axis-line")
            .transition()
            .duration(transitionDuration)
            .call(d3.axisBottom(x))

        // adjust the domain of the y axis and redraw it
        y.domain(getYDomain())
        d3.select("#y-axis-line")
            .transition()
            .duration(transitionDuration)
            .call(d3.axisLeft(y))

        // adjust all of the lines to match the new domain
        axisOptions.forEach(function(attribute) {
            let optionLine = d3.line()
                .x(function(d) {return x(d.year)})
                .y(function(d) {return y(d[attribute.toLowerCase()])})

            let lineID = "#value-line-" + attribute

            d3.select(lineID)
                .data([data])
                .attr("clip-path", "url(#line-clip-rect)")
                .transition()
                .ease(d3.easeBackOut)
                .duration(transitionDuration)
                .attr("d", optionLine)
        })
        animateLines(500)
    }

    // animate the lines scrolling into place when the correct scroll position requirements are met
    function animateScroll() {
        let documentScroll = document.documentElement.scrollTop;

        if (documentScroll >= 1600 && documentScroll <= 2600 &&
            (previousScroll < 1600 || previousScroll > 2600)) {
            animateLines(2000)
        }
        else if (documentScroll > 2800 || documentScroll < 1500) {
            d3.select("#line-clip-rect rect")
                .attr("width", 0)
        }
        previousScroll = documentScroll
    }

    // animate the lines coming into view when the axis scale is changed
    function animateLines(transitionSpeed) {
        d3.select("#line-clip-rect rect")
            .attr("width", 0)

        d3.select("#line-clip-rect rect")
            .transition()
            .duration(transitionSpeed)
            .attr("width", x.range()[1] - x.range()[0])
    }

    // get the year on the x-axis that is closest to the given x-coordinate
    function getYearAt(xCoordinate) {
        let uniqueYears = []
        data.forEach(function(d) {uniqueYears.push(d["year"])})

        let closestYear = uniqueYears[0]
        let closestDist = Math.abs(x(closestYear) - xCoordinate)

        uniqueYears.forEach(function(axisYear) {
            let dist = Math.abs(x(axisYear) - xCoordinate)
            if (dist < closestDist) {closestYear = axisYear; closestDist = dist}
        })

        return closestYear
    }

    redraw()
    resetLine()

    // ------------------------------------------------------------------------------------------
    // ---------- UTILITY/CHART FUNCTIONS -------------------------------------------------------
    // ------------------------------------------------------------------------------------------

    // set the styling of all lines in the visualization based on whether or not they are selected
    function setLineStyling() {
        axisOptions.forEach(function(attribute) {
            let optionLine = d3.line()
                .x(function(d) {return x(d.year)})
                .y(function(d) {return y(d[attribute.toLowerCase()])})

            let lineID = "#value-line-" + attribute
            let isClassed = d3.select(lineID).classed("selected-line")

            d3.select(lineID)
                .transition()
                .duration(transitionDuration)
                .attr("d", optionLine)
                .style("opacity", function() {
                    if (isClassed) {return opacity.default;}
                    else {return opacity.hidden;}})
        })
    }

    // convert a given string to standard title capitalization
    // ATTRIBUTION: function copied from
    // https://stackoverflow.com/questions/4878756/how-to-capitalize-first-letter-of-each-word-like-a-2-word-city
    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt){
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    // get the y domain for all lines currently selected in the graph
    function getYDomain() {
        let minValue = 100
        let maxValue = 0
        let anyClassed = false

        let xMin = x.domain()[0]
        let xMax = x.domain()[1]
        let filteredData = data.filter((d) => d.year >= xMin && d.year <= xMax)

        axisOptions.forEach(function(attribute) {
            let correspondingLine = d3.select("#value-line-" + attribute)

            if (correspondingLine.classed("selected-line")) {
                minValue = Math.min(minValue, d3.min(filteredData, function(d) {return d[attribute]}))
                maxValue = Math.max(maxValue, d3.max(filteredData, function(d) {return d[attribute]}))
                anyClassed = true
            }
        })

        if (!anyClassed) {return getFullDomain()} else {return [minValue, maxValue]}
    }

    // get the full domain of the y-axis across all attributes
    function getFullDomain() {
        let minValue = 100
        let maxValue = 0

        axisOptions.forEach(function(attribute) {
            minValue = Math.min(minValue, d3.min(data, function(d) {return d[attribute]}))
            maxValue = Math.max(maxValue, d3.max(data, function(d) {return d[attribute]}))
        })
        return [minValue, maxValue]
    }
})