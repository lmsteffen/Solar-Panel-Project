let margins = { top: 60, bottom: 45, left: 60, right: 60 };
let outerWidth = 1000;
let outerHeight = 562.5;
let innerWidth = outerWidth - margins.left - margins.right;
let innerHeight = outerHeight - margins.top - margins.bottom;

let outerWidthHM = 1000;
let outerHeightHM = 600;
let marginsHM = { top: 45, bottom:45, left: 60, right: 250 };
let innerWidthHM = outerWidthHM - marginsHM.left - marginsHM.right;
let innerHeightHM = outerHeightHM - marginsHM.top - marginsHM.bottom;

let lmsData = []
let hmData = []
let flatData = []
let months = [4, 5, 6, 7, 8, 9, 10, 11, 12]
let hours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
let pointsList = []



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


function wrangle(data) {
  flatData = []

  lmsData = data
  hmData = d3.rollup(lmsData, v => d3.mean(v, v => v.W) * 4, d => +d.Month, d => +d.Hour)
  console.log(hmData)
  for (let m of months){
    for (let h of hours) {
      flatData.push({
        month: m,
        hour: h,
        W: hmData.get(m).get(h)
      }) 
    }
  }
}

let wattScale = d3
.scaleLinear() 
.domain( [0, 6012] )
.range([innerHeight, 0]);
let wattAxis = d3.axisLeft(wattScale)


let timeScale = d3 //make sure you use timeClean()
.scaleLinear()
.domain( [0, 24] )
.range([0, innerWidth])
let timeAxis = d3.axisBottom(timeScale).ticks()//.tickValues()

Promise.all([
d3.csv('ordered-data.csv'),
d3.csv('heatmap-data.csv')
]).then(function(data) {
  draw(data[0])
  wrangle(data[1])
  drawHM(data[1])
  updateLine(data[0])
})

function updateLine(solar) {
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
    .attr('opacity', 1)
}
  
  
function draw(solar) {    

  adhOuter //border
    .append("rect")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
    .attr("fill", "transparent")
    .attr("stroke", "#333333")
    .attr("stroke-width", 3);
  

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
    .attr('y', outerHeight - margins.bottom / 2 + 12)
    .attr('text-anchor', 'middle')
    .text('Time of Day (in Hours)')
    .attr('fill', '#FFFFFF')

  adhOuter //y text
    .append('text')
    .attr('class', 'y axis')
    .attr('x', margins.left / 2)
    .attr('y', margins.bottom + innerHeight / 2 - 12)
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
    .domain(months)  // hmData?
    // .domain(['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
    .range([0, innerWidthHM])
  let monthAxis = d3.axisBottom(monthScale)

  let hourScale = d3
    .scaleBand()
    .domain(hours)
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
    
  lmsInner  // draw
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

    lmsOuter      // guide for watt-hours
    .append('rect')
    .attr('x', outerWidthHM - 150 )
    .attr('y', marginsHM.top)
    .attr('width', 75)
    .attr('height', innerHeightHM)
    .attr('stroke', 'white')
    .style("fill", "url(#linear-gradient)");

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

  let colorRange = ['#440154FF', '#481567FF', '#482677FF', '#453781FF', '#404788FF']
  // <color>#39568CFF </color>
  // <color>#33638DFF </color>
  // <color>#2D708EFF </color>
  // <color>#287D8EFF </color>
  // <color>#238A8DFF </color>
  // <color>#1F968BFF </color>
  // <color>#20A387FF </color>
  // <color>#29AF7FFF </color>
  // <color>#3CBB75FF </color>
  // <color>#55C667FF </color>
  // <color>#73D055FF </color>
  // <color>#95D840FF </color>
  // <color>#B8DE29FF </color>
  // <color>#DCE319FF </color>
  // <color>#FDE725FF]
        
  let color = d3.scaleLinear().range(colorRange).domain([1, 2, 3, 4, 5]);


  

