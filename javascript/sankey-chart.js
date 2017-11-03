var margin = {top: 10, right: 10, bottom: 10, left: 10}
var width = 700 - margin.left - margin.right
var height = 300 - margin.top - margin.bottom

var formatNumber = d3.format(',.0f')
var format = (d) => ( '$' + formatNumber(d));

var color = d3.scaleOrdinal(d3.schemeCategory20)

var sankeySvg = d3.select('#sankey-chart').append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var sankey = d3.sankey()
                .nodeWidth(36)
                .nodePadding(40)
                .size([width, height]);

var path = sankey.link();

d3.csv('../data/2018-proposed-expenditure.csv', (error,data)=>{
  if (error) {console.log('error loading file');}

  var graph = {'nodes': [], 'links': []};
  var nodes = {}

  data.forEach((d)=>{
    nodes[d.source] = true
    nodes[d.target] = true
    graph.links.push({
      "source": d.source,
      "target": d.target,
      "value": +d.value
    })
  });

  graph.nodes = Object.keys(nodes);

  graph.links.forEach((d,i)=>{
    graph.links[i].source = graph.nodes.indexOf(graph.links[i].source)
    graph.links[i].target = graph.nodes.indexOf(graph.links[i].target)
  });

  graph.nodes.forEach((d,i)=>{
    graph.nodes[i] = {"name": d}
  })

  sankey.nodes(graph.nodes)
        .links(graph.links)
        .layout(32) //playwiththis :D

  var link = sankeySvg.append('g').selectAll('.link')
              .data(graph.links)
              .enter()
                .append('path')
                .attr('d', path)
                .style('stroke-width', (d)=>(Math.max(0,)))

  function dragmove(d){
    d3.select(this)
      .attr("transform", "translate(" + d.x + "," + (
          d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
      ) + ")"
    )
    sankey.relayout();
    link.attr("d",path)
  }

  // var link = sankeySvg.append('g').selectAll('.node')
  //             .data(graph.nodes)
  //             .enter()
  //               .append("g")
  //               .attr("class","node")
  //               .attr("transform", (d)=>(
  //                 "translate(" + d.x + "," + d.y + ")"
  //               ))
  //               .call(d3.drag()
  //                 .subject((d)=>(d))
  //                 .on("start", function() {
  //                   this.parentNode.appendChild(this);
  //                 })
  //                 .on("drag", dragmove)
  //               );
  // var node


})//csv load ends
