import React, { useEffect, useRef } from 'react';
import { select, scaleLinear, axisBottom, axisLeft, interpolateRgb } from 'd3';

const DisplayDebug = ({ points }) => {
  const svgRef = useRef(null);
  const svgRef2 = useRef(null);

  useEffect(() => {
    // Clear existing SVG content
    select(svgRef.current).selectAll('*').remove();
    select(svgRef2.current).selectAll('*').remove();

    if (points && points.length > 0) {
      const margin = { top: 20, right: 20, bottom: 30, left: 50 };
      const width = 500 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom; // Adjusted height

      // Extract x and y coordinates from points
      const xValues = points.map(point => point.coords.x);
      const yValues = points.map(point => point.coords.y);

      // Create SVG for the first graph
      const svg = select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // X scale for the first graph
      const x = scaleLinear()
        .domain([Math.min(...xValues), Math.max(...xValues)])
        .range([0, width]);

      // Y scale for the first graph
      const y = scaleLinear()
        .domain([Math.min(...yValues), Math.max(...yValues)])
        .range([height, 0]);

      // Color scale for the first graph
      const colorScale = interpolateRgb('blue', 'red');

      // Append circles for each data point with tooltips for the first graph
      svg.selectAll('circle')
        .data(points)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.coords.x))
        .attr('cy', d => y(d.coords.y))
        .attr('r', 5) // Fixed radius for all circles
        .style('fill', d => colorScale(d.brightness / 255)) // Use brightness value for color scale
        .on('mouseover', (event, d) => {
          // Show tooltip
          tooltip.style('visibility', 'visible').text(`Brightness: ${d.brightness}`);
        })
        .on('mousemove', (event) => {
          // Move tooltip with mouse
          tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', () => {
          // Hide tooltip on mouseout
          tooltip.style('visibility', 'hidden');
        });

      // Append axes for the first graph
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(axisBottom(x));

      svg.append('g')
        .call(axisLeft(y));

      // Create SVG for the second graph
      const svg2 = select(svgRef2.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Append circles for each data point with tooltips for the second graph
      svg2.selectAll('circle')
        .data(points)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.coords.x))
        .attr('cy', d => y(d.coords.y))
        .attr('r', 5) // Fixed radius for all circles
        .style('fill', d => {
          if (d.stone === 'black') return 'blue';
          else if (d.stone === 'white') return 'white';
          else return 'black';
        }) // Use 'stone' value for color
        .on('mouseover', (event, d) => {
          // Show tooltip
          tooltip.style('visibility', 'visible').text(`Stone: ${d.stone}`);
        })
        .on('mousemove', (event) => {
          // Move tooltip with mouse
          tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', () => {
          // Hide tooltip on mouseout
          tooltip.style('visibility', 'hidden');
        });

      // Append axes for the second graph
      svg2.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(axisBottom(x));

      svg2.append('g')
        .call(axisLeft(y));
    }
  }, [points]);

  const tooltip = select('body')
    .append('div')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden')
    .style('background', '#000')
    .style('color', '#fff')
    .text(''); // Initial empty text

  return (
    <div>
      <svg ref={svgRef}></svg>
      <svg ref={svgRef2}></svg>
    </div>
  );
};

export default DisplayDebug;
