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

//loading file from index.html
d3.csv('./data/2018-proposed-expenditure.csv', (error,data)=>{
  if (error) {console.log('error loading file');}
  var graph = {'nodes': [], 'links': []};
  var nodes = {};

  var subSectors = {};
  var mainSectors = {};

  data.forEach((d)=>{
    d.value = +d.value //string to number

    let source = d.source
    let target = d.target
    let weight =  d.value / totEstExp * 100
    //|| source === "infrastructure-development-fund"
    //|| source === "infrastructure-development-fund"
    // debugger
    if (source === "ministry-of-national-secruity" || target === "ministry-of-national-secruity"){
      debugger
    }

    if (weight > 0.74 && source !== "infrastructure-development-fund") {
      mainSectors[target] = true
      nodes[d.source] = true
      nodes[d.target] = true
      graph.links.push({
        "source": d.source,
        "target": d.target,
        "value": d.value
      })
    } else if (weight <= 0.74){
      subSectors[target] = true
    }

    if (source === "infrastructure-development-fund" && mainSectors[target]){
      nodes[d.source] = true
      nodes[d.target] = true
      graph.links.push({
        "source": d.source,
        "target": d.target,
        "value": d.value
      })
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
        .layout(32) //playwiththis :D


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

  link.append('title').text((d)=>(
    d.source.name + " → " + d.target.name + "\n" + format(d.value)
  ))

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
