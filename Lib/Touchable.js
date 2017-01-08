//
//  Touchable.js
//
//  Created by Bret Victor on 3/10/11.
//  (c) 2011 Bret Victor.  MIT open-source license.
//

function makeTouchable (el, delegate) {

    var initialize = function () {
        el.addEventListener("mousedown", mouseDown);
        el.addEventListener("touchstart", touchStart);
    };
    
	var mouseDown = function (e) {
		e.preventDefault();
        document.body.addEventListener("mousemove", mouseMove);
        document.body.addEventListener("mouseup", mouseUp);
        delegate.touchDown(e, e.pageX, e.pageY);
    };

	var mouseMove = function (e) {
		e.preventDefault();
        delegate.touchMove(e, e.pageX, e.pageY);
    };

	var mouseUp = function (e) {
		e.preventDefault();
        delegate.touchUp(e, e.pageX, e.pageY);
        document.body.removeEventListener("mousemove", mouseMove);
        document.body.removeEventListener("mouseup", mouseUp);
    };
    
    var touchStart = function (e) {
        e.preventDefault();
        document.body.addEventListener("touchmove", touchMove);
        document.body.addEventListener("touchend", touchEnd);
        document.body.addEventListener("touchcancel", touchCancel);
        var pt = getTouchPoint(e);
        delegate.touchDown(e,pt[0],pt[1]);
	};

	var touchMove = function (e) {
		e.preventDefault();
        var pt = getTouchPoint(e);
        delegate.touchMove(e,pt[0],pt[1]);
    };
	
	var touchEnd = function (e) {
		e.preventDefault();
        var pt = getTouchPoint(e);
        delegate.touchUp(e,pt[0],pt[1]);
        document.body.removeEventListener("touchmove", touchMove);
        document.body.removeEventListener("touchend", touchEnd);
        document.body.removeEventListener("touchcancel", touchCancel);
	};

	var touchCancel = function (e) {
	   touchEnd(e);
	};
	
	var getTouchPoint = function (e) {
	   if (e.pageX !== undefined) { return [e.pageX, e.pageY]; }
	   if (e.targetTouches && e.targetTouches[0]) { return [e.targetTouches[0].pageX, e.targetTouches[0].pageY]; }
	   return [0,0];
	};
	
	initialize();
}
