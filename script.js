const url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'

const colors = [
  "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c",
  "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
  "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f",
  "#c7c7c7", "#bcbd22", "#dbdb8d"
];

const colorScale = d3.scaleOrdinal().range(colors);

const svg = d3
  .select('.main')
  .append('svg')
  .attr('width', 960)
  .attr('height', 600)
  .style('margin-top', 30 + 'px');

const treemap = d3.treemap().size([960, 600]).padding(1).round(true);

const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .attr('class', 'tooltip')
  .style('opacity', 0);

const legend = d3
  .select('.main')
  .append('svg')
  .attr('width', 400)
  .attr('height', 400)
  .attr('id', 'legend')
  .style('margin-top', 30 + 'px');

d3.json(url)
  .then(data => {
    const root = d3.hierarchy(data)
      .eachBefore(d => {
        d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
      })
      .sum(d => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.value);

    treemap(root);

    console.log(data);
    console.log(root.leaves());

    const cell = svg
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'group')
      .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

    cell
      .append('rect')
      .attr('class', 'tile')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('data-name', d => d.data.name)
      .attr('data-category', d => d.data.category)
      .attr('data-value', d => d.data.value)
      .style('fill', d => colorScale(d.data.category))
      .on('mouseover', (event, d) => {
        tooltip
          .style('opacity', 0.9)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 40 + 'px')
          .attr('data-value', d.data.value)
          .html(`
            Name: ${d.data.name}<br>
            Category: ${d.data.category}<br>
            Value: ${d.data.value}
          `);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    cell
      .append('text')
      .attr('class', 'tile-text')
      .attr('transform', `translate(0, 13)`)
      .selectAll('tspan')
      .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append('tspan')
      .attr('x', 4)
      .attr('y', (d, i) => i * 10)
      .text(d => d);

    const categories = [... new Set(root.leaves().map(nodes => nodes.data.category))];
    console.log(categories);

    const category = legend
      .selectAll('g')
      .data(categories)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(${(i % 3) * 150}, ${Math.floor(i / 3) * 15 + 15 * Math.floor(i / 3)})`);

    category
      .append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('class', 'legend-item')
      .style('fill', d => colorScale(d));

    category
      .append('text')
      .attr('x', 20)
      .attr('y', 13.5)
      .style('font-size', '1rem')
      .text(d => d)
  })
  .catch(e => console.log(e));