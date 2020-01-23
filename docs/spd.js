let margins = { top: 45, bottom: 45, left: 60, right: 45 };
let outerWidth = 800;
let outerHeight = 450;
let innerWidth = outerWidth - margins.left - margins.right;
let innerHeight = outerHeight - margins.top - margins.bottom;

let outerWidthHM = 600;
let outerHeightHM = 600;
let marginsHM = { top: 150, bottom:45, left: 60, right: 45 };
let innerWidthHM = outerWidthHM - marginsHM.left - marginsHM.right;
let innerHeightHM = outerHeightHM - marginsHM.top - marginsHM.bottom;

let hmData = []
let flatData = []
let months = [4, 5, 6, 7, 8, 9, 10, 11, 12]
// let months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
let hours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]



let lmsOuter = d3
  .select("#heat-map")
  .attr("width", outerWidthHM)
  .attr("height", outerHeightHM)

let lmsInner = lmsOuter
  .append("g")
  .attr("transform", "translate(" + marginsHM.left + "," + marginsHM.top + ")")

let adhOuter = d3
  .select("#adhviz")
  .attr("width", outerWidth)
  .attr("height", outerHeight);

let adhInner = adhOuter
  .append("g")
  .attr("width", innerWidth)
  .attr("height", innerHeight)
  .attr("transform", "translate(" + margins.left + "," + margins.right + ")");
  

function timeClean(time) { //takes "HH:MM" as input and outputs total minutes
  hr = +time.slice(0,2)
  min = +time.slice(3,5)
  return hr + min/60
}


function flatten(data) {
  flatData = []
  hmData = d3.rollup(data, v => d3.mean(v, v => v.W) * 4, d => +d.Month, d => +d.Hour)
  for (let m of months){
    for (let h of hours) {
      flatData.push({
        month: m,
        hour: h,
        W: hmData.get(m).get(h)
      }) 
    }
  }
  drawHM(flatData)
}

Promise.all([
d3.csv('ordered-data.csv'),
d3.csv('heatmap-data.csv')
]).then(function(data) {
  draw(data[0])
  flatten(data[1])
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
    .scaleLinear() 
    .domain( [Math.min(...solar.map(d => d.W)), Math.max(...solar.map(d => d.W))] )
    .range([innerHeight, 0]);
  let wattAxis = d3.axisLeft(wattScale)


  let timeScale = d3 //make sure you use timeClean()
    .scaleLinear()
    .domain( [0000, 24] )
    .range([0, innerWidth])
  let timeAxis = d3.axisBottom(timeScale).ticks()//.tickValues()

    /* adhInner //points
      .selectAll('circle')
      .data(solar)
      .enter()
      .append('circle')
      .attr('cx', d => timeScale(timeClean(d.Time)))
      //.attr('cx', d => testTimeScale(d.Time))
      .attr('cy', d => wattScale(d.W))
      .style('fill', 'red')
      .attr('r', .5) */

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

  let pointsList = []

  for (let i = 0; i < solar.length; i++) { //creates list of points to plot with line
    pointsList.push([timeScale(timeClean(solar[i]['Time'])), wattScale(solar[i]['W'])])
    }

  let lineGen = d3.line()
  let pathData = lineGen(pointsList)

  adhInner //line
    .append('path')
    .attr('d', pathData)
    .attr('stroke-width', .15)
    .attr('stroke', 'yellow')
    .attr('fill', 'transparent')
    .attr('opacity', .9)

   

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
    .domain(months)  
    .range([0, innerWidthHM])
    .padding(0.1)
  let monthAxis = d3.axisBottom(monthScale)

  let hourScale = d3
    .scaleBand()
    .domain(hours)
    .range([innerHeightHM, 0])
    .padding(0.05)
  let hourAxis = d3.axisLeft(hourScale)

  lmsInner  // x axis for heat map
    .append('g')
    .style('font', "14px Gill Sans")
    .attr('transform', 'translate(' + 0 + ',' + innerHeightHM + ')')
    .attr('class', 'x axis')
    .call(monthAxis.tickSize(0))
    .select('.domain')
    .remove()


  lmsInner  // y axis for heat map
    .append('g')
    .style('font', "14px Gill Sans")
    .attr('class', 'y axis')
    .call(hourAxis.tickSize(0))
    .select('.domain')
    .remove()
    
  lmsInner  // draw
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => monthScale(d.month))  // ask about this too
    .attr('y', d => hourScale(d.hour))
    .attr('width', monthScale.bandwidth())
    .attr('height', hourScale.bandwidth())
    .style('stroke', '#FFFFFF')
    .style('fill', d => colorScale(d.W))

  lmsOuter 
    .append('text')  // x text
    .attr('class', 'x axis')
    .attr('x', marginsHM.left + innerWidthHM / 2)
    .attr('y', outerHeightHM - marginsHM.bottom / 3)
    .attr('text-anchor', 'middle')
    .text('Month')
    .attr('fill', '#FFFFFF')

  lmsOuter      // y text
    .append('text')
    .attr('class', 'y axis')
    .attr('x', marginsHM.left / 2)
    .attr('y', outerHeightHM - marginsHM.bottom - innerHeightHM / 2.5 )
    .attr(
      'transform',
      `rotate(-90 ${marginsHM.left / 2} ${outerHeightHM - marginsHM.bottom - innerHeightHM / 2.5 })`
    )
    .text('Time of Day (Hours)')
    .attr('fill', '#FFFFFF')
    
  lmsOuter      // text for legend
    .append('text')
    .attr('x', marginsHM.left + innerWidth / 5)
    .attr('y', marginsHM.top / 2.5)
    .attr('text-anchor', 'middle')
    .text('System Production (watt-hours)')
    .attr('fill', '#FFFFFF')
  
  let markers = ['0', '4145', '8290', '12435', '16580']  // markers for legend
  let j = 0
  for (let i = 0; i < 5; i++) {
    lmsOuter
      .append('text')
      .style('font', "14px Gill Sans")
      .attr('x', marginsHM.left + 6 + j)
      .attr('y', marginsHM.top / 1.3)
      .attr('text-anchor', 'middle')
      .text(markers[i])
      .attr('fill', '#FFFFFF');
    j += 64
  }

  lmsOuter             // legend 
    .append('rect')
    .attr('x', marginsHM.left + 6 )
    .attr('y', marginsHM.top / 2)
    // .attr('y', marginsHM.top)
    .attr('width', innerWidthHM / 1.86)
    .attr('height', hourScale.bandwidth())
    .attr('stroke', 'white')
    .style("fill", "url(#linear-gradient)");

  let colorRange = ['#450256', '#450256', '#21908D', '#5AC865', '#F9E721']   // hexcodes for the heat map legend 
  let color = d3.scaleLinear().range(colorRange).domain([1, 2, 3, 4, 5]);

  let linearGradient = lmsOuter.append("defs")
    .append("linearGradient")
    .attr("id", "linear-gradient");

  linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", color(1));

  linearGradient.append("stop")
    .attr("offset", "25%")
    .attr("stop-color", color(2));

  linearGradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", color(3));

  linearGradient.append("stop")
    .attr("offset", "75%")
    .attr("stop-color", color(4));

  linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", color(5)); 
}

  


  

