import React, { useEffect, useRef } from 'react';
import { select, scaleLinear, axisBottom, axisLeft, histogram } from 'd3';

const DisplayDebug = ({ brightnessValues }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Clear existing SVG content
    select(svgRef.current).selectAll('*').remove();

    if (brightnessValues && brightnessValues.length > 0) {
      const margin = { top: 20, right: 20, bottom: 30, left: 50 };
      const width = 500 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const svg = select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Create histogram
      const bins = histogram().domain([0, 255]).thresholds(20)(brightnessValues);

      // X scale
      const x = scaleLinear()
        .domain([0, 255])
        .range([0, width]);

      // Y scale
      const y = scaleLinear()
        .domain([0, bins.reduce((max, d) => Math.max(max, d.length), 0)])
        .range([height, 0]);

      // Append bars
      svg.selectAll('rect')
        .data(bins)
        .enter()
        .append('rect')
        .attr('x', d => x(d.x0) + 1)
        .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr('y', d => y(d.length))
        .attr('height', d => height - y(d.length))
        .style('fill', 'steelblue');

      // Append axes
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(axisBottom(x));

      svg.append('g')
        .call(axisLeft(y));
    }
  }, [brightnessValues]);

  return <svg ref={svgRef}></svg>;
};

export default DisplayDebug;
