// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

// When the browser loads, loadChart() is called
loadChart();

// Define responsive function
function makeResponsive() {

  // if the SVG area isn't empty when the browser loads, remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
    loadChart();
  }
}

// Define the chart rendering function
function loadChart() {
  var svgHeight = (window.innerHeight) * 0.7;
  var svgWidth = (window.innerWidth) * 0.9;

  var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  // Retrieve data from the CSV file and execute everything below
  d3.csv("assets/data/data.csv").then(function (censusData) {
    console.log(censusData);

    // Format the data
    censusData.forEach(function (data) {
      data.healthcare = parseFloat(data.healthcare);
      data.age = parseFloat(data.age);
      data.poverty = parseFloat(data.poverty);
      data.smokes = parseFloat(data.smokes);
      data.abbr = data.abbr;
      console.log((data.abbr).length);
    });



    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(censusData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.append("g")
      .selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 12)
      .attr("class", "stateCircle")
      .attr("opacity", ".5");

    // append text labels
    var scatterlabelGroup = chartGroup.append("g")
      .selectAll("text")
      .data(censusData)
      .enter()
      .append("text")
      .classed("text-group", true)
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("class", "stateText")
      .attr("alignment-baseline", "central")
      .attr("font-size", "11px")  // Font size
      .style("font-weight", "bold");

    console.log(circlesGroup);
    console.log(scatterlabelGroup);

    // Responsive scatter size and text labels
    if (svgWidth < 500) {
      circlesGroup.attr("r", 5);
      scatterlabelGroup.style("display", "none");
    }
    else {
      circlesGroup.attr("r", 12);
      scatterlabelGroup.style("display", "inline");
    }

    // Create group for  3 x-axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`)
      .classed("xLabel", true);

    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // Create group for  3 y-axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")
      .classed("yLabel", true);

    var healthcareLabel = ylabelsGroup.append("text")
      .attr("y", 0 - 50)
      .attr("x", 0 - (height / 2))
      .attr("value", "healthcare")
      .attr("dy", "1em")
      // .classed("axis-text", true)
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var obesityLabel = ylabelsGroup.append("text")
      .attr("y", 0 - 70)
      .attr("x", 0 - (height / 2))
      .attr("value", "obesity")
      .attr("dy", "1em")
      // .classed("axis-text", true)
      .classed("inactive", true)
      .text("Obese (%)");

    var smokesLabel = ylabelsGroup.append("text")
      .attr("y", 0 - 90)
      .attr("x", 0 - (height / 2))
      .attr("value", "smokes")
      .attr("dy", "1em")
      // .classed("axis-text", true)
      .classed("inactive", true)
      .text("Smokes (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    circlesGroup = updateYToolTip(chosenYAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function () {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXaxis with value
          chosenXAxis = value;

          // console.log(chosenXAxis)

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(censusData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

          // update texts with new x values
          scatterlabelGroup = renderTexts(scatterlabelGroup, xLinearScale, chosenXAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "poverty") {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "income") {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
      .on("click", function () {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          // replaces chosenXaxis with value
          chosenYAxis = value;

          // console.log(chosenYAxis)

          // functions here found above csv import
          // updates y scale for new data
          yLinearScale = yScale(censusData, chosenYAxis);

          // updates y axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);

          // updates circles with new y values
          circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

          // update texts with new y values
          scatterlabelGroup = renderYTexts(scatterlabelGroup, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateYToolTip(chosenYAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "obesity") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  });

  /**==================================== */
  // function used for updating x-scale var upon click on axis label
  function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9,
      d3.max(censusData, d => d[chosenXAxis]) * 1.1
      ])
      .range([0, width]);

    return xLinearScale;
  }

  // function used for updating x-scale var upon click on axis label
  function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain(([d3.min(censusData, d => d[chosenYAxis]) * 0.9,
      d3.max(censusData, d => d[chosenYAxis]) * 1.1]))
      .range([height, 0]);

    return yLinearScale;
  }

  // function used for updating xAxis var upon click on axis label
  function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  // function used for updating xAxis var upon click on axis label
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
  }

  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
  }

  function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
  }

  // function used for updating texts group with a transition to
  // new circles
  function renderTexts(scatterlabelGroup, newXScale, chosenXAxis) {

    scatterlabelGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));

    return scatterlabelGroup;
  }

  function renderYTexts(scatterlabelGroup, newYScale, chosenYAxis) {

    scatterlabelGroup.transition()
      .duration(1000)
      .attr("y", d => newYScale(d[chosenYAxis]));

    return scatterlabelGroup;
  }

  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
      var label = "Poverty (%):";
    }
    else if (chosenXAxis === "age") {
      var label = "Age: ";
    }
    else if (chosenXAxis === "income") {
      var label = "Household Income:";
    }

    var chosenYAxis = d3.select(".yLabel").select(".active").attr("value");

    if (chosenYAxis === "healthcare") {
      var yLabel = "Lacks Healthcare (%):";
    }
    else if (chosenYAxis === "obesity") {
      var yLabel = "Obesity (%):";
    }
    else if (chosenYAxis === "smokes") {
      var yLabel = "Smokes (%):";
    }

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function (d) {
        return (`${d.abbr}<br>${label} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", toolTip.show)
      .on("mouseout", toolTip.hide);

    return circlesGroup;
  }

  // function used for updating circles group with new tooltip
  function updateYToolTip(chosenYAxis, circlesGroup) {

    if (chosenYAxis === "healthcare") {
      var yLabel = "Lacks Healthcare (%):";
    }
    else if (chosenYAxis === "obesity") {
      var yLabel = "Obesity (%):";
    }
    else if (chosenYAxis === "smokes") {
      var yLabel = "Smokes (%):";
    }

    var chosenXAxis = d3.select(".xLabel").select(".active").attr("value");

    if (chosenXAxis === "poverty") {
      var label = "Poverty (%):";
    }
    else if (chosenXAxis === "age") {
      var label = "Age: ";
    }
    else if (chosenXAxis === "income") {
      var label = "Household Income:";
    }

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function (d) {
        return (`${d.abbr}<br>${label} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", toolTip.show)
      .on("mouseout", toolTip.hide);

    return circlesGroup;
  }

}