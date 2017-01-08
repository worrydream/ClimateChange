//
//  clunker.js
//  What Can A Technologist Do About Climate Change?
//
//  Bret Victor, November 2015
//  MIT open-source license.
//

(function () {

var clunkerTangle;
var clunkerCalculationDivs = {};

//--------------------------------------------------------------------------------
//
//  calculations for each calculated variable
//
//  These are both eval'd and turned into HTML for display

var clunkerModels = [
    {
        name:"cars_traded",
        lines: [
            "this.budget = params.budget",
            "this.rebate = params.rebate",
            "this.overhead = params.overhead",

            { spacer:2, },
            { comment:"Assume that the program “sells out”, and all available rebates are collected.  Given the demand for new cars, this will be true for any reasonable rebate amount." },
            { spacer:1 },
            "this.cars_traded = ( this.budget - this.overhead ) / this.rebate",
        ],
    },
    {
        name:"gallons_saved",
        lines: [
            "this.old_MPG_limit = params.old_MPG_limit",
            "this.old_MPGs = params.old_MPGs",
            { spacer:1 },
            "this.eligible_old_MPGs = select this.old_MPGs where mpg < this.old_MPG_limit",
            
            { spacer:2 },
            { comment:"Assume that traded-in cars are chosen with equal probability from the pool of eligible cars.  We use the harmonic average because we'll be calculating gallons consumed for constant miles, so we really want to be averaging gallons-per-mile." },
            { spacer:1 },
            "this.average_old_MPG = harmonic-average this.eligible_old_MPGs",
            
            { separator:1 },
            
            "this.new_MPG_limit = params.new_MPG_limit",
            "this.new_MPGs = params.new_MPGs",
            { spacer:1 },
            "this.eligible_new_MPGs = select this.new_MPGs where mpg > this.new_MPG_limit",
            
            { spacer:2 },
            { comment:"Assume that new cars are purchased with equal probability from the pool of eligible cars.  The distribution really should be sales-weighted.  I'm sure the data is available, but I couldn't find it." },
            { spacer:1 },
            "this.average_new_MPG = harmonic-average this.eligible_new_MPGs",
            
            { separator:1 },
            
            { comment:"Assume that everyone who is buying a new car now would have eventually bought a similar car when their current car got too old.  So the fuel savings from the program should be calculated over the remaining lifetime of the old car.  Ideally we'd like the joint distribution of MPGs and age of the current fleet, but I can't find that data.  So we'll just use averages.",
              style:"margin-bottom:10px;" },
            
            "this.car_lifetime_miles = params.car_lifetime_miles",
            "this.average_miles_left = params.fraction_lifetime_left * this.car_lifetime_miles",
            { spacer:1 },
            "this.gallons_used_by_old_car = this.average_miles_left / this.average_old_MPG",
            "this.gallons_used_by_new_car = this.average_miles_left / this.average_new_MPG",
            "this.gallons_saved_per_car = this.gallons_used_by_old_car - this.gallons_used_by_new_car",

            { separator:1 },
            
            "this.cars_traded = params.cars_traded",
            "this.gallons_saved = this.gallons_saved_per_car * this.cars_traded",
        ],
    },
    {
        name:"hours_of_gas",
        lines: [
            "this.gallons_saved = params.gallons_saved",
            { spacer:1 },
            "this.gallons_consumed_per_day = params.gallons_consumed_per_day",
            "this.gallons_consumed_per_hour = this.gallons_consumed_per_day / params.hours_per_day",
            { spacer:1 },
            "this.hours_of_gas = this.gallons_saved / this.gallons_consumed_per_hour",
        ],
    },
    {
        name:"tons_CO2e_saved",
        lines: [
            "this.gallons_saved = params.gallons_saved",
            { spacer:1 },
            "this.kg_CO2_per_gallon_gas = params.kg_CO2_per_gallon_gas",
            "this.tons_CO2_saved = this.gallons_saved * this.kg_CO2_per_gallon_gas / params.kg_per_ton",
            { spacer:2, },
            { comment:"CO<sub>2</sub> comprises 95% of a car's greenhouse gas emissions.  The other 5% include methane, nitrous oxide, and hydroflourocarbons.  To account for these other gases, we divide the amount of CO<sub>2</sub> by 0.95 to get CO<sub>2</sub>e (“carbon dioxide equivalent”)." },
            { spacer:1 },
            "this.CO2_per_CO2e = params.CO2_per_CO2e",
            "this.tons_CO2e_saved = this.tons_CO2_saved / this.CO2_per_CO2e",
        ],
    },
    {
        name:"percent_annual_emissions",
        lines: [
            "this.tons_CO2e_saved = params.tons_CO2e_saved",
            "this.tons_CO2e_emitted_yearly = params.tons_CO2e_emitted_yearly",
            { spacer:1 },
            "this.percent_annual_emissions = this.tons_CO2e_saved / this.tons_CO2e_emitted_yearly * params.units_per_percent",
        ],
    },
    {
        name:"dollars_per_ton_CO2e",
        lines: [
            "this.budget = params.budget",
            "this.tons_CO2e_saved = params.tons_CO2e_saved",
            { spacer:1 },
            "this.dollars_per_ton_CO2e = this.budget / this.tons_CO2e_saved",
        ],
    },
    {
        name:"dollars_per_ton_CO2e_on_balance",
        lines: [
            "this.gallons_saved = params.gallons_saved",
            "this.dollars_per_gallon = params.dollars_per_gallon",
            "this.dollars_saved_buying_less_gas = this.gallons_saved * this.dollars_per_gallon",
            { spacer:1 },
            "this.budget = params.budget",
            "this.dollars_spent_on_balance = this.budget - this.dollars_saved_buying_less_gas",
            { spacer:1 },
            "this.tons_CO2e_saved = params.tons_CO2e_saved",
            "this.dollars_per_ton_CO2e_on_balance = this.dollars_spent_on_balance / this.tons_CO2e_saved",
        ],
    },
];


//--------------------------------------------------------------------------------
//
//  variable metadata

var clunkerVariables = {
    "budget": { value:3e9, min:0.1e9, max:20e9, step:0.1e9, fmt:function (v) { return sprintf("$%.1f billion", v * 1e-9); } },
    "rebate": { value:3500, min:1000, max:10000, step:100, fmt:function (v) { return "$" + commas(v); } },
    "overhead": { value:100e6, min:0, max:10e9, step:10e6, fmt:function (v) { return "$" + commas(v * 1e-6) + " million"; } },
    "cars_traded": { fmt:function (v) { return commas(v); } },
    
    "old_MPG_limit": { value:17, min:10, max:45, step:1, fmt:function (v) { return sprintf("%d MPG", v); } },
    "old_MPGs": { value:createDistribution([ 0, 0, 0, 0, 0, 0, 0, 0, 85, 355, 493, 1270, 3114, 4037, 6636, 8932, 10051, 9932, 10309, 12924, 18508, 14603, 13452, 14563, 11454, 9715, 8032, 7045, 5841, 4835, 3633, 3225, 2642, 1624, 1427, 910, 671, 510, 590, 837, 426, 334, 237, 157, 110, 207, 312, ]),
                  className:"distribution", comment:"miles-per-gallon distribution for cars currently on the road",
                  href:"Notes/06-clunker.txt" },
    "eligible_old_MPGs": { className:"distribution", comment:"miles-per-gallon distribution for cars eligible for trade-in" },
    "average_old_MPG": { fmt:function (v) { return sprintf("%d MPG", v); } },

    "new_MPG_limit": { value:24, min:10, max:45, step:1, fmt:function (v) { return sprintf("%d MPG", v); } },
    "new_MPGs": { value:createDistribution([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 330, 124, 299, 453, 896, 1051, 1009, 742, 1246, 1205, 1380, 948, 927, 515, 525, 340, 196, 196, 124, 175, 10, 31, 62, 0, 21, 0, 21, 0, 0, 0, 0, 0, 10, 0, 0, 0, 10, ]),
                  className:"distribution", comment:"miles-per-gallon distribution for new cars on sale",
                  href:"Notes/06-clunker.txt" },
    "eligible_new_MPGs": { className:"distribution", comment:"miles-per-gallon distribution for cars eligible to be traded to" },

    "average_new_MPG": { fmt:function (v) { return sprintf("%d MPG", v); } },
    
    "car_lifetime_miles": { value:150e3, min:10e3, max:1e6, step:10e3, fmt:function (v) { return commas(v) + " miles"; } },
    "fraction_lifetime_left": { value:0.25, min:0.01, max:1.0, step:0.01, fmt:function (v) { return sprintf("%d%%", Math.round(v * 100)); } },
    "average_miles_left": { fmt:function (v) { return commas(v) + " miles"; } },
    "gallons_saved_per_car": { fmt: function (v) { return commas(v) + " gallons"; } },
    "gallons_used_by_old_car": { fmt: function (v) { return commas(v) + " gallons"; } },
    "gallons_used_by_new_car": { fmt: function (v) { return commas(v) + " gallons"; } },
    "gallons_saved": { fmt: function (v) { return commas(v * 1e-6) + " million gallons"; } },

    "gallons_consumed_per_day": { value:377538000, min:1e6, max:1e10, step:1e6, fmt:function (v) { return commas(v * 1e-6) + " million gallons"; },
                                  href:"http://www.eia.gov/beta/api/qb.cfm?sdid=PET.MGFUPUS2.A" },
    "hours_per_day": { value:24, min:1, max:10000, step:1, fmt:function (v) { return sprintf("%d", v); } },
    "minutes_per_hour": { value:60, min:1, max:10000, step:1, fmt:function (v) { return sprintf("%d", v); } },
    "gallons_consumed_per_hour": { fmt: function (v) { return commas(v * 1e-6) + " million gallons"; } },
    "hours_of_gas": { fmt: function (v) { return sprintf("%.0f hours", v); } },
    
    "kg_CO2_per_gallon_gas": { value:8.87, min:0.01, max:100, step:0.01, fmt:function (v) { return sprintf("%.2f kg/gallon", v); },
                               href:"http://www.nhtsa.gov/CARS-archive/official-information/CARS-Report-to-Congress.pdf" },
    "CO2_per_CO2e": { value:0.95, min:0.01, max:1, step:0.01, fmt:function (v) { return sprintf("%.2f", v); },
                      href:"http://www.nhtsa.gov/CARS-archive/official-information/CARS-Report-to-Congress.pdf" },
    "kg_per_ton": { value:1000, min:1, max:1e6, step:10, fmt:function (v) { return sprintf("%d", v); } },
    "tons_CO2_saved": { fmt: function (v) { return sprintf("%.2f million tons", v * 1e-6); } },
    "tons_CO2e_saved": { fmt: function (v) { return sprintf("%.2f million tons", v * 1e-6); } },

    "tons_CO2e_emitted_yearly": { value:6983e6, min:1e6, max:1e10, step:10e6, fmt:function (v) { return commas(v * 1e-6) + " million tons" },
                                  href:"http://www.eia.gov/environment/emissions/ghg_report/pdf/tbl1.pdf" },
    "units_per_percent": { value:100, min:1, max:10000, step:1, fmt:function (v) { return sprintf("%d", v); } },
    "percent_annual_emissions": { fmt: function (v) { return sprintf("%.2f%%", v); } },
    
    "dollars_per_ton_CO2e": { fmt: function (v) { return "$" + commas(v); } },

    "dollars_per_gallon": { value:3.0, min:0.50, max:10, step:0.1, fmt:function (v) { return sprintf("$%.2f", v); } },
    "dollars_saved_buying_less_gas": { fmt:function (v) { return sprintf("$%.1f billion", v * 1e-9); } },
    "dollars_spent_on_balance": { fmt:function (v) { return sprintf("$%.2f billion", v * 1e-9); } },
    "dollars_per_ton_CO2e_on_balance": { fmt: function (v) { return ((v < 0) ? "-" : "") + "$" + commas(Math.abs(v)); } },
};

function commas (v) {
    return Math.round(v).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}


//--------------------------------------------------------------------------------
//
//  tangle setup

var setupClunker = this.setupClunker = function () {
    var root = document.getElementById("clunker");
    var calculationRoot = document.getElementById("clunker-calculations");
    
    appendAllModelDivs(calculationRoot);
    attachVariableAttributesToSpans(root);
    initializeHelp(root);
    
    clunkerTangle = new Tangle(root, {
        initialize: function () {
            Object.keys(clunkerVariables).forEach(function (k) {
                this[k] = clunkerVariables[k].value;
            }, this);
            this["drag-help-message"] = isTouchDevice ? "left and right" : "with your mouse";
            this["click-help-message"] = isTouchDevice ? "Tap" : "Click";
        },
        update: getTangleUpdateFunction(),
    });
}

function appendAllModelDivs (calculationsRoot) {
    clunkerModels.forEach(function (m) {
        var div = getDivForModel(m);
        clunkerCalculationDivs[m.name] = div;
        calculationsRoot.appendChild(div);
    });
}

function attachVariableAttributesToSpans (root) {
    Object.keys(clunkerVariables).forEach(function (k) {
        var attr = clunkerVariables[k];
        var hasFormatFunction = (typeof(attr.fmt) == "function");
        if (hasFormatFunction) { Tangle.formats[k] = attr.fmt; }
        
        var spans = nodeArray(root.querySelectorAll('span[data-var="' + k + '"]'));
        spans.forEach(function (span) {
            if (hasFormatFunction) {
                span.setAttribute("data-format", k);
            }
            if (attr.min !== undefined) {
                span.setAttribute("data-min", attr.min);
                span.setAttribute("data-max", attr.max);
                span.setAttribute("data-step", attr.step);
            }
        });
    });
}

function getTangleUpdateFunction () {
    var updateScript = clunkerModels.map(function (m) { 
        return m.lines.map(function (line) {
            var string = (typeof(line) == "string") ? line : line.line;
            if (string === undefined) { return ""; }  // ignore comments, separators, etc

            string = string.replace(/params\./g, "this.");
            string = string.replace(/select (\S+) where (\S+) (.+)/g, "selectWhere($1, (function ($2) { return $2 $3; }).bind(this))");
            string = string.replace(/harmonic-average (.+)/g, "harmonicAverage($1)");
            return string + ";"
        }).join("\n");
    }).join("\n");
    
    return eval("(function () { " + updateScript + " })");
}


//--------------------------------------------------------------------------------
//
//  distribution functions

function createDistribution (array, comment) {
    return { values:array, selection_mask:array.map(function () { return 1; }), comment:comment };
}

function selectWhere (dist, f) {
    return { values:dist.values, selection_mask:dist.selection_mask.map(function (m,i) { return f(i) ? m : 0 }) };
}

function harmonicAverage (dist) {
    var n = dist.values.reduce(function (sum,v,i) { return sum + v * dist.selection_mask[i] * (i && (1/i)) }, 0);
    var d = dist.values.reduce(function (sum,v,i) { return sum + v * dist.selection_mask[i] }, 0);
    var avg = d / n;
    return isNaN(avg) ? 0 : avg;
}


//--------------------------------------------------------------------------------
//
//  calculation display

function getDivForModel (m) {
    var html = "";
    html += sprintf('<div class="figure-caption">calculations for “%s” <span class="comment">' + 
                    '(you can change assumptions in green)</span></div>', getNameForVariable(m.name));
    html += '<div class="analysis analysis-' + m.name + '">';
    html += m.lines.map(getHTMLForLine).join("\n");
    html += '</div>';
    
    return createElement("div", { "class":"calculation", "html":html });
}

function getHTMLForLine (line) {
    var string = (typeof(line) == "string") ? line : line.line;
    if (string === undefined) { return getHTMLForCommentLine(line); }

    var html = "";
    var columns = string.split(" = ");
    var isExpression = columns[1].match(/this\./);
    
    html += '<div class="line' + (isExpression ? " expression" : "") + '" style="' + (line.style || "") + '">';

    html += getHTMLForLineFragment(columns[0], " lhs");
    html += ' = ' + getHTMLForLineFragment(columns[1]);
    
    if (isExpression) {
        html += '<br>' + getHTMLForLineFragment(columns[0], " lhs dummy");
        html += ' = ';
        html += getHTMLForLineFragment(columns[0].replace(/this\./, "params."), "", true);
    }

    html += '</div>';
    return html;
}

function getHTMLForLineFragment (s, lhs, isResult) {
    return s.replace(/this\.(\w+)/g, function (_,k) { 
                return '<span class="token' + (lhs || "") + '" data-var="' + k + '">' + getNameForVariable(k) + '</span>' })
            .replace(/params\.(\w+)/g, function (_,k) {
                var attr = clunkerVariables[k];
                var clas = attr.className ? clunkerVariables[k].className :
                           isResult ? "" : 
                           (attr.min !== undefined) ? "adjustable-number" : "calculated-result";
                           
                var html = '<span class="' + clas + '" data-var="' + k + '"></span>';
                if (attr.href) { html += '<span class="cite"><a href="' + attr.href + '">(source)</a></span>'; }
                return html;
            });
}

function getNameForVariable (k) {
    return k.replace(/_/g, " ");
}

function getHTMLForCommentLine (line) {
    if (line.spacer) { return '<div class="spacer-' + line.spacer + '" style="' + (line.style || "") + '"></div>'; }
    if (line.separator) { return '<div class="separator" style="' + (line.style || "") + '"></div>'; }
    if (line.comment) { return '<div class="comment" style="' + (line.style || "") + '">' + line.comment + '</div>'; }
    return "";
}


//--------------------------------------------------------------------------------
//
//  interaction

function lockCalculatedResult (name) {
    var alreadyLocked = (clunkerCalculationDivs[name].style.display === "block");
    if (alreadyLocked) { name = ""; }  // unlock

    Object.keys(clunkerCalculationDivs).forEach(function (k) {
        var div = clunkerCalculationDivs[k];
        div.style.display = (name === k) ? "block" : "none";
    });
    
    var spans = nodeArray(clunkerTangle.element.querySelectorAll(".calculated-result"));
    spans.forEach(function (span) {
        if (span.getAttribute("data-var") === name) { addClass(span, "locked"); }
        else { removeClass(span, "locked"); }
    });
}

function setVariableHovering (name, hovering) {
    var spans = nodeArray(clunkerTangle.element.querySelectorAll('[data-var="' + name + '"]'));
    spans.forEach(function (span) {
        if (hovering) { addClass(span, "hovering"); }
        else { removeClass(span, "hovering"); }
    });
}


//--------------------------------------------------------------------------------
//
//  help

var calculationHelp;

function initializeHelp (root) {
    calculationHelp = createElement("div", { "class": "calculation-help" });
    root.insertBefore(calculationHelp, root.firstChild);
}

function setHelpShowingForElement (el, showing, text) {
    if (ancestorWithClass(el, "analysis")) { return; }  // no help for right column

    calculationHelp.style.display = showing ? "block" : "none";
    if (!showing) { return; }
    
    if (text && calculationHelp.innerHTML !== text) { calculationHelp.innerHTML = text; }
    
    var containerY = Math.round(calculationHelp.parentNode.getBoundingClientRect().top);
    var elY = Math.round(el.getBoundingClientRect().top);
    
    calculationHelp.style.marginTop = "" + (elY - containerY) + "px";
}


//--------------------------------------------------------------------------------
//
//  Tangle classes

var isAnyAdjustableNumberDragging = false;  // hack for dragging one value over another one


Tangle.classes["token"] = {

    initialize: function (element,options,tangle,variable) {
        this.element = element;
        this.variable = variable;

        this.isHovering = false;
        if (!isTouchDevice) {
            this.element.addEventListener("mouseenter", (function () { this.setHovering(true) }).bind(this));
            this.element.addEventListener("mouseleave", (function () { this.setHovering(false) }).bind(this));
        }
    },
    
    update: function () { },  // override tangle's default update
    
    setHovering: function (hovering) {
        this.isHovering = hovering;
        if (isAnyAdjustableNumberDragging) { return; }
        setVariableHovering(this.variable, this.isActive());
    },
    
    isActive: function () {
        return this.isHovering && !isAnyAdjustableNumberDragging;
    },
};


Tangle.classes["calculated-result"] = {

    initialize: function (element,options,tangle,variable) {
        this.element = element;
        this.variable = variable;
        this.wantsHelp = !this.element.getAttribute("data-no-help");

        this.isHovering = false;
        if (!isTouchDevice) {
            this.element.addEventListener("mouseenter", (function () { this.setHovering(true) }).bind(this));
            this.element.addEventListener("mouseleave", (function () { this.setHovering(false) }).bind(this));
        }

        this.element.onclick = (function () {
            lockCalculatedResult(variable);
            this.updateHelp()
        }).bind(this);
    },

    setHovering: function (hovering) {
        this.isHovering = hovering;
        if (isAnyAdjustableNumberDragging) { return; }
        setVariableHovering(this.variable, this.isActive());
        this.updateHelp();
    },
    
    updateHelp: function () {
        if (this.wantsHelp) {
            var text = hasClass(this.element, "locked") ? "click to hide calculations" : "click to see calculations";
            setHelpShowingForElement(this.element, this.isActive(), text);
        }
    },
    
    isActive: function () {
        return this.isHovering && !isAnyAdjustableNumberDragging;
    },
};


Tangle.classes["adjustable-number"] = {

    initialize: function (element, options, tangle, variable) {
        this.element = element;
        this.tangle = tangle;
        this.variable = variable;

        this.min = (options.min !== undefined) ? parseFloat(options.min) : 1;
        this.max = (options.max !== undefined) ? parseFloat(options.max) : 10;
        this.step = (options.step !== undefined) ? parseFloat(options.step) : 1;
        
        this.initializeHover();
        this.initializeDrag();
    },


    // hover
    
    initializeHover: function () {
        this.isHovering = false;
        if (!isTouchDevice) {
            this.element.addEventListener("mouseenter", (function () { this.setHovering(true) }).bind(this));
            this.element.addEventListener("mouseleave", (function () { this.setHovering(false) }).bind(this));
        }
    },
    
    setHovering: function (hovering) {
        this.isHovering = hovering;
        this.updateRolloverEffects();
    },
    
    updateRolloverEffects: function (down) {
        if (!down && isAnyAdjustableNumberDragging) { return; }  // ignore if dragging a different number
        this.updateStyle();
        this.updateCursor();
        this.updateHelp();
    },
    
    isActive: function () {
        return this.isDragging || (this.isHovering && !isAnyAdjustableNumberDragging);
    },

    updateStyle: function () {
        setVariableHovering(this.variable, this.isActive());

        if (this.isDragging) { addClass(this.element, "dragging"); }
        else { removeClass(this.element, "dragging"); }
    },

    updateCursor: function () {
        var body = document.body;
        if (this.isActive()) { addClass(body,"TKCursorDragHorizontal"); }
        else { removeClass(body,"TKCursorDragHorizontal"); }
    },

    updateHelp: function () {
        setHelpShowingForElement(this.element, this.isActive(), "drag the number left or right");
    },


    // drag
    
    initializeDrag: function () {
        this.isDragging = false;
        makeTouchable(this.element, this);
    },
    
    touchDown: function (e,x,y) {
        isAnyAdjustableNumberDragging = true;
        this.isDragging = true;
        this.valueAtMouseDown = this.tangle.getValue(this.variable);
        this.xAtMouseDown = x;

        this.updateRolloverEffects(true);
        this.updateStyle();
    },
    
    touchMove: function (e,x,y) {
        var dx = x - this.xAtMouseDown;
        var unclippedValue = this.valueAtMouseDown + dx / 5 * this.step;
        var value = Math.min(this.max, Math.max(this.min, Math.round(unclippedValue / this.step) * this.step));
        
        this.tangle.setValue(this.variable, value);
        this.updateHelp();
    },
    
    touchUp: function (e,x,y) {
        isAnyAdjustableNumberDragging = false;
        this.isDragging = false;

        this.updateRolloverEffects();
        this.updateStyle();
        this.updateHelp();
    }
};


Tangle.classes["distribution"] = {

    initialize: function (element,options,tangle,variable) {
        this.element = element;
        this.tangle = tangle;
        this.variable = variable;
        this.height = 18;
    },
    
    update: function () {
        if (!this.bars) {
            this.bars = this.createBars();
            this.fills = this.bars.map(function (bar) { return bar.querySelector(".fill"); });
        }

        var dist = this.tangle.getValue(this.variable);
        var maxValue = dist.values.reduce(function (max,v) { return (v > max) ? v : max }, 0);
        
        this.fills.forEach(function (fill, i) {
            var fillHeight = Math.round(dist.values[i] / maxValue * this.height);
            fill.style.height = fillHeight + "px";
            this.bars[i].className = dist.selection_mask[i] ? "bar selected" : "bar";
        }, this);
    },
    
    createBars: function () {
        var dist = this.tangle.getValue(this.variable);
        var barContainer = createElement("div", { "class":"bars" });
        this.element.appendChild(barContainer);
        
        var bars = dist.values.map(function (v,i) {
            var bar = createElement("div", { "class":"bar", "html":'<div class="fill"></div>' });
            bar.onmouseenter = (function () { this.mouseEnteredBar(bar,i); }).bind(this);
            bar.onmouseleave = (function () { this.mouseLeftBar(bar,i); }).bind(this);
            barContainer.appendChild(bar);
            return bar;
        }, this);
        
        var comment = clunkerVariables[this.variable].comment;
        if (comment) {
            this.commentDiv = createElement("div", { "class":"comment", "html":comment });
            this.element.appendChild(this.commentDiv);
        }
        
        this.labelDiv = createElement("div", { "class":"label" });
        this.element.appendChild(this.labelDiv);

        return bars;
    },
    
    mouseEnteredBar: function (bar, i) {
        this.labelDiv.innerHTML = i + " MPG";
        this.labelDiv.style.left = (i*6 - 25) + "px";
        this.labelDiv.style.display = "block";
        if (this.commentDiv) { this.commentDiv.style.visibility = "hidden"; }
    },
    mouseLeftBar: function (bar, i) {
        this.labelDiv.style.display = "none";
        if (this.commentDiv) { this.commentDiv.style.visibility = "visible"; }
    },
};


})();
