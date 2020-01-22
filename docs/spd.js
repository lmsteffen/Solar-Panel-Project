let margins = { top: 45, bottom: 45, left: 60, right: 45 };
let outerWidth = 800;
let outerHeight = 450;
let innerWidth = outerWidth - margins.left - margins.right;
let innerHeight = outerHeight - margins.top - margins.bottom;

let outerWidthHM = 700;
let outerHeightHM = 700;
let innerWidthHM = outerWidthHM - margins.left - margins.right;
let innerHeightHM = outerHeightHM - margins.top - margins.bottom;

let lmsData = []
let hmData = []

let lmsOuter = d3
  .select("#heat-map")
  .attr("width", outerWidthHM)
  .attr("height", outerHeightHM)

let lmsInner = lmsOuter
  .append("g")
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
  

function timeclean(time) { //takes "HH:MM" as input and outputs total minutes
  hr = +time.slice(0,2)
  min = +time.slice(3,5)
  return hr + min/60
}

function wrangle(data) {
  lmsData = data
  hmData = d3.rollups(lmsData, v => d3.mean(v, v => v.W) * 4, d => d.Month, d => d.Hour)
}

  Promise.all([
  d3.csv('ordered-data.csv'),
  d3.csv('heatmap-data.csv')
  ]).then(function(data) {
    draw(data[0])
    wrangle(data[1])
    drawHM(data[1])
  })
  
  
  function draw(solar) {    

    adhOuter //border
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

    adhInner //points
      .selectAll('circle')
      .data(solar)
      .enter()
      .append('circle')
      .attr('cx', d => timeScale(timeclean(d.Time)))
      //.attr('cx', d => testTimeScale(d.Time))
      .attr('cy', d => wattScale(d.W))
      .style('fill', 'red')
      .attr('r', .5)

    
    adhInner //lines?
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

  adhOuter //x text
    .append('text')
    .attr('class', 'x axis')
    .attr('x', margins.left + innerWidth / 2)
    .attr('y', outerHeight - margins.bottom / 4)
    .attr('text-anchor', 'middle')
    .text('Time of Day (in Hours)')
    .attr('fill', '#FFFFFF')

  adhOuter //y text
    .append('text')
    .attr('class', 'y axis')
    .attr('x', margins.left / 2)
    .attr('y', margins.bottom + innerHeight / 2.16)
    .attr('text-anchor', 'middle')
    .attr(
      'transform',
      `rotate(-90 ${margins.left / 2} ${margins.bottom + innerHeight / 2})`
    )
    .text('Watt-hours')
    .attr('fill', '#FFFFFF')


  }

function drawHM(data) {

  lmsOuter //border
    .append("rect")
    .attr("width", outerWidthHM)
    .attr("height", outerHeightHM)
    .attr("fill", "transparent")
    .attr("stroke", "#333333")
    .attr("stroke-width", 3);

  let colorScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateViridis)
    .domain([0, 16580])

  let monthScale = d3
    .scaleBand()
    .domain([4, 5, 6, 7, 8, 9, 10, 11, 12])  // hmData?
    // .domain(['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
    .range([0, innerWidthHM])
  let monthAxis = d3.axisBottom(monthScale)

  let hourScale = d3
    .scaleBand()
    .domain([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])
    .range([innerHeightHM, 0])
  let hourAxis = d3.axisLeft(hourScale)

  lmsInner  // x axis for heat map
    .append('g')
    .attr('transform', 'translate(' + 0 + ',' + innerHeightHM + ')')
    .attr('class', 'x axis')
    .call(monthAxis)

  lmsInner  // y axis for heat map
    .append('g')
    .attr('class', 'y axis')
    .call(hourAxis)  
    
  lmsInner
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => monthScale(d.Month))  // ask about this too
    .attr('y', d => hourScale(d.Hour))
    .attr('width', monthScale.bandwidth())
    .attr('height', hourScale.bandwidth())
    .style('stroke', 'red')

  lmsOuter 
    .append('text')
    .attr('class', 'x axis')
    .attr('x', margins.left + innerWidthHM / 2)
    .attr('y', outerHeightHM - margins.bottom / 3)
    .attr('text-anchor', 'middle')
    .text('Month')
    .attr('fill', '#FFFFFF')

    lmsOuter
    .append('text')
    .attr('class', 'y axis')
    .attr('x', margins.left / 2)
    .attr('y', outerHeightHM - margins.bottom - innerHeightHM / 2.5 )
    .attr(
      'transform',
      `rotate(-90 ${margins.left / 2} ${outerHeightHM - margins.bottom - innerHeightHM / 2.5 })`
    )
    .text('Time of Day (Hours)')
    .attr('fill', '#FFFFFF')
  }

  

