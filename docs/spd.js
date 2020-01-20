let margins = {top: 30, bottom: 30, left: 30, right: 30}
let outerWidth = 800
let outerHeight = 450
let innerWidth = outerWidth - margins.left - margins.right
let innerHeight = outerHeight - margins.top - margins.bottom


let svgHM = d3.select('#heat-map')
  .attr('width', outerWidth)
  .attr('height', outerHeight)
  .append('g')
  .attr('id', 'plot-area')
  .attr('transform', 'translate('+ margins.left + ',' + margins.top ')')
