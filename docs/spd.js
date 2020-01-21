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

  function draw(solar) {
    lmsInner.append('circle')
    .attr('cx', 200)
    .attr('cy', 200)
    .attr('r', 20)
    .attr('fill', 'red')

    console.log('it worked')
    console.log(solar)

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

    /*let wattscale = d3
      .scaleLinear() // Lauren, this might be useful for you as well
      .domain( d3.extent() )
      .range([0, innerWidth]);

    let timescale = d3
      .scaleLinear()
      .domain( fill this in later, find out how to make use of timescale )
      .range([0, innerHeight]) */



  }
