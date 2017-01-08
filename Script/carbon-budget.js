//
//  carbon-budget.js
//  What Can A Technologist Do About Climate Change?
//
//  Bret Victor, November 2015
//  MIT open-source license.
//

(function () {

var carbonBudgetTangle;

var x0 = 286, y0 = 176.5;
var x1 = 432, y1 = 18.5;
var A = (327.8 - x0) * (y0 - (18.5 + 13.3)/2);

var h1 = y0 - y1;

var setupCarbonBudget = this.setupCarbonBudget = function () {
    var root = document.getElementById("carbon-budget-figure");
    carbonBudgetTangle = new Tangle(root, {
        initialize: function () {
            this.knobPoint = [ x1, 0 ];
        },
        update: function () {
            var budgetArea = document.getElementById("carbon-budget-future-budget");
            var overdrawnArea = document.getElementById("carbon-budget-future-overdrawn");
            if (!budgetArea || !overdrawnArea) { return; }
        
            var p = getInterceptionPoint(this.knobPoint);
            
            var budgetPath = sprintf("M286,18.5L%.1f,%.1fV176.5H286Z", p[0], p[1]);
            var overdrawnPath = sprintf("M%.1f,%.1fL%.1f,%.1fV176.5H%.1fZ", p[0], p[1], this.knobPoint[0], this.knobPoint[1], p[0]);
            
            budgetArea.setAttribute("d", budgetPath);
            overdrawnArea.setAttribute("d", overdrawnPath);
        }
    });
}

function getInterceptionPoint (knobPoint) {
    var h2 = y0 - knobPoint[1];
    var w = knobPoint[0] - x0;
    
    // If I could put a diagram here, I could explain how this works.
    // But this is a "text file".  So no explanation for you.

    var w1 = (h1 - Math.sqrt(h1*h1 - 2*A*(h1-h2) / w)) / ((h1-h2)/w);
    if (Math.abs(h1-h2) < 1e-5) { w1 = A/h1; }
    var hh = h1 - (w1/w)*(h1-h2);
    
    if (isNaN(w1)) { return [ knobPoint[0], knobPoint[1] ]; }

    return [ x0 + w1, y0 - hh ];
}


Tangle.classes["carbon-budget-knob"] = {

    initialize: function (element, options, tangle, variable) {
        this.element = element;
        this.tangle = tangle;
        this.variable = variable;
        
        this.helpElement = this.element.parentNode.querySelector(".carbon-budget-knob-help");
        
        this.initializeHover();
        this.initializeDrag();
    },

    update: function (element, value) {
        element.style.left = value[0] + "px";
        element.style.top = value[1] + "px";
    },
    
    // hover
    
    initializeHover: function () {
        this.isHovering = false;
        this.element.addEventListener("mouseenter", (function () { this.setHovering(true) }).bind(this));
        this.element.addEventListener("mouseleave", (function () { this.setHovering(false) }).bind(this));
    },
    
    setHovering: function (hovering) {
        this.isHovering = hovering;
        this.updateRolloverEffects();
    },
    
    updateRolloverEffects: function () {
        this.updateStyle();
        this.updateCursor();
    },
    
    isActive: function () {
        return this.isDragging || this.isHovering;
    },

    updateStyle: function () {
        var figure = ancestorWithClass(this.element, "figure");
        if (this.isDragging) { 
            addClass(this.element, "dragging");
            if (figure) { addClass(figure, "hold-cite"); }
        }
        else {
            removeClass(this.element, "dragging");
            if (figure) { removeClass(figure, "hold-cite"); }
        }
    },

    updateCursor: function () {
        var body = document.body;
        if (this.isActive()) { addClass(body,"TKCursorDrag"); }
        else { removeClass(body,"TKCursorDrag"); }
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
        this.pointAtMouseDown = [x,y];

        this.updateRolloverEffects(true);
        this.updateStyle();

        if (this.helpElement) { 
            this.helpElement.style.display = "none"; 
            this.helpElement = undefined;
        }
    },
    
    touchMove: function (e,x,y) {
        var delta = [ x - this.pointAtMouseDown[0], y - this.pointAtMouseDown[1] ];
        var unclippedValue = [ this.valueAtMouseDown[0] + delta[0], this.valueAtMouseDown[1] + delta[1] ];
        
        var isRightEdge = Math.abs(unclippedValue[0] - x1) < Math.abs(unclippedValue[1] - y0);
        var value = isRightEdge ? [ x1, clip(unclippedValue[1], 0, y0) ] : [ clip(unclippedValue[0], x0 + 20, x1), y0 ];
        
        this.tangle.setValue(this.variable, value);
    },
    
    touchUp: function (e) {
        this.isDragging = false;

        this.updateRolloverEffects();
        this.updateStyle();
    }
};

function clip (x,min,max) { return x < min ? min : x > max ? max : x; }

})();
