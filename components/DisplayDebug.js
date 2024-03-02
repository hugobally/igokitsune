import React, { useEffect, useRef } from 'react';
import { select, scaleLinear, axisBottom, axisLeft, interpolateRgb, scaleOrdinal, schemeCategory10 } from 'd3';

const DisplayDebug = ({ points }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Clear existing SVG content
    select(svgRef.current).selectAll('*').remove();

    if (points && points.length > 0) {
      const margin = { top: 20, right: 20, bottom: 30, left: 50 };
      const width = 500 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom; // Adjusted height

      // Extract x and y coordinates from points
      const xValues = points.map(point => point.coords.x);
      const yValues = points.map(point => point.coords.y);

      const svg = select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height * 2 + margin.top + margin.bottom) // Doubled height for two graphs
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // X scale
      const x = scaleLinear()
        .domain([Math.min(...xValues), Math.max(...xValues)])
        .range([0, width]);

      // Y scale
      const y = scaleLinear()
        .domain([Math.min(...yValues), Math.max(...yValues)])
        .range([height, 0]);

      // Color scale for the first graph
      const colorScale = interpolateRgb('blue', 'red');

      // Append circles for each data point with tooltips (First graph)
      points.forEach(point => {
        const { coords, brightness } = point;

        svg.append('circle')
          .attr('cx', x(coords.x))
          .attr('cy', y(coords.y))
          .attr('r', 5) // Fixed radius for all circles
          .style('fill', colorScale(brightness / 255)) // Use brightness value for color scale
          .on('mouseover', (event) => {
            // Show tooltip
            tooltip.style('visibility', 'visible').text(`Brightness: ${brightness}`);
          })
          .on('mousemove', (event) => {
            // Move tooltip with mouse
            tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
          })
          .on('mouseout', () => {
            // Hide tooltip on mouseout
            tooltip.style('visibility', 'hidden');
          });
      });

      // Append axes for the first graph
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(axisBottom(x));

      svg.append('g')
        .call(axisLeft(y));

      // Color scale for the second graph based on cluster values
      const colorScaleCluster = scaleOrdinal(schemeCategory10);

      // Append circles for each data point with tooltips (Second graph)
      points.forEach(point => {
        const { coords, cluster } = point;

        svg.append('circle')
          .attr('cx', x(coords.x))
          .attr('cy', y(coords.y) + height + margin.bottom) // Adjusted y position for the second graph
          .attr('r', 5) // Fixed radius for all circles
          .style('fill', colorScaleCluster(cluster))
          .on('mouseover', (event) => {
            // Show tooltip
            tooltip.style('visibility', 'visible').text(`Cluster: ${cluster}`);
          })
          .on('mousemove', (event) => {
            // Move tooltip with mouse
            tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
          })
          .on('mouseout', () => {
            // Hide tooltip on mouseout
            tooltip.style('visibility', 'hidden');
          });
      });

      // Append axes for the second graph
      svg.append('g')
        .attr('transform', `translate(0,${height * 2 + margin.bottom})`) // Adjusted position for the second graph
        .call(axisBottom(x));

      svg.append('g')
        .attr('transform', `translate(0,${height + margin.bottom})`) // Adjusted position for the second graph
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

  return <svg ref={svgRef}></svg>;
};

export default DisplayDebug;
