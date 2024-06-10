// get the width of the screen to set the sizing of the plot
let windowWidth = window.innerWidth;
let minWidth = +getComputedStyle(document.documentElement).getPropertyValue("--site-min-width")

// set the dimensions and margins of the scatter plot
let scatterMargin = {top: 20, right: 20, bottom: 60, left: 60},
    scatterWidth = Math.max(windowWidth, minWidth) * 0.60 - scatterMargin.left - scatterMargin.right - 230,
    scatterHeight = 500 - scatterMargin.top - scatterMargin.bottom;

let correlationMargin = {top: 100, right: 0, bottom: 100, left: 60},
    correlationWidth = 170 - correlationMargin.left - correlationMargin.right,
    correlationHeight = 500 - correlationMargin.top - correlationMargin.bottom;

// initialize the value for the user's previous scroll position
let previousScrollScatter = 10000;

// initialize the SVG object for the scatter plot
let scatterSVG = d3.select("#scatter-viz")
    .append("svg")
    .attr("id", "scatter-svg-main")
    .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
    .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + scatterMargin.left + "," + scatterMargin.right + ")");

// add the spacer between the two objects
d3.select("#scatter-viz")
    .append("svg")
    .attr("width", Math.max(windowWidth, minWidth) * 0.05)
    .attr("height", 0)

// initialize the SVG object for the correlation plot
let correlationSVG = d3.select("#scatter-viz")
    .append("svg")
    .attr("id", "correlation-svg-main")
    .attr("width", correlationWidth + correlationMargin.left + correlationMargin.right)
    .attr("height", correlationHeight + correlationMargin.top + correlationMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + correlationMargin.left + "," + correlationMargin.top + ")")


let xAxisDefault = 'danceability'
let yAxisDefault = 'valence'
let pointRadius = {default: 5, hovered: 10}
let accentColor = getComputedStyle(document.documentElement).getPropertyValue("--accent-color")
let transitionDuration = 700

// add the tooltip to display information when hovering on a dot
let tooltipScatter = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)

let infoTooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .attr("id", "scatter-info-tooltip")

// read in the data from the csv file
d3.csv("spotify_sample.csv").then(function (data) {
    d3.csv("attribute_correlations.csv").then(function (correlationData) {

        // add an event listener so the visualization can be resized when the window is resized
        // and one to animate the bars moving when the user scrolls into position
        window.addEventListener("resize", redraw);
        window.addEventListener("scroll", animateScroll);

        // ------------------------------------------------------------------------------------------
        // ---------- CREATE THE SCATTER PLOT -------------------------------------------------------
        // ------------------------------------------------------------------------------------------


        // convert the values in each of the attribute columns from strings to numbers
        data.forEach(function (d) {
            d[xAxisDefault] = +d[xAxisDefault]
            d[yAxisDefault] = +d[yAxisDefault]
        })

        // initialize the list of possible attributes to graph on the axes
        let axisOptions = ['Danceability', 'Acousticness', 'Liveness', 'Loudness',
            'Speechiness', 'Tempo', 'Valence', 'Popularity']

        // add the list of possible values for the x axis to the dropdown menu
        d3.select("#x-axis-selection")
            .selectAll("option")
            .data(axisOptions)
            .enter()
            .append("option")
            .text(function (d) {return d;})
            .attr("value", function (d) {return d.toLowerCase();})
            .property("selected", function (d) {return d === toTitleCase(xAxisDefault)})

        // add the list of possible values for the y axis to the dropdown menu
        d3.select("#y-axis-selection")
            .selectAll("option")
            .data(axisOptions)
            .enter()
            .append("option")
            .text(function (d) {return d;})
            .attr("value", function (d) {return d.toLowerCase();})
            .property("selected", function (d) {return d === toTitleCase(yAxisDefault)})


        // transition the graph when either of the dropdown menu selections are changed
        d3.select("#x-axis-selection").on("change", changeAxes)
        d3.select("#y-axis-selection").on("change", changeAxes)

        // initialize the domain and range of the x axis
        let x = d3.scaleLinear()
            .domain(d3.extent(data, function (d) {return d[xAxisDefault]}))
            .range([0, scatterWidth])

        // initialize the domain and range of the y axis
        let y = d3.scaleLinear()
            .domain(d3.extent(data, function (d) {return d[yAxisDefault]}))
            .range([scatterHeight, 0])


        // add the horizontal grid lines
        scatterSVG.append("g")
            .classed("grid", true)
            .classed("horiz-grid", true)
            .attr("id", "horiz-grid-scatter")
            .call(d3.axisLeft(y)
                .tickSize(-scatterWidth)
                .tickFormat(""));

        // add the vertical grid lines
        scatterSVG.append("g")
            .classed("grid", true)
            .classed("verti-grid", true)
            .attr("id", "verti-grid-scatter")
            .call(d3.axisBottom(x)
                .tickSize(scatterHeight)
                .tickFormat(""));

        // adjust the tooltip and dot styling when a dot is hovered
        function dotMouseover(event, dot) {
            let data = d3.select(dot).data()[0]
            let trackName = data['name']
            let artistName = data['artists'].replace("[", '').replace("]", '').replaceAll("'", '')
            let xAttribute = getXAttribute()
            let yAttribute = getYAttribute()

            tooltipScatter
                .transition()
                .duration(100)
                .style("opacity", 0.8)
            tooltipScatter
                .html("<b>Track: </b>" + trackName + "<br>" +
                    "<b>Artist(s): </b>" + artistName + "<br>" +
                    "<b>" + toTitleCase(xAttribute) + ": </b>" + data[xAttribute] + "<br>" +
                    "<b>" + toTitleCase(yAttribute) + ": </b>" + data[yAttribute] + "<br>")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(dot)
                .style("r", pointRadius.hovered)
                .style("stroke", "black")
        }

        // adjust the tooltip and dot styling when the user hovers out of a dot
        function dotMouseout(dot) {
            tooltipScatter
                .transition()
                .duration(100)
                .style("opacity", 0)

            d3.select(dot)
                .style("r", pointRadius.default)
                .style("stroke", "none")
        }

        // add the x axis to the scatter plot
        scatterSVG.append("g")
            .attr("transform", "translate(0," + scatterHeight + ")")
            .call(d3.axisBottom(x))
            .attr("class", "x axis")
            .attr("id", "x-axis-scatter");

        // add the y axis to the scatter plot
        scatterSVG.append("g")
            .call(d3.axisLeft(y))
            .attr("class", "y axis")
            .attr("id", "y-axis-scatter")

        // add the x-axis label to the scatter plot
        scatterSVG.append("text")
            .attr("y", (scatterHeight + scatterMargin.bottom - 10))
            .attr("x", (scatterWidth / 2))
            .style("text-anchor", "middle")
            .text(toTitleCase(xAxisDefault))
            .classed("axis-label", true)
            .classed("x-label", true);

        // add the y-axis label to the scatter plot
        scatterSVG.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -scatterMargin.left)
            .attr("x", 0 - (scatterHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(toTitleCase(yAxisDefault))
            .classed("axis-label", true)
            .classed("y-label", true);


        // ------------------------------------------------------------------------------------------
        // ---------- CREATE THE CORRELATION PLOT ---------------------------------------------------
        // ------------------------------------------------------------------------------------------

        // initialize the axis for the correlation section
        let yCorrelation = d3.scaleLinear()
            .domain([-1, 1])
            .range([correlationHeight, 0])

        // add the y axis to the scatter plot
        correlationSVG.append("g")
            .call(d3.axisLeft(yCorrelation).ticks(5))
            .classed("y axis", true)
            .attr("id", "y-axis-correlation")

        // add the rectangle marker for the correlation
        correlationSVG
            .append("rect")
            .attr("width", 30)
            .attr("height", 5)
            .attr("fill", secondColor)
            .attr("rx", "1px")
            .attr("id", "correlation-marker")
            .attr("transform", "translate(0, -2.5)")
            .attr("y", yCorrelation(getCorrelation()[0]))

        // add the y-axis label to the correlation plot
        correlationSVG.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -correlationMargin.left)
            .attr("x", -(correlationHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Correlation ≈ " + d3.format(".2f")(getCorrelation()[0]))
            .classed("axis-label", true)
            .classed("y-label", true)
            .attr("id", "corr-value-marker")

        // add the text for the p-value
        correlationSVG.append("text")
            .attr("x", correlationMargin.right)
            .attr("y", (correlationHeight + correlationMargin.top - correlationMargin.bottom + 30))
            .attr("id", "p-value-marker")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-style", "italic")
            .style("fill", secondColor)
            .text("p-value ≈ " + d3.format(".4f")(getCorrelation()[1]))

        // add the rectangle for the question bubble
        correlationSVG.append("rect")
            .attr("x", 20)
            .attr("y", -20)
            .attr("width", 150)
            .attr("height", 30)
            .attr("transform", "translate(-75,-20)")
            .attr("rx", "3px")
            .attr("id", "info-rect-marker")
            .style("opacity", 0.3)
            .style("fill", secondColor)
            .on("mouseover", mouseoverInfo)
            .on("mousemove", mousemoveInfo)
            .on("mouseout", mouseoutInfo)

        // add the text label to the question bubble
        correlationSVG.append("text")
            .attr("x", 20)
            .attr("y", -20)
            .attr("id", "info-text-marker")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", backgroundColor)
            .text("What does this mean?")
            .on("mouseover", mouseoverInfo)
            .on("mousemove", mousemoveInfo)
            .on("mouseout", mouseoutInfo)


        // add the horizontal grid lines
        correlationSVG.append("g")
            .classed("grid", true)
            .classed("horiz-grid", true)
            .attr("id", "horiz-grid-scatter")
            .call(d3.axisLeft(yCorrelation).ticks(5)
                .tickSize(-30)
                .tickFormat(""));

        // show the tooltip when the mouse enters the question bubble
        function mouseoverInfo(event) {
            d3.select("#info-rect-marker")
                .style("opacity", 0.8)

            infoTooltip
                .transition()
                .duration(0)
                .style("opacity", 0.9)

            infoTooltip
                .style("left", (event.pageX - 200) + "px")
                .style("top", (event.pageY + 28) + "px")
                .html("<b>Correlation </b> refers to the degree to which a pair of variables are linearly related. " +
                    "A high correlation (closer to 1 or -1) suggests a strong <i>positive</i> or <i>negative</i> " +
                    "relationship between the two variables.<br><br>" +
                    "<b>The p-value</b> refers to the probability of getting results <i>at least as extreme</i> as the ones " +
                    "calculated by random chance. We can assume statistical significance when p ≤ 0.05.");
        }

        // move the tooltip when the mouse is moved
        function mousemoveInfo(event) {
            infoTooltip
                .style("left", (event.pageX - 200) + "px")
                .style("top", (event.pageY + 28) + "px")
        }

        // hide the tooltip when the mouse leaves the bubble
        function mouseoutInfo() {
            d3.select("#info-rect-marker")
                .style("opacity", 0.3)

            infoTooltip
                .transition()
                .duration(transitionDuration)
                .style("opacity", 0)
        }

        // ------------------------------------------------------------------------------------------
        // ---------- UTILITY/CHART FUNCTIONS -------------------------------------------------------
        // ------------------------------------------------------------------------------------------


        // adjust the axes and all related values when either of the dropdown menus have been changed
        function changeAxes() {

            // get the new attributes to be plotted on the axes
            let xAttribute = getXAttribute()
            let yAttribute = getYAttribute()

            // change the domains of the x and y axes
            x.domain(d3.extent(data, function (d) {
                return +d[xAttribute]
            }))
            y.domain(d3.extent(data, function (d) {
                return +d[yAttribute]
            }))

            // adjust the positions of all the scatter plot circles
            scatterSVG.selectAll(".scatter-circle")
                .data(data)
                .each(function () {
                    d3.select(this)
                        .transition()
                        .duration(transitionDuration * Math.random())
                        .attr("cx", function (d) {return x(+d[xAttribute])})
                        .attr("cy", function (d) {return y(+d[yAttribute])})
                })

            // change the x axis tick values
            d3.select("#x-axis-scatter")
                .transition()
                .duration(transitionDuration)
                .call(d3.axisBottom(x))

            // change the y axis tick values
            d3.select("#y-axis-scatter")
                .transition()
                .duration(transitionDuration)
                .call(d3.axisLeft(y))

            // change the axis labels for the x- and y- axes
            d3.select(".x-label").text(toTitleCase(xAttribute))
            d3.select(".y-label").text(toTitleCase(yAttribute))

            // change the horizontal grid lines for the new scale
            d3.select("#horiz-grid-scatter")
                .transition()
                .duration(transitionDuration)
                .call(d3.axisLeft(y)
                    .tickSize(-scatterWidth)
                    .tickFormat(""));

            // change the vertical grid lines for the new scale
            d3.select("#verti-grid-scatter")
                .transition()
                .duration(transitionDuration)
                .call(d3.axisBottom(x)
                    .tickSize(scatterHeight)
                    .tickFormat(""))

            // adjust the position of the correlation marker
            d3.select("#correlation-marker")
                .transition()
                .duration(transitionDuration)
                .attr("y", function () {return yCorrelation(getCorrelation()[0])})

            // change the p-value text
            d3.select("#p-value-marker")
                .text("p-value ≈ " + d3.format(".4f")(getCorrelation()[1]))

            // change the correlation value text
            d3.select("#corr-value-marker")
                .text("Correlation ≈ " + d3.format(".2f")(getCorrelation()[0]))
        }

        // convert a given string to standard title capitalization
        // ATTRIBUTION: function copied from
        // https://stackoverflow.com/questions/4878756/how-to-capitalize-first-letter-of-each-word-like-a-2-word-city
        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

        // redraw the visualization when the window size is changed
        function redraw() {
            let xAttribute = getXAttribute()

            // get the width of the screen to set the sizing of the plot
            windowWidth = window.innerWidth;
            scatterWidth = Math.max(windowWidth, minWidth) * 0.7 - scatterMargin.left - scatterMargin.right - 230;

            // adjust the width of the SVG itself
            d3.select("#scatter-svg-main").attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)

            // change the x axis tick values
            x
                .domain(d3.extent(data, function (d) {return d[xAttribute]}))
                .range([0, scatterWidth])

            // adjust the x axis of the scatter plot
            d3.select("#x-axis-scatter").call(d3.axisBottom(x))

            // change the horizontal grid lines for the new scale
            d3.select("#horiz-grid-scatter")
                .call(d3.axisLeft(y)
                    .tickSize(-scatterWidth)
                    .tickFormat(""));

            // change the vertical grid lines for the new scale
            d3.select("#verti-grid-scatter")
                .call(d3.axisBottom(x)
                    .tickSize(scatterHeight)
                    .tickFormat(""))

            // change the position of the x axis label
            d3.select(".x-label").attr("x", (scatterWidth / 2))

            // adjust the positions of all the scatter plot circles
            scatterSVG.selectAll(".scatter-circle").attr("cx", function (d) {return x(+d[xAttribute])})
        }

        // get the currently selected value for the x axis dropdown menu
        function getXAttribute() {
            return d3.select("#x-axis-selection").property("value")
        }

        // get the currently selected value for the y axis dropdown menu
        function getYAttribute() {
            return d3.select("#y-axis-selection").property("value")
        }

        // compute the correlation and p-value of the currently graphed attributes
        function getCorrelation() {
            let xAttribute = getXAttribute()
            let yAttribute = getYAttribute()

            let groupedData = d3.group(correlationData, (d) => d["attribute1"], (d) => d["attribute2"])
            let selectedData = groupedData.get(xAttribute).get(yAttribute)[0]
            let correlation = +selectedData["correlation"]
            let pValue = +selectedData["p_value"]

            return [correlation, pValue]
        }


        // animate the scatter points entering the graph when the correct scroll position is reached
        function animateScroll() {
            let documentScroll = document.documentElement.scrollTop;

            if (documentScroll >= 1000 && documentScroll <= 1750 &&
                (previousScrollScatter < 1000 || previousScrollScatter > 1750)) {
                animateScatter(1)
            }
            else if (documentScroll < 700 || documentScroll > 2100) {
                scatterSVG.selectAll(".scatter-circle").remove()
            }
            previousScrollScatter = documentScroll
        }

        // animate the entry of all scatter points onto the graph
        function animateScatter(transitionSpeed) {
            let xAttribute = getXAttribute()
            let yAttribute = getYAttribute()

            scatterSVG.selectAll(".scatter-circle").remove()

            // add all of the circles to the visualization
            scatterSVG.append("g")
                .selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("opacity", 0.5)
                .style("fill", accentColor)
                .classed("scatter-circle", true)
                .on("mouseover", function (event) {dotMouseover(event, this)})
                .on("mouseout", function () {dotMouseout(this)})
                .each(function(d, i) {
                    d3.select(this)
                        .transition()
                        .ease(d3.easeCubic)
                        .duration(transitionSpeed * i)
                        .attr("cx", function (d) {return x(d[xAttribute])})
                        .attr("cy", function (d) {return y(d[yAttribute])})
                        .attr("r", pointRadius.default)
                        .delay(i)
                })
        }

        // redraw the graph upon loading
        redraw()
    })
})
