import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import * as d3legend from 'd3-svg-legend';

const statesUrl =
  'https://willhaley.com/assets/united-states-map-react/states.json';
const censusUrl =
  'https://api.census.gov/data/2017/pep/population?get=DENSITY,POP,GEONAME&for=state:*&key=adf88ad3c636c937ec56f2c73738a360f183e603';

const WorldMap = () => {
  const [states, setStates] = useState([]);
  const [tooltipData, setTooltipData] = useState({ name: '', population: 0 });
  const tooltip = useRef(null);

  useEffect(() => {
    axios
      .all([axios.get(statesUrl), axios.get(censusUrl)])
      .then(([{ data: states }, { data: census }]) => {
        setStates(
          states.map(state => {
            const info = census.find(c => c[2] === state.name);
            const density = info ? info[0] : 0;
            const population = info ? info[1] : 0;

            return { ...state, density, population };
          })
        );
      });
  }, []);

  useEffect(() => {
    const min = Math.min(
      ...states.map(state => state.density).filter(density => density !== 0)
    );
    const max = Math.max(...states.map(state => state.density));

    const log = d3.scaleSequential(d3.interpolateOranges).domain([min, max]);

    const svg = d3.select('.legendWrapper svg');

    svg
      .append('g')
      .attr('class', 'legendLog')
      .attr('transform', 'translate(10,20)');

    const logLegend = d3legend
      .legendColor()
      .title('Density per km2')
      .cells(6)
      .scale(log);

    svg.select('.legendLog').call(logLegend);
  }, [states]);

  const maxDensity = useMemo(
    () => Math.max(...states.map(state => state.density)),
    [states]
  );

  const handleMouseOver = (event, { density, name, population }) => {
    event.target.style.fill = `rgba(0,0,134,${density / maxDensity + 0.1})`;

    setTooltipData({ name, population });
    tooltip.current.style.display = 'block';
    tooltip.current.style.left = event.pageX + 10 + 'px';
    tooltip.current.style.top = event.pageY + 10 + 'px';
    tooltip.current.classList.add('tooltipVisible');
  };

  const handleMouseOut = (event, { density }) => {
    event.target.style.fill = d3.interpolateOranges(density / maxDensity);
    tooltip.current.style.display = 'none';
  };

  return (
    <>
      <div
        id="tooltip"
        display="none"
        className="tooltipNotVisible"
        ref={tooltip}
      >
        <h1 className="tooltipHeading">{tooltipData.name}</h1>
        <p className="tooltipPopulation">
          Population -{' '}
          {tooltipData.population
            ? Number(tooltipData.population).toLocaleString()
            : 'N/A'}
        </p>
      </div>
      <svg viewBox="0 0 960 600" style={{ maxHeight: '300px' }}>
        {states.map((state, index) => (
          <path
            style={{
              cursor: 'pointer',
              fill: d3.interpolateOranges(state.density / maxDensity)
            }}
            key={index}
            stroke="rgba(122, 122, 233, 0.1)"
            strokeWidth="2px"
            d={state.shape}
            onMouseOver={event => handleMouseOver(event, state)}
            onMouseOut={event => handleMouseOut(event, state)}
          />
        ))}
      </svg>

      <div className="legendWrapper">
        <svg className="legend" />
      </div>
    </>
  );
};

export default WorldMap;
