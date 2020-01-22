let margins = { top: 30, bottom: 30, left: 38, right: 30 };
let outerWidth = 800;
let outerHeight = 450;
let innerWidth = outerWidth - margins.left - margins.right;
let innerHeight = outerHeight - margins.top - margins.bottom;

let lmsData = []
let hmData = []

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

function wrangle(data) {
  lmsData = data
  hmData = d3.rollups(lmsData, v => d3.mean(v, v => v.W), d => d.Month, d => d.Hour)
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
      .domain( [0000, 1439] )
      .range([0, innerWidth])
    let timeAxis = d3.axisBottom(timeScale)

    adhInner //drawing
      .selectAll('circle')
      .data(solar)
      .enter()
      .append('circle')
      .attr('cx', d => timeScale(timeclean(d.Time)))
      .attr('cy', d => wattScale(d.W))
      .style('fill', 'red')
      .attr('r', .5)
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

  }

function drawHM(data) {

  lmsInner.append('circle')
    .attr('cx', 200)
    .attr('cy', 200)
    .attr('r', 20)
    .attr('fill', 'red')

  lmsOuter //border
    .append("rect")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
    .attr("fill", "transparent")
    .attr("stroke", "#333333")
    .attr("stroke-width", 3);

  let colorScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateViridis)
    .domain([0, 6012])

  let monthScale = d3
    .scaleBand()
    .domain([04, 12])
    // .domain(['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
    .range([0, innerWidth])
  let monthAxis = d3.axisBottom(monthScale)

  let hourScale = d3
    .scaleBand()
    .domain([00, 23])
    .range([innerHeight, 0])
  let hourAxis = d3.axisLeft(hourScale)

  lmsInner  // x axis for heat map
    .append('g')
    .attr('transform', 'translate(' + 0 + ',' + innerHeight + ')')
    .attr('class', 'x axis')
    .call(monthAxis)

  lmsInner  // y axis for heat map
    .append('g')
    .attr('class', 'y axis')
    .call(hourAxis)  
    
  // lmsInner
  //   .selectall('rect')
  //   .data()
  //   .enter()
  //   .append('rect')
  //   .attr('x', d => monthScale(d.Month))
  //   .attr('y', d => hourScale(d.Hour))
  //   .attr('width', monthScale.bandwidth())
  //   .attr('height', hourScale.bandwidth())
  //   .style('stroke', 'red')
  }
