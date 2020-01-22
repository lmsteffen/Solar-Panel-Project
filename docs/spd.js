let margins = { top: 45, bottom: 45, left: 60, right: 45 };
let outerWidth = 800;
let outerHeight = 450;
let innerWidth = outerWidth - margins.left - margins.right;
let innerHeight = outerHeight - margins.top - margins.bottom;

let myData = []
let myMW = []

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
  return hr + min/60
}

  d3.csv('ordered-data.csv').then(draw)
  d3.csv('heatmap-data.csv').then(wrangle)

  function wrangle(data) {
    myData = data
    myMW = d3.rollups(myData, v => d3.mean(v, v => v.W), d => d.Month, d => d.Hour)
  }

  
  
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

    let wattScale = d3
      .scaleLinear() // Lauren, this might be useful for you as well
      .domain( [Math.min(...solar.map(d => d.W)), Math.max(...solar.map(d => d.W))] )
      .range([innerHeight, 0]);
    let wattAxis = d3.axisLeft(wattScale)


    let timeScale = d3 //make sure you use timeclean()
      .scaleLinear()
      .domain( [0000, 24] )
      .range([0, innerWidth])
    let timeAxis = d3.axisBottom(timeScale).ticks()//.tickValues()

    /*let testTimeScale = d3
      scaleTime
      .domain([])
      .range([])*/

    let colorScale = d3
      .scaleSequential()
      .interpolator(d3.interpolateViridis)
      .domain([0, 6012])


    adhInner //drawing
      .selectAll('circle')
      .data(solar)
      .enter()
      .append('circle')
      .attr('cx', d => timeScale(timeclean(d.Time)))
      //.attr('cx', d => testTimeScale(d.Time))
      .attr('cy', d => wattScale(d.W))
      .style('fill', 'red')
      .attr('r', .5)

    adhInner
      .selectAll('line')
      .data(solar)
      .enter()
      .append('line')
      .style('stroke', 'green')
      /*.attr('x1', (d, i) => timeScale(timeclean(d.Time)))
      .attr('x2', (d, i) => timeScale(timeclean(d.Time))) //find out how to make this a different data point
      .attr('y1', (d, i) => wattScale(d.W))
      .attr('y2', (d, i) => wattScale(d.W))*/ //this too 

  adhInner //creates x axis
    .append('g')
    .attr('transform', 'translate(' + 0 + ', ' + innerHeight + ')')
    .attr('class', 'x axis') 
    .call(timeAxis)
  
  adhInner //creates y axis
    .append('g')
    .attr('class', 'y axis')
    .call(wattAxis)

  adhOuter //X axis label
    .append('text')
    .attr('class', 'x axis')
    .attr('x', margins.left + innerWidth / 2)
    .attr('y', outerHeight - margins.bottom / 4)
    .attr('text-anchor', 'middle')
    .text('Time of Day (in hours)')
    .attr('fill', '#AAAAAA')

  adhOuter //Y axis Label
    .append('text')
    .attr('class', 'y axis')
    .attr('x', margins.left / 2)
    .attr('y', margins.bottom + innerHeight / 2.18)
    .attr('text-anchor', 'middle')
    .attr(
      'transform',
      `rotate(-90 ${margins.left / 2} ${margins.bottom + innerHeight / 2})`
    )
    .text('Watt-hours produced')
    .attr('fill', '#AAAAAA')
    

  }
