var data = [10, 50, 60, 50, 40]
var r = 100;

var color = d3.scaleOrdinal()
              .range(["red", "blue", "orange","purple","grey"])

var donutChart = d3.select("#donut-chart").append("svg")
              .attr("width",200)
              .attr("height",200)

var group = donutChart.append("g")
      .attr("transform", "translate(100,100)")

var arc = d3.arc()
        .innerRadius(60)
        .outerRadius(r)

var pie = d3.pie()
          .value((d)=>(d));

var arcs = group.selectAll(".arc")
          .data(pie(data))
          .enter()
            .append("g")
            .attr("class", "arc")

arcs.append("path")
    .attr("d", arc)
    .attr("fill", (d,i)=>(color(i)))

arcs.append("text")
    .attr("transform", (d) => (
      "translate(" + arc.centroid(d) + ")"
    ))
    // .text((d)=>(d.data))
    // .attr("text-anchor","middle")
    // .attr("font-size","1.5em")
    // .attr("fill","white")
