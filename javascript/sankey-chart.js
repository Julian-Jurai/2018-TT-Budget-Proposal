var margin = {top: 10, right: 10, bottom: 10, left: 20};
var width = 900 - margin.left - margin.right;
var height = 900 - margin.top - margin.bottom;

var formatNumber = d3.format(',.0f');
var format = (d) => ( '$' + formatNumber(d));

var color = d3.scaleOrdinal(d3.schemeCategory20);

var sankeySvg = d3.select('#sankey-chart').append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var sankey = d3.sankey()
                .nodeWidth(30)
                .nodePadding(15)
                .size([width, height]);

var path = sankey.link();

const totEstExp = 52507340591; // excluding inf. dev. fund

function nameParse(name){
  words = name.split("-")
  words.forEach((wrd,i)=>(
    words[i] = wrd[0].toUpperCase() + wrd.slice(1)
  ));
  return words.join(" ")
};

//loading file relative from index.html
d3.csv('./data/2018-proposed-expenditure.csv', (error,data)=>{
  if (error) {console.log('error loading file');}
  var graph = {'nodes': [], 'links': []};
  var nodes = {};

  var smallSectors = {};
  var largeSectors = {};

  data.forEach((d,i)=>{
    d.value = +d.value //string to number
    let lastIdx = data.length - 1
    let source = d.source
    let target = d.target
    let weight =  d.value / totEstExp * 100

    const updateNodesAndLinks = (obj) => {
      d = obj ? obj : d
      nodes[d.source] = true
      nodes[d.target] = true
      graph.links.push({
        "source": d.source,
        "target": d.target,
        "value": d.value
      })
    }
    // {source: "total-estimated-expediture", target: "tobago-house-of-assembly", value: 1860000000}
    const createOthers = () => {
      let src1 = "infrastructure-development-fund"
      let src2 = "total-estimated-expediture"
      let value1 = 0
      let value2 = 0
      let target = "Others"
      let others;

      Object.values(smallSectors).forEach((dataPoint)=>{
        let val = dataPoint.value
        if (dataPoint.source === src1){
          value1 += val
        } else {
          value2 += val
        }
      })

      others = [
        {
        source: src1,
        target: target,
        value: value1
        },
        {
        source: src2,
        target: target,
        value: value2
        }
      ]

      others.forEach((obj)=>{
         updateNodesAndLinks(obj)
      })

    }

    if (weight > 0.74 && source !== "infrastructure-development-fund") {
      updateNodesAndLinks()
      largeSectors[target] = d
    } else if (weight <= 0.74){
      smallSectors[source] = d
    }

    if (source === "infrastructure-development-fund" && largeSectors[target]){
      updateNodesAndLinks()
    }

    if (i === lastIdx) {
      createOthers()

    }



  });

  graph.nodes = Object.keys(nodes);

  graph.links.forEach((d,i)=>{
    graph.links[i].source = graph.nodes.indexOf(graph.links[i].source)
    graph.links[i].target = graph.nodes.indexOf(graph.links[i].target)
  });

  graph.nodes.forEach((d,i)=>{
    graph.nodes[i] = {"name": d}
  })

  graph.links.sort((a,b)=> b - a)

  sankey.nodes(graph.nodes)
        .links(graph.links)
        .layout(32)

  var link = sankeySvg.append('g').selectAll('.link')
              .data(graph.links)
              .enter()
                .append("path")
                .attr("class", "link")
                .attr("d", path)
                .style("stroke-width", (d)=>(
                  Math.max(1, d.dy)
                ))
                .sort((a, b)=>(b.dy - a.dy))

  link.append("title")
      .text((d)=>(d.source.name + " → " + d.target.name + "\n" + format(d.value)))

  var sankeyDetails = d3.select("#sankey-details").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  d3.selectAll('.link')
    .on("mouseover", function(d) {
      sankeyDetails.transition()
       .duration(200)
       .style("opacity", .9);
      sankeyDetails.html(d.source.name + " → " + d.target.name + "\n" + format(d.value))
       .style("left", (d3.event.pageX) + "px")
       .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
    sankeyDetails.transition()
     .duration(500)
     .style("opacity", 0);
 });


  function dragmove(d){
    d3.select(this)
      .attr("transform", "translate(" + d.x + "," + (
          d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
      ) + ")"
    )
    sankey.relayout();
    link.attr("d",path)
  }

  var node = sankeySvg.append('g').selectAll('.node')
              .data(graph.nodes)
              .enter()
                .append("g")
                .attr("class","node")
                .attr("transform", (d)=>(
                  "translate(" + d.x + "," + d.y + ")"
                ))
                .call(d3.drag()
                  .subject((d)=>(d))
                  .on("start", function() {
                    this.parentNode.appendChild(this);
                  })
                  .on("drag", dragmove)
                );

  node.append("text")
          .attr("x", -6)
          .attr("y", (d)=>(d.dy / 2))
          .attr("dy", ".35em")
          .attr("text-anchor", "end")
          .attr("transform", null)
          .text(function(d) { return nameParse(d.name) })
        .filter(function(d){ return d.x < width / 2 })
          .attr("x", 6 + sankey.nodeWidth())
          .attr("text-anchor", "start")


  node.append("rect")
      .attr("height", (d)=>{
        return d.dy})
      .attr("width", sankey.nodeWidth())
      .style("fill", (d)=>(
        d.color = color(d.name.replace(/ .*/, ""))
      ))
      .style("stroke", (d)=>(
            d3.rgb(d.color).darker(2)
      ))
      .append("title")
        .text((d)=>(d.name + "\n" + format(d.value)))



})//csv load ends
