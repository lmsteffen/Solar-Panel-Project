let margins = { top: 30, bottom: 30, left: 30, right: 30 };
let outerWidth = 800;
let outerHeight = 450;
let innerWidth = outerWidth - margins.left - margins.right;
let innerHeight = outerHeight - margins.top - margins.bottom;

let lmsOuter = d3
  .select("#heat-map")
  .attr("width", outerWidth)
  .attr("height", outerHeight)

let lmsInner = lmsOuter
  .append("g")
  .attr("id", "plot-area")
  .attr("transform", "translate(" + margins.left + "," + margins.right + ")")

let adhOuter = d3
  .select("#adhviz")
  .attr("width", outerWidth)
  .attr("height", outerHeight);

let adhInner = adhOuter
  .append("g")
  .attr("width", innerWidth)
  .attr("height", innerHeight)
  .attr("transform", "translate(" + margins.left + "," + margins.right + ")");

 d3.csv('ordered-data.csv').then(draw)

lmsOuter //border
  .append("rect")
  .attr("width", outerWidth)
  .attr("height", outerHeight)
  .attr("fill", "transparent")
  .attr("stroke", "#333333")
  .attr("stroke-width", 2);

function timeclean(time) { //takes "HH:MM" as input and outputs total minutes
  hr = +time.slice(0,2)
  min = +time.slice(3,5)
  return 60*hr + min
}

  d3.csv('ordered-data.csv').then(draw)
  d3.csv('heatmap-data.csv').then(draw)

  function draw(solar) {

    

    lmsInner.append('circle')
    .attr('cx', 200)
    .attr('cy', 200)
    .attr('r', 20)
    .attr('fill', 'red')

    //console.log(solar)

    adhOuter //border
      .append("rect")
      .attr("width", outerWidth)
      .attr("height", outerHeight)
      .attr("fill", "transparent")
      .attr("stroke", "#333333")
      .attr("stroke-width", 3);

    lmsOuter //border
      .append("rect")
      .attr("width", outerWidth)
      .attr("height", outerHeight)
      .attr("fill", "transparent")
      .attr("stroke", "#333333")
      .attr("stroke-width", 3);

    let wattscale = d3
      .scaleLinear() // Lauren, this might be useful for you as well
      .domain( [Math.min(...solar.map(d => d.W)), Math.max(...solar.map(d => d.W))] )
      .range([innerHeight, 0]);

    let timescale = d3 //make sure you use timeclean()
      .scaleLinear()
      .domain( [0000, 1439] )
      .range([0, innerWidth])


    adhInner //drawing
      .selectAll('circle')
      .data(solar)
      .enter()
      .append('circle')
      .attr('cx', d => timescale(timeclean(d.Time)))
      .attr('cy', d => wattscale(d.W))
      .style('fill', 'red')
      .attr('r', .5)

    

  }
