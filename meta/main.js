import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// read data from csv
async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: false,
        writable: false,
        enumerable: false   
      });

      return ret;
    });
}
function renderCommitInfo(data, commits) {
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add longest line
  dl.append('dt').text('Longest line');
  dl.append('dd').text(d3.max(data, (d) => d.length));

  // Add average line length
  dl.append('dt').text('Average line length');
  dl.append('dd').text(d3.mean(data, (d) => d.length).toFixed(2));

  // Add average time of day
  dl.append('dt').text('Average time of day');
  dl.append('dd').text(d3.mean(commits, (c) => c.hourFrac).toFixed(2)); 

  // Add average depth
  dl.append('dt').text('Average depth');
  dl.append('dd').text(d3.mean(data, (d) => d.depth).toFixed(2));
}

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);


