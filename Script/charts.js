//
//  charts.js
//  What Can A Technologist Do About Climate Change?
//
//  Bret Victor, November 2015
//  MIT open-source license.
//

var svgns = "http://www.w3.org/2000/svg";

function placeChart(div, name) {
    var data = chart_data[name];
    
    var figure = div;

    var titleHTML = (data.icon ? data.icon + " " : "") + data.title;
    titleHTML += ' <span class="cite">' + 
                  getHTMLForCitation("source", data.href) +
                  getHTMLForCitation("data", "data.html?id=" + name) +
                 '</span>';
    var title = createElement("div", { "class":"figure-caption" + (data.icon ? " with-icon" : ""), "html":titleHTML });
    figure.appendChild(title);

    var svg = document.createElementNS(svgns, "svg");
    svg.setAttribute("class", "chart");
    figure.appendChild(svg);
    
    if (!data.chart) { 
        drawBarChart(svg,data);
    }
    else if (data.chart === "stacked") {
        drawStackedBars(svg,data);
    }
    else {
        console.log("unknown chart type", data.chart);
    }
}

function getHTMLForCitation(what, href) {
    if (!href) { return ""; }
    return '<a href="' + href + '">(' + what + ')</a>';
}


// draw

function drawBarChart (svg,data) {
    var sum = data.bars.reduce(function (acc,bar) { return acc + bar[1]; }, 0);
    var max = data.bars.reduce(function (acc,bar) { return Math.max(acc, bar[1]); }, 0);
    
    var topValue = data.topValue || max;
    var fullWidth = data.fullWidth || 440;
    var labelWidth = data.labelWidth || 120;
    var barHeight = data.barHeight || 6;
    var barYOffset = data.barYOffset || 4;
    var lineHeight = data.lineHeight || 13;
    var format = data.format || "%d";
    var scale = data.scaleToSum ? (data.scaleToSum / sum) : 1;
    
    if (data.pixelsPerValue) {
        fullWidth = labelWidth + Math.ceil(data.pixelsPerValue * max * scale) + 5;
    }

    var barWidth = fullWidth - labelWidth;
    var fullHeight = data.fullHeight || (data.bars.length * lineHeight);
    
    var x = function (a) { return remap(a, 0, topValue, 0, barWidth); };
    
    svg.setAttributeNS(null, "width", fullWidth);
    svg.setAttributeNS(null, "height", fullHeight);
    
    data.bars.forEach(function (d, i) {
        var g = document.createElementNS(svgns, "g");
        g.setAttributeNS(null, "transform", "translate(0," + (i * lineHeight) + ")");
        
        var rect = document.createElementNS(svgns, "rect");
        rect.setAttributeNS(null, "class", (d[2] && d[2].class) || data.rectClass || "" );
        rect.setAttributeNS(null, "x", labelWidth);
        rect.setAttributeNS(null, "y", barYOffset);
        rect.setAttributeNS(null, "width", x(d[1]));
        rect.setAttributeNS(null, "height", barHeight);
        g.appendChild(rect);

        var label = document.createElementNS(svgns, "text");
        label.setAttributeNS(null, "class", "label");
        label.setAttributeNS(null, "x", 0);
        label.setAttributeNS(null, "y", 0);
        label.setAttributeNS(null, "dy", "1em");
        label.appendChild(document.createTextNode(d[0]));
        g.appendChild(label);
        
        var amount = document.createElementNS(svgns, "text");
        amount.setAttributeNS(null, "class", "amount");
        amount.setAttributeNS(null, "x", labelWidth - 5);
        amount.setAttributeNS(null, "y", 0);
        amount.setAttributeNS(null, "dy", "1em");
        amount.appendChild(document.createTextNode(
            typeof(format) == "function" ? format(d[1]*scale, i, sum*scale) : sprintf(format, d[1]*scale)));
        g.appendChild(amount);
        
        if (d[2] && d[2].annotation) {
            var annotation = document.createElementNS(svgns, "text");                                         
            annotation.setAttributeNS(null, "class", "annotation")
            annotation.setAttributeNS(null, "x", labelWidth + x(d[1] * scale) + 5);
            annotation.setAttributeNS(null, "y", 0);
            annotation.setAttributeNS(null, "dy", "1em");
            annotation.appendChild(document.createTextNode(d[2].annotation));
            g.appendChild(annotation);
        }             

        svg.appendChild(g);
    });
}

function drawStackedBars (svg,data) {
    var fullWidth = data.fullWidth || 440;
    var labelWidth = data.labelWidth || 120;
    var lineHeight = data.lineHeight || 13;
    var captionHeight = 13;
    var format = data.format || "%d";

    var barWidth = fullWidth - labelWidth;
    var fullHeight = captionHeight + data.bars.length * lineHeight;
    
    var x = function (a) { return remap(a, 0, data.topValue, 0, barWidth); };
    
    svg.setAttributeNS(null, "width", fullWidth);
    svg.setAttributeNS(null, "height", fullHeight);

    data.bars.forEach(function (bar) {
        var cumsum = 0;
        bar.segments = bar[1].map(function (n,i) {
            var segment = { left:cumsum, width:n };
            cumsum += n;
            return segment;
        });
        bar.sum = cumsum;
    });

    var labeldata = data.labels.map(function (label, i) {
        return { label:label, segment:data.bars[0].segments[i] };
    });
    
    
    // captions
    
    var captions = document.createElementNS(svgns, "g");
    captions.setAttributeNS(null, "transform", "translate(" + labelWidth + ",0)");
    
    labeldata.forEach(function (d,i) {
        var caption = document.createElementNS(svgns, "text");
        caption.setAttributeNS(null, "class", "label stack-caption")
        caption.setAttributeNS(null, "x", x(d.segment.left + 0.5 * d.segment.width));
        caption.setAttributeNS(null, "y", captionHeight - 1);
        caption.appendChild(document.createTextNode(d.label));
        captions.appendChild(caption);
    });

    svg.appendChild(captions);
        
        
    // bars

    data.bars.forEach(function (d, i) {
        var g = document.createElementNS(svgns, "g");
        g.setAttributeNS(null, "transform", "translate(0," +  (captionHeight + i * lineHeight) + ")");

        var label = document.createElementNS(svgns, "text");
        label.setAttributeNS(null, "class", "label");
        label.setAttributeNS(null, "x", 0);
        label.setAttributeNS(null, "y", 0);
        label.setAttributeNS(null, "dy", "1em");
        label.appendChild(document.createTextNode(d[0]));
        g.appendChild(label);

        var amount = document.createElementNS(svgns, "text");
        amount.setAttributeNS(null, "class", "amount");
        amount.setAttributeNS(null, "x", labelWidth - 5);
        amount.setAttributeNS(null, "y", 0);
        amount.setAttributeNS(null, "dy", "1em");
        amount.appendChild(document.createTextNode(
            typeof(format) == "function" ? format(d.sum) : sprintf(format, d.sum)));
        g.appendChild(amount);
              
        var stack = document.createElementNS(svgns, "g");
        stack.setAttributeNS(null, "transform", "translate(" + labelWidth + ",0)");
        
        d.segments.forEach(function (d,i) {
            var rect = document.createElementNS(svgns, "rect");
            rect.setAttributeNS(null, "class", "segment" + i);
            rect.setAttributeNS(null, "x", x(d.left));
            rect.setAttributeNS(null, "y", 4);
            rect.setAttributeNS(null, "width", x(d.width) - 2);
            rect.setAttributeNS(null, "height", 6);
            stack.appendChild(rect);
        });
        
        g.appendChild(stack);
        svg.appendChild(g);
    });
}
