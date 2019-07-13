// Chart Params
var svgWidth = 960;
var svgHeight = 500;

var margin = { top: 20, right: 40, bottom: 60, left: 50 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
    .select("body")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import data from an external CSV file
d3.csv("assets/data/data.csv").then(function (censusData) {
    // if (error) throw error;

    console.log(censusData);
    console.log([censusData]);



    // Format the data
    censusData.forEach(function (data) {
        data.healthcare = parseFloat(data.healthcare);
        data.age = parseFloat(data.age);
        data.poverty = parseFloat(data.poverty);
        data.smokes = parseFloat(data.smokes);
        data.abbr = data.abbr;
        console.log((data.abbr).length);
    });

    // append svg and group
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // scales
    var xScale = d3.scaleLinear()
        .domain(([d3.min(censusData, d => d.poverty) * 0.9,
        d3.max(censusData, d => d.poverty) * 1.1]))
        .range([0, width]);


    var yScale = d3.scaleLinear()
        .domain(([d3.min(censusData, d => d.healthcare) * 0.9,
        d3.max(censusData, d => d.healthcare) * 1.1]))
        .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xScale);
    var leftAxis = d3.axisLeft(yScale);



    // append circles to data points
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.poverty))
        .attr("cy", d => yScale(d.healthcare))
        .attr("r", "15")
        .attr("class", "stateCircle")
        .attr("opacity", "0.7");

    // Add labels to scatter
    var labelGroup = svg.selectAll("text")
        .data(censusData)
        .enter()
        .append("text")
        .attr("x", d => xScale(d.poverty) + 50)
        .attr("y", d => yScale(d.healthcare) + 25)
        .text(d => d.abbr)
        .attr("class", "stateText");

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .attr("class", "aText")
        .text(" In Poverty (%)");

    chartGroup.append("g")
        .call(leftAxis);

    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "aText")
        .text("Lacks Healthcare %");

});
