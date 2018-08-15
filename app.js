(function () {
    const height = 800;
    const width = 1200;
    let svg = d3.select("body")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .append("g")
        .attr("transform", `translate(50, 100)`);


    queue()
        .defer(d3.json, "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json")
        .defer(d3.json, "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json")
        .await((error, countiesData, educationData) => {
            if (error) console.log("error");
            let counties = topojson.feature(countiesData, countiesData.objects.counties).features;
            let colors = ["#FFCCBC", "#FFAB91", "#FF8A65", "#FF7043", "#FF5722", "#D84315", "#BF360C"]


            svg.selectAll(".county")
                .data(counties)
                .enter()
                .append("path")
                .attr("class", "county")
                .attr("d", d3.geoPath())
                .attr("fill", d => {
                    let result = educationData.filter(obj => obj.fips == d.id);
                    if(result[0]) {
                        return colors[Math.round(result[0].bachelorsOrHigher/10)]
                    }
                })
                .on("mouseover", d => {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(_ => {
                        let result = educationData.filter(obj => obj.fips == d.id)
                        if (result[0]) {
                            return `${result[0].area_name}, ${result[0].state}: ${result[0].bachelorsOrHigher}%`
                        }
                    })
                        .style("left", `${d3.event.pageX + 20}px`)
                        .style("top", `${d3.event.pageY}px`)
                })
                .on("mouseout", _ => {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0)
                })

            let div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)


            //refer: https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
            //append a defs (for definition) element to your SVG
            let defs = svg.append("defs")

            let linearGradient = defs.append("linearGradient")
                .attr("id", "legend")

            linearGradient
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%")

            let percentage = 100/7

            linearGradient.selectAll("stop")
                .data([
                    {offset: `${percentage}%`, color: "#FFCCBC"},
                    {offset: `${percentage*2}%`, color: "#FFAB91"},
                    {offset: `${percentage*3}%`, color: "#FF8A65"},
                    {offset: `${percentage*4}%`, color: "#FF7043"},
                    {offset: `${percentage*5}%`, color: "#FF5722"},
                    {offset: `${percentage*6}%`, color: "#D84315"},
                    {offset: `${percentage*7}%`, color: "#BF360C"}
                ])
                .enter().append("stop")
                .attr("offset", function(d) { return d.offset; })
                .attr("stop-color", function(d) { return d.color; });

            let legendWidth = 300;

            svg.append("rect")
                .attr("width", legendWidth)
                .attr("height", 20)
                .style("fill", "url(#legend)")
                .attr("transform", `translate(1100, 600) rotate(-90)`)

            let yScale = d3.scaleLinear()
                .domain([0.7, 0.1])
                .range([legendWidth/colors.length, legendWidth - (legendWidth/colors.length)])

            let yAxis = d3.axisLeft()
                .scale(yScale)
                .ticks(8)
                .tickFormat(d3.format(".0%"))

            let yAxisGroup = svg.append("g")
                .attr("transform", `translate(1100, ${legendWidth})`)
                .attr("class", "axis")
                .call(yAxis);

        })

})();
