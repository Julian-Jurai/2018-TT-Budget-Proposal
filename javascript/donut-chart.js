var allSecs = {
  "ministry-of-finance": 5695609770,
  "charges-on-account-of-the-public-debt": 8270001550,
  "pensions-and-gratitutes": 2775000000,
  "ministry-of-national-secruity": 3775322281,
  "ministry-of-education": 5472977967,
  "ministry-of-health": 5303488890,
  "ministry-of-public-utilities": 2971514742,
  "ministry-of-social-development-and-familiy-services": 4729245300,
  "tobago-house-of-assembly": 2175683000,
  "ministry-of-public-administration-and-communications": 973032390,
  "ministry-of-rural-development-and-local-government": 2330671110,
  "ministry-of-works-and-transport": 2343542325,
  "ministry-of-housing-and-urban-development": 1496600504,
  "trinidad-and-tobago-police-service": 2323223100,
  "ministry-of-agriculture,-land-and-fisheries": 771704362,
  "others": 5651241300
}

var smallSecs = {
  "president": 18000000,
  "auditor-general": 38153850,
  "judiciary": 423876110,
  "industiral-court": 42815108,
  "parliament": 132943000,
  "services-comissions": 82000000,
  "statutory-authorities-services-commission": 10241950,
  "elections-and-boundaries-comission": 82000000,
  "tax-appeal-board": 8211160,
  "registration,-recognition-and-certification-board": 4500000,
  "public-service-appeal-board": 3489865,
  "office-of-the-prime-minister": 250074590,
  "central-administrative-services,-tobago": 43617000,
  "personnel-department": 58400000,
  "ministry-of-the-attorney-general-and-legal-affairs": 309198650,
  "ministry-of-labour-and-small-enterprises-development": 372450800,
  "ministry-of-tourism": 78564500,
  "integrity-comission": 12500000,
  "environmental-comission": 7989000,
  "ministry-of-energy-and-energy-industries": 120426290,
  "ministry-of-trade-and-industry": 163614760,
  "ministry-of-community-development,-culture-and-the-arts": 371603900,
  "ministry-of-foreign-and-caricom-affairs": 267972000,
  "ministry-of-planning-and-development": 337633740,
  "ministry-of-sport-and-youth-affairs": 302407827,
  "equal-opportunity-tribunal": 4740200,
  "tobago-house-of-assembly": 315683000,
  "ministry-of-finance": 87300000,
  "charges-on-account-of-the-public-debt": 0,
  "pensions-and-gratitutes": 0,
  "ministry-of-national-secruity": 394191000,
  "ministry-of-education": 321205000,
  "ministry-of-health": 198000000,
  "ministry-of-public-administration-and-communications": 24208000,
  "ministry-of-public-utilities": 141200000,
  "ministry-of-rural-development-and-local-government": 231300000,
  "ministry-of-works-and-transport": 192600000,
  "ministry-of-housing-and-urban-development": 87587000,
  "trinidad-and-tobago-police-service": 37243000,
  "ministry-of-agriculture,-land-and-fisheries": 45800000,
  "ministry-of-social-development-and-familiy-services": 27500000
}

var data = Object.keys(allSecs)

var donutChart = d3.select("#donut-chart").append("svg")
              .attr("width",200)
              .attr("height",200)

var group = donutChart.append("g")
      .attr("transform", "translate(100,100)")

function clearDonut(){
  group.selectAll('g').remove()
}


var pie = d3.pie()
          .value((d)=>(allSecs[d]));

function nameParse(name){
 words = name.split("-")
 words.forEach((wrd,i)=>(
   words[i] = wrd[0].toUpperCase() + wrd.slice(1)
 ));
 return words.join(" ")
};

function createLegend(data){

  var legendSvg = d3.select("#donut-chart-legend").append("svg").attr("height",260)

  var group = legendSvg.append("g").selectAll(".legend")
    .data(data)
    .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d,i)=>{
        return  "translate(" + 0 + "," + (i * 15 + 20) + ")"; // place each legend on the right and bump each one down 15 pixels
      })

  group.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", (d,i)=>{
      return color(d.replace(/ .*/, ""));
    });

  group.append("text") // add the text
    .text(function(d){
      return nameParse(d);
    })
    .style("font-size", "12px")
    .attr("y", "10px")
    .attr("x", "12px");

    text = d3.select('#donut-chart-legend')
              .append('div')
              .text("Others comprise of the following sectors: ")
              .style("font-size", "11px")

      text.append('ul').selectAll('.others')
        .data(Object.keys(smallSecs))
        .enter()
          .append('li')
          .text((d)=>{return nameParse(d) })
          .attr("class", "others")
          .style("font-size", "10px")


    // .append("ul")

  // group.select('ul').selectAll('other-items')
  //   .enter()
  //     .append("li")
  //     .text("")
}

function drawDonut(data){
  clearDonut()

  var r = 100;

  var arc = d3.arc()
          .innerRadius(60)
          .outerRadius(r)

  var arcs = group.selectAll(".arc")
      .data(pie(data))
      .enter()
        .append("g")
        .attr("class", "arc")
        .append("path")
        .attr("d", arc)
        .attr("fill", (d,i)=>{
          return color(d.data.replace(/ .*/, ""))
        })
        .attr("stroke", (d)=>(
          d3.rgb(color(d.data.replace(/ .*/, ""))).darker(2)
        ))

  arcs.append("text")
      .attr("transform", (d) => (
        "translate(" + arc.centroid(d) + ")"
      ))
      .text((d)=>(d.data))
      .attr("text-anchor","middle")
      .attr("font-size","1.5em")
      .attr("fill","white")
}

drawDonut(data)
createLegend(data)
