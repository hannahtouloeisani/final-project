const svgBar = d3.select("#svg3"),
    margin = {
        top: 20,
        right: 110,
        bottom: 20,
        left: 40
    },
    width = +svgBar.attr("width") - margin.left - margin.right,
    height = +svgBar.attr("height") - margin.top - margin.bottom,
    g = svgBar.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Set x, y and colors
const x = d3.scaleBand()
    .rangeRound([10, width - 10])
    .padding(0.2)

const y = d3.scaleLinear()
    .range([height, 0]);

const z = d3.scaleOrdinal(["7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666", "#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf","#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#a6cee3","#b2df8a","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]);

d3.csv('https://raw.githubusercontent.com/moonpieluvincutie/Spotify/main/top10s%20(version%201).xlsb.csv', (d) => ({
    year: +d.year,
    pop: d.pop,
    genre: d['top genre'],
})).then((data) => {

    // Transform the data into groups by genre and year
    const groupedDataset = d3.rollups(data, v => d3.mean(v, d => d.pop), d => d.year, d => d.genre)
    const flattenedDataset = groupedDataset.map(([year, values]) => {
        return {
            year,
            ...values.reduce((acc, [genre, pop]) => {
                acc[genre] = pop;
                return acc;
            }, {}),
        }
    });

    const genres = d3.rollups(data, () => null, d => d.genre).map(([genre]) => genre);


    // Stack grouped data
    const dataset = d3.stack()
        .keys(genres)
        .value((d, key) => d[key] ?? 0)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone)
        (flattenedDataset)

    // Assign x, y and z (aka genre group) domains
    x.domain(groupedDataset.map(([year]) => year));
    y.domain([0, d3.max(
        dataset, (d) => {
            return d3.max(d, ([y]) => y)
        }
    )]).nice();
    z.domain(genres);

    const yAxis = d3.axisLeft()
        .scale(y)
        .ticks(5)
        .tickSize(-width, 0, 0)
        .tickFormat((d) => {
            return d
        })


    const xAxis = d3.axisBottom()
        .scale(x)

    g.append("g")
        .selectAll("g")
        .data(dataset)
        .enter().append("g")
        .attr("fill", (d) => z(d.key))
        .selectAll("rect")
        .data((d) => d)
        .enter().append("rect")
        .attr("x", (d) => x(+d.data.year))
        .attr("y", (d) => y(d[1]))
        .attr("height", (d) => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on('mouseover', (event,d) => {
            d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY + 10) + 'px')
                .html(`
              <div class="tooltip-title">${d.data.genre}</div>
              <div><i>${d.data.year}</i></div>
              <ul>
                <li>Popularity:${d.data.pop}</li>
              </ul>
              
            `);


        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
        })

        .on("click", function(event, d) {
            console.log(d);
            console.log(d3.pointer(event));
        })
    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    g.append("g")
        .attr("class", "axis")
        .call(yAxis)
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Popularity");
    // Tooltip event listeners

    const legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(genres.slice().reverse())
        .enter().append("g")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
        .attr("x", width - 10)
        .attr("y", 5)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 10)
        .attr("y", 5)
        .attr("dy", "0.32em")
        .style("text-anchor", "start")
        .style("alignment-baseline", "ideographic")
        .text((d) => d);

})
const data = [{category: 'Pop', measure: 10113},
    {category: "HipHop", measure: 1421},
    {category: "Rock", measure: 1777},
    {category: "Indie", measure: 94},
    {category: "Soul", measure: 684},
    {category: "House", measure: 1347},
    {category: "Latin", measure: 267},
    {category: "Electronic", measure: 2485}];


const svg = d3.select("#svg2"),
    widthPie = svg.attr("width"),
    heightPie = svg.attr("height"),
    radius = Math.min(widthPie, heightPie) / 2,
    gPie = svg.append("g").attr("transform", "translate(" + width / 2.9 + "," + height / 3.2 + ")");

const color = d3.scaleOrdinal(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]);

const pie = d3.pie()
    .value(function (d) {
        return d.measure;
    });

const path = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

const label = d3.arc()
    .outerRadius(radius)
    .innerRadius(radius - 200)


// Generate the arcs
const arc = gPie.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
    .attr("class", "arc");

arc.append("path")
    .attr("d", path)
    .attr("fill", function (d) {
        return color(d.data.category)
    })


//Generate groups
const arcs = gPie.selectAll("arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc")



arc.append("text")
    .attr("text-anchor", "end")
    .attr("transform", function (d) {
        return "translate(" + label.centroid(d) + ")";
    })
    .text(function (d) {
        return d.data.category;
    })
    .on("click", function (event, d) {
        console.log(d);
        console.log(d3.pointer(event))
    })
arcs.append("path")
    .attr('d', arc)
    .attr("transform", function (d, i) {
        return color(i);
    })
    .text(function (d) {
        return d.data.category
    })
    .attr("d", arc);
d3.selectAll("g.slice").selectAll("path").transition()
    .duration(750)
    .delay(10);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all") // **********
    .on("mouseover", function () {
        focus.style("display", null);
    })
    .on("mouseout", function () {
        focus.style("display", "none");
    })
const popdata = [
    {group: "2010", category: "Pop", measure: 2679},
    {group: "2011", category: "Pop", measure: 372},
    {group: "2012", category: "Pop", measure: 1034},
    {group: "2013", category: "Pop", measure: 1004},
    {group: "2014", category: "Pop", measure: 1059},
    {group: "2015", category: "Pop", measure: 1021},
    {group: "2016", category: "Pop", measure: 397},
    {group: "2017", category: "Pop", measure: 645},
    {group: "2018", category: "Pop", measure: 764},
    {group: "2019", category: "Pop", measure: 1138}];
const dataset2 = [
    {group: "2010", category: "HipHop", measure: 450},
    {group: "2011", category: "HipHop", measure: 122},
    {group: "2012", category: "HipHop", measure: 0},
    {group: "2013", category: "HipHop", measure: 160},
    {group: "2014", category: "HipHop", measure: 137},
    {group: "2015", category: "HipHop", measure: 105},
    {group: "2016", category: "HipHop", measure: 152},
    {group: "2017", category: "HipHop", measure: 237},
    {group: "2018", category: "HipHop", measure: 211},
    {group: "2019", category: "HipHop", measure: 84}];
const dataset3 = [
    {group: "2010", category: "Rock", measure: 83},
    {group: "2011", category: "Rock", measure: 0},
    {group: "2012", category: "Rock", measure: 49},
    {group: "2013", category: "Rock", measure: 135},
    {group: "2014", category: "Rock", measure: 518},
    {group: "2015", category: "Rock", measure: 0},
    {group: "2016", category: "Rock", measure: 99},
    {group: "2017", category: "Rock", measure: 41},
    {group: "2018", category: "Rock", measure: 0},
    {group: "2019", category: "Rock", measure: 0}];
const dataset4 = [
    {group: "2010", category: "Indie", measure: 0},
    {group: "2011", category: "Indie", measure: 0},
    {group: "2012", category: "Indie", measure: 49},
    {group: "2013", category: "Indie", measure: 36},
    {group: "2014", category: "Indie", measure: 0},
    {group: "2015", category: "Indie", measure: 58},
    {group: "2016", category: "Indie", measure: 0},
    {group: "2017", category: "Indie", measure: 0},
    {group: "2018", category: "Indie", measure: 0},
    {group: "2019", category: "Indie", measure: 0}];
const dataset5 = [
    {group: "2010", category: "Soul", measure: 0},
    {group: "2011", category: "Soul", measure: 156},
    {group: "2012", category: "Soul", measure: 76},
    {group: "2013", category: "Soul", measure: 0},
    {group: "2014", category: "Soul", measure: 0},
    {group: "2015", category: "Soul", measure: 454},
    {group: "2016", category: "Soul", measure: 421},
    {group: "2017", category: "Soul", measure: 120},
    {group: "2018", category: "Soul", measure: 76},
    {group: "2019", category: "Soul", measure: 0}];
const dataset6 = [
    {group: "2010", category: "House", measure: 0},
    {group: "2011", category: "House", measure: 0},
    {group: "2012", category: "House", measure: 0},
    {group: "2013", category: "House", measure: 238},
    {group: "2014", category: "House", measure: 214},
    {group: "2015", category: "House", measure: 335},
    {group: "2016", category: "House", measure: 201},
    {group: "2017", category: "House", measure: 277},
    {group: "2018", category: "House", measure: 0},
    {group: "2019", category: "House", measure: 82}];
const dataset7 = [
    {group: "2010", category: "Latin", measure: 0},
    {group: "2011", category: "Latin", measure: 0},
    {group: "2012", category: "Latin", measure: 0},
    {group: "2013", category: "Latin", measure: 0},
    {group: "2014", category: "Latin", measure: 0},
    {group: "2015", category: "Latin", measure: 0},
    {group: "2016", category: "Latin", measure: 47},
    {group: "2017", category: "Latin", measure: 76},
    {group: "2018", category: "Latin", measure: 68},
    {group: "2019", category: "Latin", measure: 76}];
const dataset8 = [
    {group: "2010", category: "Electronic", measure: 0},
    {group: "2011", category: "Electronic", measure: 0},
    {group: "2012", category: "Electronic", measure: 0},
    {group: "2013", category: "Electronic", measure: 149},
    {group: "2014", category: "Electronic", measure: 121},
    {group: "2015", category: "Electronic", measure: 195},
    {group: "2016", category: "Electronic", measure: 367},
    {group: "2017", category: "Electronic", measure: 780},
    {group: "2018", category: "Electronic", measure: 0},
    {group: "2019", category: "Electronic", measure: 579}];

const marginB = {top: 30, right: 90, bottom: 70, left: 60},
    widthB = 450 - marginB.left - marginB.right,
    heightB = 410 - marginB.top - marginB.bottom;

// append the svg object to the body of the page
const svgChart = d3.select("#svg1")
    .append("svg")
    .attr("width", widthB + marginB.left + marginB.right)
    .attr("height", heightB + marginB.top + marginB.bottom)
    .append("g")
    .attr("transform",
        "translate(" + marginB.left + "," + marginB.top + ")");
// Initialize the X axis
const xBar = d3.scaleBand()
    .range([ 0, widthB ])
    .padding(.20);
const xAxisBar = svgChart.append("g")
    .attr("transform", "translate(0," + heightB + ")")

// Initialize the Y axis
const yBar = d3.scaleLinear()
    .range([ heightB, 0]);
const yAxisBar = svgChart.append("g")
    .attr("class", "myYaxis")
// A function that create / update the plot for a given variable:
function update(data) {

    // Update the X axis
    xBar.domain(data.map(function(d) { return d.group; }))
    xAxisBar.call(d3.axisBottom(xBar))

    // Update the Y axis
    yBar.domain([0, d3.max(data, function(d) { return d.measure}) ]);
    yAxisBar.transition().duration(1000).call(d3.axisLeft(yBar));

    // Create the u variable
    const u = svgChart.selectAll("rect")
        .data(data)

    u
        .enter()
        .append("rect") // Add a new rect for each new elements
        .merge(u) // get the already existing elements as well
        .transition() // and apply changes to all of them
        .duration(1000)
        .attr("x", function(d) { return xBar(d.group); })
        .attr("y", function(d) { return yBar(d.measure); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return heightB - yBar(d.measure); })
        .attr("fill", "#69b3a2")

    // If less group in the new dataset, I delete the ones not in use anymore
    u
        .exit()
        .remove()


}
update(popdata)
update(dataset2)
update(dataset3)
update(dataset4)
update(dataset5)
update(dataset6)

update(dataset7)
update(dataset8)
