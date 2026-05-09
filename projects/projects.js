import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const titleElement = document.querySelector('.projects-title');
titleElement.textContent = `${projects.length} Projects`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let query = '';
let selectedIndex = -1;

function filterProjects() {
  return projects.filter((project) => {
    // search filter
    const matchesSearch = Object.values(project)
      .join('\n')
      .toLowerCase()
      .includes(query.toLowerCase());

    // pie slice filter
    const matchesYear =
      selectedIndex === -1 || project.year === currentSelection;

    return matchesSearch && matchesYear;
  });
}

let currentSelection = null;

function renderPieChart(projectsGiven) {
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));
  
  let svg = d3.select('svg');
  svg.selectAll('path').remove();

  let legend = d3.select('.legend');
  legend.selectAll('li').remove();
  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
      .attr('class', 'legend-item') // set the class attribute
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
  });
  
  newArcs.forEach((arc, i) => {
    d3.select('svg').append('path')
    .attr('d', arc)
    .attr('fill', colors(i))
    .on('click', () => {
      
      if (selectedIndex === i) {
        selectedIndex = -1;
        currentSelection = null;
      } else {
        selectedIndex = i;
        currentSelection = newData[i].label;
      }

      svg
        .selectAll('path')
        .attr('class', (_, idx) => (
          idx === selectedIndex ? 'selected' : ''
        ));

      legend
        .selectAll('li')
        .attr('class', (_, idx) => (
          idx === selectedIndex ? 'legend-item selected' : 'legend-item'
        ));
      
      renderProjects(filterProjects(), projectsContainer, 'h2');
    });
  });
}

renderPieChart(projects);

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('change', (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  const searchFiltered = projects.filter((project) =>
    Object.values(project).join('\n').toLowerCase().includes(query.toLowerCase())
  );
  renderPieChart(searchFiltered);
  // render filtered projects
  renderProjects(filterProjects(), projectsContainer, 'h2');
});