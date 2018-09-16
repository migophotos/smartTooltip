/**
 * @copyright Copyright © 2018 ... All rights reserved.
 * @author Michael Goyberg
 * @license
 * @version   1.0
 * @overview  SmartTooltip
 * The control uses the built-in template to display prompts.
 * The tooltip window can be "pinned" and will be displayed next to the
 * item until the pinMe option is turned off.

 * It can also use customized templates for individual elements.
 * To take advantage of this functionality, place the custom template
 * on the server and call the static initialization function,
 * passing the element ID and the full name of the template to it.
 *
 * An Internal template implementation shows the array of data as flat pie diagramm with legend.
 *
 *
 * The structure of data in function showTemplate have the next structure:
 * const data = {
 * 		id: target identificator,
		x: evt.clientX,
		y: evt.clientY,
		options: {
			// the client rectangle coordinates of correspondent element.
			// this coordinates will used for place 'the pinned' tooltip near this element
			// you may specify here any screen coordinates for positioning SmartTooltip window
			// only top and right parameters used for calculating currently. 
			// The position of tooltip window will be moved by 16 px at right side of specified 'right' parameter. 
			tRect: { left: 0, top:0, right:0, bottom:0 },

			// run indicator is a small circle near the legend. It's fill color is green, when this parameter equals true and red when false.
			isRun: true/false

			// SmartTooltip window will be scaled by specified factor before showing
			scale: 0.6 - default

			// Sort data by specified parameter. Can be one of the next parameters:
			// "asis" 			- don't sort, default 
			// states/state 	- sort by state or colors (in case of state is not exists), 
			// values/value 	- sort by value, 
			// colors/color 	- sort by color, 
			// names/name 		- sort by legend or name, 
			// any other word 	- sort by this "word" parameter. For example: link
			// Note: This option parameter may be specified only once. After this it will be used for all tooltips on the page
			//       If you want to show different tooltips with different sort orders, please specify this parameter each time!
			sortby: "asis",

			// here you have an ability to re-style SmartTooltip window by changing svg.sttip css variables
			// there is no need to define all the style variables, you can specify only some of them or do not specify anything at all, 
			// if you like the look and fill of the built-in template.
			//
			// This section of parameters allows you to override the look&fill of SmartTooltip window for each specific element on the HTML page.
			
			// Not yet implemented!
			// If you have a desire to globally change the look&fill of the SmartTooltip window, then you can use a special static function
			// passing into it a similar object, needed in the adjustment, variables.
			// SmartTooltip.changeLookAndFill(cssVars={});
			cssVars: {
				"--smartTip-font-family": "'Arial Narrow', 'DIN Condensed', 'Noteworthy', sans-serif";
				"--smartTip-font-stretch": c"ondensed",
				"--smartTip-font-color": "#9dc2de",
				"--smartTip-scale-font-size": "12px",
				"--smartTip-legend-font-size": "22px",
				"--smartTip-title-font-size": "30px",
				"--smartTip-descr-font-size": "28px",
				
				"--smartTip-run-color": "#0f0",
				"--smartTip-stop-color": "#f00",
				"--smartTip-def-color": "#666",

				"--smartTip-frame-fill": "#fff",
				"--smartTip-frame-opacity": "0.95",
				"--smartTip-frame-scale": "0.6",
				"--smartTip-border-color": "none",
				"--smartTip-border-width": "2",
				"--smartTip-border-radius": "2",

				"--smartTip-legend-fill": "#fff",
				"--smartTip-legend-stroke": "#666"
			}
		},
		title: {
			uuid:	'unique id'
			legend: 'Title legend',
			name:   'Title legend may be defined here also',
			descr:	'Description'
			value:  'By default this value will be shown in description line (under title). But by using descrFormat and/or titleFormat
					 you can change that behavior. By default, it is assumed that the value of this parameter is specified in percents. 
					 In case you want to display the actual value, add the "valueMax" parameter to correctly calculate the length of the indicator.',
			valueMax: null, 
			color:  'state color',
			link:   'external URL',
			[titleFormat]: 'title formating string with internal variables, such as $VALUE$, $NAME$, $DESCR$, ....
			[descrFormat]: same as titleFormat string but for second string of text in title section
		},
		targets: [
			{
				uuid:	'unuque id'
				legend: 'Title legend',
				name:   'Title legend may be defined here also',
				descr:	'Description'
				value:  'This text will be shown as description',
				color:  'state color',
				link:   'external URL',
				parent: 'parent UUID'
				[legendFormat]: 'first column of legend stroke formating string with internal variables, such as $VALUE$, $NAME$, $DESCR$, ....
				[legendValFormat]: same as legendFormat string but for second column
			},
			{}, ...
		]
	}
 *
 *
 * Example of use:
 *
 * 1. Conventional use:
 * if (!window.SmartTooltip) {
 * 	 window.SmartTooltip = new SmartTooltip();
 * }
 * ....
 * ....
 * window.SmartTooltip.init(idElement, templateFileName);
 * ...
 * //collect data object and call the next function
 * var data = { id, x, y, options:{rRect, isRun, scale, sortby}, targets:[{uuid, name, value, color, link}], title:{uuid, name, value, color, link} };
 * window.SmartTooltip.show(data)
 * window.SmartTooltip.move(evt.clientX, evt.clientY);
 * window.SmartTooltip.hide();
 *
 * 2. Use internal template
 * //collect data object and call the next function
 * var data = { id, x, y, options:{rRect, isRun, scale, sortby, cssVars:{...}}, targets:[{uuid, name, value, color, link}], title:{uuid, name, value, color, link} };
 * SmartTooltip.showTooltip(data);
 * SmartTooltip.moveTooltip(evt.clientX, evt.clientY);
 * SmartTooltip.hideTooltip();
 */


class SmartTooltip {
	// get href link paramter to new or old site
	static getLink(link) {
		if (typeof window.SmartTooltip.isNewSite === 'undefined' || !window.SmartTooltip.isNewSite() || !link || link == '') {
			return link;
		}
		return window.location.pathname + link.replace('/grapher.cgi?', '?');
	}

	static initTooltip(id, template) {
		// create SmartTooltip only once! the 'window' is a global object, so don't store the reference on SmartTooltip inside your class!
		// You can alwaise find it by window.SmartTooltip call
		if (!window.SmartTooltip) {
			window.SmartTooltip = new SmartTooltip();
		}
		window.SmartTooltip.init(id, template);
	}
	static showTooltip(data, evt=null) {
		if (evt && (evt.ctrlKey || evt.metaKey))
			return;
		// create SmartTooltip only once! the 'window' is a global object, so don't store the reference on SmartTooltip inside your class!
		// You can alwaise find it by window.SmartTooltip call
		if (!window.SmartTooltip) {
			window.SmartTooltip = new SmartTooltip();
		}
		window.SmartTooltip.show(data);
	}
	static moveTooltip(clientX, clientY, evt=null) {
		if (evt && (evt.ctrlKey || evt.metaKey))
			return;

		if (window.SmartTooltip) {
			window.SmartTooltip.move(clientX, clientY);
		} else {
			throw new ReferenceError("window.SmartTooltip hasn't been initialised. call SmartTooltip.show(data), or SmartTooltip.init(id, template) before.");
		}
	}
	static hideTooltip(evt=null) {
		if (evt && (evt.ctrlKey || evt.metaKey))
			return;

		if (window.SmartTooltip) {
			window.SmartTooltip.hide();
		} else {
			throw new ReferenceError("window.SmartTooltip hasn't been initialised. call SmartTooltip.show(data), or SmartTooltip.init(id, template) before.");
		}
	}


	static formatString(str, data) {
		let frmStr = '';
		const tokens = str.split('$');
		for (let i=0; i < tokens.length; i++) {
			switch(tokens[i]) {
				case "UUID": 	{ frmStr += data.uuid || ''; break; }
				case "VALUE":	{ frmStr += data.value || ''; break; }
				case "UNITS":	{ frmStr += data.units || ''; break; }
				case "COLOR":	{ frmStr += data.color || ''; break; }
				case "NAME":	{ frmStr += data.name  || data.legend || ''; break; }
				case "LEGEND":  { frmStr += data.legend || data.name || ''; break;}
				case "LINK":	{ frmStr += data.link || ''; break; }
				case "TOOLTIP": { frmStr += data.tooltip || ''; break; }
				case "STATE":	{ frmStr += data.state || ''; break; }
				case "DESCR":	{ frmStr += data.descr || ''; break; }
				default:
					frmStr += tokens[i];
					break;
			}
		}
		return frmStr;
	}

	static getDefaultTooltip() {
		const defttip = {
			name: 'default_tt.svg',
			value: `
			<svg class="sttip" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" >
			<defs>
				<filter id="drop-shadow">
					<feGaussianBlur in="SourceAlpha" stdDeviation="2.2"/>
					<feOffset dx="2" dy="2" result="offsetblur"/>
					<feFlood flood-color="rgba(0,0,0,0.5)"/>
					<feComposite in2="offsetblur" operator="in"/>
					<feMerge>
						<feMergeNode/>
						<feMergeNode in="SourceGraphic"/>
					</feMerge>
				</filter>
				<pattern id="sttip-pattern-stripe45"
					width="4" height="4"
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(45)">
					<rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
				</pattern>
				<pattern id="sttip-pattern-stripe-45"
					width="4" height="4"
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(-45)">
					<rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
				</pattern>
				<pattern id="sttip-pattern-stripe-45-black"
					width="4" height="4"
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(-45)">
					<rect width="2" height="4" transform="translate(0,0)" fill="black"></rect>
				</pattern>
				<mask id="sttip-mask-stripe">
					<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
				</mask>
				<mask id="sttip-mask-stripe-black">
					<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
				</mask>
				<mask id="sttip-mask-cross">
					<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
					<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe-45)" />
				</mask>

			</defs>
			<style>
				svg.sttip {
					overflow: visible;
					vector-effect: non-scaling-stroke;

					--smartTip-font-family: 'Arial Narrow', 'DIN Condensed', 'Noteworthy', sans-serif;
					--smartTip-font-stretch: condensed;
					--smartTip-font-color: #666;
					--smartTip-scale-font-size: 12px;
					--smartTip-legend-font-size: 22px;
					--smartTip-title-font-size: 30px;
					--smartTip-descr-font-size: 28px;
					
					--smartTip-run-color: #0f0;
					--smartTip-stop-color: #f00;
					--smartTip-def-color: #666;

					--smartTip-frame-fill: #fff;
					--smartTip-frame-opacity: 0.95;
					--smartTip-frame-scale: 0.6;
					--smartTip-border-color: none;
					--smartTip-border-width: 2;
					--smartTip-border-radius: 2;

					--smartTip-legend-fill: #fff;
					--smartTip-legend-stroke: #666;


					--legend-frm-border-width: 2;
					--legend-frm-border-radius: var(--smartTip-border-radius, 2);
					--legend-frm-border-color: var(--smartTip-legend-stroke, #666);
					--legend-frm-fill: var(--smartTip-legend-fill, #ffc6c6);

					--no-color:	none;
					--run-color: var(--smartwdg-run-color, green);
					--stop-color: var(--smartwdg-stop-color, red);



				}
				.sttip-scale-line {
					fill: none;
					stroke: var(--smartTip-font-color);
					stroke-width: 2;
					stroke-linecap: butt;
				}
				text.sttip-text {
					font-family: var(--smartTip-font-family);
					font-stretch: var(--smartTip-font-stretch);
					pointer-events: none;
					fill: var(--smartTip-font-color);
				}
				.sttip-scale-text {
					font-size:var(--smartTip-scale-font-size, 12px);
				}
				.sttip-title {
					font-size: var(--smartTip-title-font-size, 30px);
				}
				.sttip-description {
					font-size: var(--smartTip-descr-font-size, 28px);
				}
				.sttip-legend-value, .sttip-legend-name {
					font-size: var(--smartTip-legend-font-size, 18px);
				}
				.sttip-legend-rect {
					fill:var(--legend-frm-fill);
				}
				.sttip-legend-frame {
					fill:var(--legend-frm-fill);
					fill-opacity: 0.1;
					rx: var(--legend-frm-border-radius);
					ry: var(--legend-frm-border-radius);
				}
				.sttip-frame {
					fill:var(--smartTip-frame-fill);
					fill-opacity: var(--smartTip-frame-opacity, 1);
					stroke: var(--smartTip-border-color);
					stroke-width: var(--smartTip-border-width);
					rx: var(--smartTip-border-radius);
					ry: var(--smartTip-border-radius);
				}

				.sttip-legend-rect {
					fill:var(--no-color);
					fill:var(--legend-frm-fill);
					rx: var(--legend-frm-border-radius);
					ry: var(--legend-frm-border-radius);
				}
				.sttip-run-indicator {
					stroke: #969696;
					stroke-width: 1px;
				}
				.sttip-value-gauge {
					fill: #ff9191;
				}
				.sttip-run {
					fill: var(--run-color);
				}
				.sttip-stop {
					fill: var(--stop-color);
				}
				.sttip-shadowed {
					filter: url(#drop-shadow);
				}
				.sttip-linked {
					cursor: pointer;
				}
				.sttip-animated {
					transition:all 1s;
				}
				.sttip-selected {
					mask: url(#sttip-mask-cross);
				}
				.sttip-current > rect {
					stroke-width: 1.5;
					stroke: var(--legend-frm-border-color);
				}
				.sttip-current > text {
					font-weight: bold;
				}
				.sttip-hover {
					mask: url(#sttip-mask-stripe);
				}
				.sttip-lightgray {
					fill: lightgray;
				}

				.sttip-max-value {
					width: 265px;
				}
				.sttip-min-value {
					width: 0;
				}
				rect#pinMe {
					fill:lightblue;
					rx: 8;
					ry: 8;
				}
				rect#pinMe:hover {
					fill: gray;
					cursor: pointer;
					stroke-dasharray: 1 1;
					stroke-width: 1;
					rx: 8;
					ry: 8;
				}
				rect#pinMe.sttip-pinned {
					fill: black;
					fill-opacity: 1;
					stroke: gray;
					stroke-dasharray: 0;
					stroke-width: 1;
					rx: 8;
					ry: 8;
				}

				rect.sttip-legend-rect:hover {
					fill: lightgray;
				}
				.sttip-diagram:hover, path.sttip-linked:hover {
					mask: url(#sttip-mask-stripe);
				}
				g#legend-text-stroke {
					pointer-events: none;
				}
			</style>


			<g id="tooltip-group">
				<rect id="tooltip-frame" class="sttip-frame sttip-shadowed" x="0" y="0" fill-opacity="0.8" width="432" height="0"/>
				<g id="bound-group">
					<rect id="pinMe" x="4" y="4" rx="1" ry="1" width="16" height="16" />
					<circle id="diagram" class="sttip-diagram" cx="72.5" cy="72.5" r="65" style="fill:#fff;"/>
					<g id="diagram-group">
					</g>
					<g id="legend-group" data-x="6.5" >
						<circle id="run-indicator" class="sttip-run-indicator sttip-stop" cx="16.5" cy="157.5" r="5"/>
						<g id="legend-stroke">
							<rect id="legend-rect" class="sttip-legend-rect" x="22" y="172" width="396" height="34"/>
							<g id="legend-text-stroke">
								<rect id="legend-color" class="sttip-legend-color" x="26.5" y="178.5" width="20" height="20" fill="#ff0600"/>
								<text id="legend-name" data-format="$NAME$" class="sttip-text sttip-legend-name" x="53.5px" y="196.5" text-anchor="left">Legend stroke</text>
								<text id="legend-value" data-format="$VALUE$" class="sttip-text sttip-legend-value" x="359.794px" y="196.5" text-anchor="left">Value</text>
							</g>
						</g>
					</g>
					<g id="title-group" data-x="147" >
						<g id="scale-group">
							<rect id="tooltip-value" class="sttip-value-gauge sttip-animated" data-maxw="265" data-maxh="20" x="147" y="83" width="20" height="20"/>
							<path id="scale-line" class="sttip-scale-line" d="M147,105.5l265,0"/>
							<path id="scale-0" class="sttip-scale-line" d="M148,111.827l0,-7.327"/>
							<path id="scale-25" class="sttip-scale-line" d="M213.25,109.827l0,-5.327"/>
							<path id="scale-50" class="sttip-scale-line" d="M279.5,111.827l0,-7.327"/>
							<path id="scale-75" class="sttip-scale-line" d="M345.75,109.827l0,-5.327"/>
							<path id="scale-100" class="sttip-scale-line" d="M411,111.827l0,-7.327"/>
							<text id="value-0" class="sttip-text sttip-scale-text" x="145.155px" y="122.5px">0</text>
							<text id="value-50" class="sttip-text sttip-scale-text" text-anchor="middle" x="280" y="122.5px">50%</text>
							<text id="value-100" class="sttip-text sttip-scale-text" text-anchor="middle" x="412" y="122.5px">100%</text>
						</g>
						<g id="descr-group">
							<text id="tooltip-title" data-format="$NAME$" class="sttip-text sttip-title" x="147" y="47">Tooltip Title</text>
							<text id="tooltip-description" data-format="$VALUE$" class="sttip-text sttip-description" x="147" y="75">Tooltip description</text>
						</g>
					</g>
				</g>
			</g>
		</svg>
		`
		};
		return defttip;
	}

	// all browser compatible function that returns an object with curren scroll amount. 
	// many thans for w3cub project! http://docs.w3cub.com/dom/window/scrolly/
	static getScroll() {
		var supportPageOffset = window.pageXOffset !== undefined;
		var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
		var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
		var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;	
		return {X:x, Y:y};				
	}


	static getAbsolutePoint(clientX, clientY) {
		// caclulate an absolute location
		var svg = window.SmartTooltip._svg;
		if (!svg) {
			throw(new ReferenceError("windows.SmartTooltip._svg hasn't been initialized!"));
		}
		var pt = svg.createSVGPoint()
		pt.x = clientX;
		pt.y = clientY;
		pt = pt.matrixTransform(svg.getScreenCTM().inverse());
		return pt;
	}

	static saveInLocalStorage(name) {
		SmartTooltip._readFromLocalStorage(name);
	}
	static clearLocalStorage(name) {
		localStorage.removeItem(name);
	}
	static _saveInLocalStorage(name, val) {
		localStorage.setItem(name, val);
	}
	static _readFromLocalStorage(name) {
		var str = localStorage.getItem(name);
		return str;
	}



	// creates svg element, sets attributes and append it to parent, if it not null
	// the new element returned
	// usage example: createElement('circle',{cx:50,cy:50,r:10})
	// special case for 'text' element creation: uppend pair text:'any text...' into params object
	// and this text will be automathically appended to 'text' element
	static addElement(type, params, parent=null, doc=null) {
		if (!doc) { // try to main document in case of doc not specified
			if (parent) {
				doc = parent.ownerDocument;
			} else {
				doc = window.document;
			}
		}
			// Fix for error: <circle> attribute r: A negative value is not valid!
		if (type == 'circle' && params.r < 0) {
			params.r = 0;
		}
		const svgNS = 'http://www.w3.org/2000/svg';
		let textData = '';

		const elem = doc.createElementNS(svgNS, type);
		for (let i in params || {}) {
			if (i) {
				if (i === 'text') {
					textData = params[i];
				} else {
					elem.setAttribute(i, params[i]);
				}
			}
		}
		if (typeof parent !== 'undefined' && parent) {
			parent.appendChild(elem);
		}
		if (type === 'text') {
			elem.appendChild(doc.createTextNode(textData));
		}
		return elem;
	};

	// calculate and draw segment by center. radius, start and end angles
	static polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		};
	}
	static describeArc(x, y, radius, startAngle, endAngle, isSector=true) {
		var start = SmartTooltip.polarToCartesian(x, y, radius, endAngle);
		var end = SmartTooltip.polarToCartesian(x, y, radius, startAngle);
		var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
		if (isSector) {
			return [
				"M", start.x, start.y,
				"A", radius, radius, 0, arcSweep, 0, end.x, end.y,
				"L", x, y,
				"Z"
			].join(" ");
		} else {
			return [
				"M", start.x, start.y,
				"A", radius, radius, 0, arcSweep, 0, end.x, end.y
			].join(" ");
		}
	}

	// http get promis
	static 	_httpGet(url) {
		return new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);

			xhr.onload = function() {
				if (this.status == 200) {
					resolve(this.response);
				} else {
					var error = new Error(this.statusText);
					error.code = this.status;
					reject(error);
				}
			};

			xhr.onerror = function() {
				reject(new Error("Network Error"));
			};
			xhr.send();
		});
	}

	/**
	 * Sort data array by specified parameter
	 * 
	 * @param {array} data An array of data properties
	 * @property {string} name The name of signal. Existing parameter legend will be used instead of this one
	 * @property {string} legend the legend for signal. 
	 * @property {number || string} value The value of signal. In case of this parameter's type is 'string' it will be converted to number before compiring
	 * @property {string} color Represents the color of value
	 * @property {number} state Represents state of value. In case of this parameter's type is 'string' it will be converted to number before compiring
	 * @param {string} sortParam Sort data by one of the next parameters:"asis" - don't sort, states/state - sort by state or colors (in case of state is not exists), values/value - sort by value, colors/color - sort by color, names/name - sort by legend or name, any other word 	- sort by this "word" parameter. For example: link
	 * 
	 * Be careful: this function changes an array data!
	 */
	static sortDataByParam(data = [], sortParam="asis") {
		switch (sortParam) {
			case 'asis':
				break;
			case 'name':  	 // sort by name and ignore lower and upper case
			case 'names': {  // sort by name and ignore lower and upper case
				data.sort(function(a, b) {
					let aName = a.legend || a.name;
					let bName = b.legend || b.name;
					const nameA = aName.toUpperCase(); // ignore upper and lowercase
					const nameB = bName.toUpperCase(); // ignore upper and lowercase
					if (nameA < nameB) {
						return -1;
					}
					if (nameA > nameB) {
						return 1;
					}
					return 0;
				});
				break;
			}
			case 'value':
			case 'values': {
				data.sort(function(a, b) {
					if(Number(a.value) > Number(b.value)) {
						return 1;
					}
					if(Number(a.value) < Number(b.value)) {
						return -1;
					}
					return 0;
				});
				break
			}
			case 'color':
			case 'colors': {
				data.sort(function(a, b) {
					if (a.color > b.color) return 1;
					if (a.color < b.color) return -1
					return 0;
				});
				break;
			}
			case 'state':
			case 'states': {
				data.sort(function(a, b) {
					if (!a.state || !b.state) {
						if (a.color > b.color) return 1;
						if (a.color < b.color) return -1
					} else {
						if (Number(a.state) > Number(b.state)) return 1;
						if (Number(a.state) < Number(b.state)) return -1
					}
					return 0;
				});
				break;
			}
			default: {
				data.sort(function(a, b) {
					if(a[sortParam] > b[sortParam]) return 1;
					if(a[sortParam] < b[sortParam]) return -1;
					return 0;
				});
			}
		}
	}


	constructor() {
		if (!window.SmartTooltip) {
			this._initialized = false;
			this._pinned = false;
			this._instance = '';	// contains tooltip template string that show now
			// this map will contains pairs: widget id (as key) : object with template file name (as name) and loaded external tooltip template string (as value)
			// the function "show" will load the corresponding template into the body of the tooltip and fill it with the data received from outside
			this._definitions = new Map();

			let div = window.document.createElement('div');
			div.setAttribute('id', 'SmartTooltip');
			div.setAttribute('style', 'position:absolute; z-index:999999');
			window.document.body.appendChild(div);
			this._root = div.attachShadow({mode: 'open'});
			this._ttipRef = div;
			this._ttipGroup = null;

			const deftt = SmartTooltip.getDefaultTooltip();
			this._definitions.set('0', {name: deftt.name, value: deftt.value})

			this._pinned = (SmartTooltip._readFromLocalStorage("SmartTooltip.pinned") === 'true' ? true : false);

		}
	}

	_drawDiagramm(subTargets) {
		// delete all 'sub-target' from 'diagram-group'
		if (!this._ttipDiagramGroup) {
			return;
		}
		const sta = this._ttipDiagramGroup.getElementsByClassName('main-segment');
		while (sta.length) {
			sta[0].remove();
		}
		// calculate the sum of all values in array
		const sum = subTargets.reduce((acc, cur) => acc + Number(cur.value),0);
		const onePCT = subTargets.length > 1 ? 360 / sum : 3.6;
		const centerPt = {
			x: Number(this._ttipDiagram.getAttribute('cx')),
			y: Number(this._ttipDiagram.getAttribute('cy')),
			r: Number(this._ttipDiagram.getAttribute('r'))
		}
		let startAngle = 0;

		for (let i = 0; i < subTargets.length; i++) {
			let target = subTargets[i];
			// create individual group for each target
			let g_el = SmartTooltip.addElement('g', {class:'main-segment', id:`${i}--main-segment`}, this._ttipDiagramGroup);
			let endAngle = target.value * onePCT + startAngle;
			const isCurrent = target.current ? 'sttip-selected' : '';
			const isLinked  = target.link ? 'sttip-linked' : '';
			let el = SmartTooltip.addElement('path', {
				class: `sub-target ${isCurrent} ${isLinked}`,
				stroke: 'white',
				fill: target.color,
				'stroke-width': 1,
				'data-linkto': target.link || '',
				'data-uuid': target.uuid || '',
				d: SmartTooltip.describeArc(centerPt.x, centerPt.y, centerPt.r, startAngle, endAngle)
			}, g_el);
			startAngle =+ endAngle;
		}
	}
	_findElementByClassAndUuid(cls, uuid) {
		if (typeof uuid === 'undefined')
			return null;
		const els = window.SmartTooltip._ttipGroup.getElementsByClassName(cls);
		for (let el of els) {
			if (el.dataset['uuid'] === uuid) {
				return el;
			}
		}
		return null;
	}
	_setOverEffect(cls, uuid, effect) {
		if (typeof uuid === 'undefined')
			return null;
		const els = window.SmartTooltip._ttipGroup.getElementsByClassName(cls);
		let foundEl = null;
		for (let el of els) {
			if (el.dataset['uuid'] === uuid) {
				foundEl = el;
				console.info(`Todo: possible bug in IE11: "<svg> does not have 'Element.classList' in IE11"`);
				el.classList.add(effect);
			} else {
				el.classList.remove(effect);
			}
		}
		return foundEl;
	}

	// initialize smarttooltip event listeners, used for pin tooltip
	_initEvents() {
		if (!this._initialized) {
			this._initialized = true;
			this._interval = null;
			if (this._ttipGroup) {
				this._ttipGroup.addEventListener('mouseover', function(evt) {
					if (evt.target.classList) {
						if (evt.target.classList.value.match('sttip-legend-rect')) {
							window.SmartTooltip._setOverEffect('sub-target', evt.target.dataset['uuid'], 'sttip-hover');
						}
						if (evt.target.classList.value.match('sub-target')) {
							window.SmartTooltip._setOverEffect('sttip-legend-rect', evt.target.dataset['uuid'], 'sttip-lightgray');
						}
					}
				});
				this._ttipGroup.addEventListener('mouseout', function(evt) {
					if (evt.target.classList) {
						if (evt.target.classList.value.match('sttip-legend-rect')) {
							window.SmartTooltip._setOverEffect('sub-target', 'resetall', 'sttip-hover');
						}
						if (evt.target.classList.value.match('sub-target')) {
							window.SmartTooltip._setOverEffect('sttip-legend-rect', 'resetall', 'sttip-lightgray');
						}
					}
				});

				this._ttipGroup.addEventListener('mousemove', function(evt) {
					window.SmartTooltip._checkMouseMoving();
					// move tooltip's div and store its last position for next positioning in pinned mode (in future)
					const div = window.SmartTooltip._ttipRef;
					

					if (div.dataset['dragged'] === "true") {
						const rc = div.getBoundingClientRect();
						
						const scroll = SmartTooltip.getScroll();
						const mousePt = {
							X: evt.x + scroll.X,
							Y: evt.y + scroll.Y
						};

						const x = rc.left + scroll.X + (mousePt.X - Number(div.dataset['X']));
						const y = rc.top + scroll.Y + (mousePt.Y - Number(div.dataset['Y']));

						div.dataset['X'] = mousePt.X;
						div.dataset['Y'] = mousePt.Y;

						div.style['left'] = x;
						div.style['top'] = y;
					}
				});
				this._ttipGroup.addEventListener('mousedown', function(evt) {
					const div = window.SmartTooltip._ttipRef;
					
					const scroll = SmartTooltip.getScroll();
					const mousePt = {
						X: evt.x + scroll.X,
						Y: evt.y + scroll.Y
					};
					div.dataset['X'] = mousePt.X;
					div.dataset['Y'] = mousePt.Y;
					div.dataset['dragged'] = true;
				})
				this._ttipGroup.addEventListener('mouseup', function(evt) {
					const div = window.SmartTooltip._ttipRef;
					div.dataset['X'] = '';
					div.dataset['Y'] = '';
					div.dataset['dragged'] = false;
					if (window.SmartTooltip._pinned) {
						// store div coordinates in localstorage
						const rc = div.getBoundingClientRect();
						SmartTooltip._saveInLocalStorage('SmartTooltip.x', rc.x);
						SmartTooltip._saveInLocalStorage('SmartTooltip.y', rc.y);
					}
				})

				this._ttipGroup.addEventListener('click', function(evt) {
					let linkto = evt.target.dataset['linkto'];
					if (typeof linkto !== 'undefined' && typeof linkto.length === 'number' && linkto.length) {
						linkto = SmartTooltip.getLink(linkto);
						window.open(linkto, '');
					}
				});
			}
			if (this._ttipPinMe) {
				this._ttipPinMe.addEventListener('click', function(evt) {
					window.SmartTooltip._pinned = !window.SmartTooltip._pinned;
					if (window.SmartTooltip._pinned) {
						SmartTooltip._saveInLocalStorage('SmartTooltip.pinned', true);
					} else {
						SmartTooltip.clearLocalStorage('SmartTooltip.pinned');
						SmartTooltip.clearLocalStorage('SmartTooltip.x');
						SmartTooltip.clearLocalStorage('SmartTooltip.y');
					}
					this.classList.toggle('sttip-pinned');
				});
			}
		}
	};
	_checkMouseMoving() {
		if (window.SmartTooltip._interval) {
			clearTimeout(window.SmartTooltip._interval);
		}
		window.SmartTooltip._interval = setTimeout(function() {
			console.log('time is out, close tooltip window now!');
			if (window.SmartTooltip._pinned) {
				console.log('but pinned, so dont close! :)')
				return;
			}

			window.SmartTooltip.hide();
			window.SmartTooltip._interval = null;
		}, 5000); // 5000 - 5 second for showing tooltip on the screen without any mouse activity on it
	}

	init(id, tmplFileName) {
		this._ttipGroup = null;
		if (tmplFileName) {
			SmartTooltip._httpGet(tmplFileName)
			.then(response => {
				this._definitions.set(id, {name: tmplFileName, value: response});
			})
			.catch(error => {
				console.error(error); // Error: Not Found
			});
		}
	}

	isInit() {
		return 1; //this._ttipGroup;
	}

	// needMoveForNewId - Id of new owner control, found in data.id
	move(x, y, needMoveForNewId=0, ownerRect) {
		if (!needMoveForNewId) {
			if (this._pinned)
				return;
		}

		if (this._ttipRef && this._ttipGroup) {
			// in case of moving of pinned tooltip, calculate it's new coordinate by positioning it at the right side of owner control
			if (needMoveForNewId && typeof ownerRect === 'object') {
				x = ownerRect.right + 16;
				y = ownerRect.top;
			} else {
				x += 10;
				y += 30;
			}
			// caclulate an absolute location
			const scroll = SmartTooltip.getScroll();
			x += scroll.X;
			y += scroll.Y;

			this._ttipRef.style['left'] = x;
			this._ttipRef.style['top'] = y;

			const divRect = this._ttipRef.getBoundingClientRect();
			let offsetX = window.innerWidth - divRect.right;
			if (offsetX < 0) {
				x += (offsetX-50);
				this._ttipRef.style['left'] = x;
			}

			window.SmartTooltip._checkMouseMoving();
		}
	}

	show(data) { // dt = { x, y, title: {color, value, name, descr}, targets: [sub-targets], ...options}
		if (typeof data === 'object') {
			let ttipdef = null;
			if (this._definitions.has(data.id)) {
				ttipdef = this._definitions.get(data.id);
			} else {
				ttipdef = this._definitions.get('0');	// get default
			}
			if (!ttipdef) {
				this._ttipGroup = null;
				console.error('Tooltip definition not found');
				return;
			}
			// don't rebuild tooltip in case of same instance name
			if (this._instance !== ttipdef.name) {
				this._instance = ttipdef.name;

				if (window.SmartTooltip._interval) {
					clearTimeout(window.SmartTooltip._interval);
				}

				this._initialized = false;
				this._root.innerHTML= ttipdef.value;
				this._svg = this._root.firstElementChild;

				this._ttipGroup 	   = this._root.getElementById("tooltip-group");
				this._ttipPinMe		   = this._root.getElementById("pinMe");
				this._ttipFrame        = this._root.getElementById('tooltip-frame');
				this._ttipLegendGroup  = this._root.getElementById('legend-group');
				this._ttipLegendFrame  = this._root.getElementById('legend-frame');
				this._ttipLegendStroke = this._root.getElementById('legend-stroke');
				this._sttipLegendTextStroke = this._root.getElementById('legend-text-stroke');
				this._ttipLegendRect   = this._root.getElementById('legend-rect');
				this._ttipLegendColor  = this._root.getElementById('legend-color');
				this._ttipLegendName   = this._root.getElementById('legend-name');
				this._ttipLegendValue  = this._root.getElementById('legend-value');
				this._ttipRunIndicator = this._root.getElementById('run-indicator');
				this._ttipDiagram      = this._root.getElementById('diagram');
				this._ttipDiagramGroup = this._root.getElementById('diagram-group');
				this._ttipValue        = this._root.getElementById('tooltip-value');
				this._ttipDescrGroup   = this._root.getElementById('descr-group');
				this._ttipTitle        = this._root.getElementById('tooltip-title');
				this._ttipDescription  = this._root.getElementById('tooltip-description');
				this._ttipTitleGroup   = this._root.getElementById('title-group');
				this._ttipScaleGroup   = this._root.getElementById('scale-group');
				this._ttipBoundGroup   = this._root.getElementById('bound-group');
				this._ttipValue50      = this._root.getElementById('value-50');
				this._ttipValue100     = this._root.getElementById('value-100');
				this._ttipRef.style['display'] = 'none';
				this._initEvents();

				if (this._pinned) {
					this._ttipPinMe ? this._ttipPinMe.classList.add('sttip-pinned') : {};
				}
			}

			if (this._ttipRef && this._ttipGroup) {

				const legendGroupX = this._ttipLegendGroup? (this._ttipLegendGroup.dataset['x']) : 0;
				const titleGroupX  = this._ttipTitleGroup ? (this._ttipTitleGroup.dataset['x']) : 0;
				let ttipBoundGroupBR, format, sText;

				// delete all 'legend-stroke' clones from 'legend-group'
				const lsa = this._ttipLegendGroup ? this._ttipLegendGroup.getElementsByClassName('clone-ls') : null;
				while (lsa.length) {
					lsa[0].remove();
				}

				this._ttipGroup.setAttribute("transform", "scale(1, 1)");
				this._ttipRef.style['display'] = '';
				
				let ownerBodyRect = { left: 0, top:0, right:0, bottom:0 };
				// specified parameter options.scale will change this variable and SmartTooltip window will be scaled by specified factor
				// the default is 0.6 
				let scaleToolipFactor = 0.6;	

				if (typeof data.options === 'object') {
					// change apperiance of run indicator (if exists)
					if (this._ttipRunIndicator && typeof data.options.isRun !== 'undefined') {
						this._ttipRunIndicator.classList.replace((data.options.isRun? 'sttip-stop' : 'sttip-run'), (data.options.isRun? 'sttip-run' : 'sttip-stop'));
					}
					// tRect - the client rectangle coordinates of correspondent element.
					// this coordinates will be used for positioning 'the pinned' tooltip window near correspondent element
					if (typeof data.options.tRect === 'object') {
						ownerBodyRect = data.options.tRect;
					}
					if (typeof data.options.scale === 'number') {
						scaleToolipFactor = data.options.scale;
					}
					if (typeof data.options.sortby === 'string') {
						this.sortby = data.options.sortby;
					}
					this._svg.removeAttribute("style")
					if (typeof data.options.cssVars === 'object') {
						const css = data.options.cssVars;
						for ( var key in css) {
							this._svg.style.setProperty(key, css[key]);
						}
					}
				}

				if (typeof data.targets === 'object' && data.targets.length) {
					// create the temporary array for working with it (sorting,...)
					const targets = Array.from(data.targets);
					//const targets = { ...data.targets }; - cannot be used here, because I use internal Array functions in sorting! 

					// now sort it be optiona parameter 'sortby'
					SmartTooltip.sortDataByParam(targets, this.sortby || "value");
					if (targets.length) {
						this._ttipLegendGroup ? (this._ttipLegendGroup.style['display'] = '') : {};
						this._ttipDiagram ? (this._ttipDiagram.style['display'] = '') : {};
						this._ttipDiagramGroup ? (this._ttipDiagramGroup.style['display'] = '') : {};
						this._ttipTitleGroup ? (this._ttipTitleGroup.setAttributeNS(null, 'transform', `translate(0, 0)`)) : {};

						let y = 0;
						// show template
						if (this._ttipLegendGroup && this._ttipLegendStroke) {
							this._ttipLegendStroke.style['display'] = '';
							// calculate max length for first (name) and second (value) columns
							let C1 = { maxL: 0, maxInd: -1, rows: [] }, C2 = { maxL: 0, maxInd: -1, rows: [] }, gap = 10, text;
							for (let index = 0; index < targets.length; index++) {
								if (this._ttipLegendName) {
									if (typeof targets[index].legendFormat === 'string') {
										format = targets[index].legendFormat;
									} else {
										format = null;
									}
									text = SmartTooltip.formatString((format || this._ttipLegendName.dataset['format'] || "$LEGEND$"), targets[index]);
									if (text.length > C1.maxL) {
										C1.maxL = text.length;
										C1.maxInd = index;
									}
									C1.rows.push(text)
								}
								if (this._ttipLegendValue) {
									if (typeof targets[index].legendValFormat === 'string') {
										format = targets[index].legendValFormat;
									} else {
										format = null;
									}
									text = SmartTooltip.formatString((format || this._ttipLegendValue.dataset['format'] || "$VALUE$"), targets[index]);
									if (text.length > C2.maxL) {
										C2.maxL = text.length;
										C2.maxInd = index;
									}
									C2.rows.push(text);
								}
							}
							// now, set legend stroke width to maximum length as C1.max + gap + C2.max
							let xC1 = 0, xC2 = 0, maxC1Length, maxStrokeWidth = 0, strokeGap = 10;
							if (C1.maxInd > -1) {
								xC1 = this._ttipLegendName.getBBox().x;
								this._ttipLegendName.textContent = C1.rows[C1.maxInd];
								maxC1Length = this._ttipLegendName.getComputedTextLength();
							}
							if (C2.maxInd > -1) {
								this._ttipLegendValue.textContent = C2.rows[C2.maxInd];
								xC2 = xC1 + maxC1Length + gap;
								this._ttipLegendValue.setAttributeNS(null, 'x', xC2);

								maxStrokeWidth = this._sttipLegendTextStroke.getBoundingClientRect().width;
							}

							for (let index = 0; index < targets.length; index++) {
								let target = targets[index];
								this._ttipLegendColor ? (this._ttipLegendColor.style['fill'] = target.color) : {};
								this._ttipLegendName ?  (this._ttipLegendName.textContent = C1.rows[index]) : {};
								this._ttipLegendValue ?  (this._ttipLegendValue.textContent = C2.rows[index]) : {};
								if (this._ttipLegendRect) {
									this._ttipLegendRect.dataset['linkto'] = target.link || '';
									this._ttipLegendRect.dataset['uuid'] = target.uuid || '';
									this._ttipLegendRect.dataset['parent'] = target.parent || '';
									this._ttipLegendRect.setAttributeNS(null, 'width', maxStrokeWidth + strokeGap);
								}
								const ls = this._ttipLegendStroke.cloneNode(true);
								ls.setAttributeNS(null, 'id', `legend-stroke-${index+1}`);
								ls.classList.add('clone-ls');
								if (target.current) {
									ls.classList.add('sttip-current');
								} else {
									ls.classList.remove('sttip-current');
								}
								target.link ? ls.classList.add('sttip-linked') : ls.classList.remove('sttip-linked');
								ls.setAttributeNS(null, 'transform', `translate(0, ${y})`);
								this._ttipLegendGroup.appendChild(ls);
								y = (index + 1) * 34;	// mistical number is a storke height from template
							}
							// hide template
							this._ttipLegendStroke.style['display'] = 'none';
						}
						this._drawDiagramm(targets);
					}
				} else {
					// hide legend group and diagram in case of no targets
					this._ttipLegendGroup ? (this._ttipLegendGroup.style['display'] = 'none') : {};
					this._ttipDiagram ? (this._ttipDiagram.style['display'] = 'none') : {};
					this._ttipDiagramGroup ? (this._ttipDiagramGroup.style['display'] = 'none') : {};
					this._ttipTitleGroup ? (this._ttipTitleGroup.setAttributeNS(null, 'transform', `translate(-${titleGroupX - legendGroupX}, 0)`)) : {};
				}

				if (typeof data.title === 'object') {
					let maxWidth = this._ttipValue ? Number(this._ttipValue.dataset['maxw']) : 0;
					// title - legend or name
					if (this._ttipTitle) {
						if (typeof data.title.titleFormat === 'string') {
							format = data.title.titleFormat;
						} else {
							format = null;
						}

						sText = SmartTooltip.formatString((format || this._ttipTitle.dataset['format'] || "$LEGEND$"), data.title);
						this._ttipTitle.textContent = sText;
					}
					// description - formatted value
					if (this._ttipDescription) {
						if (typeof data.title.descrFormat === 'string') {
							format = data.title.descrFormat;
						} else {
							format = null;
						}
						sText = SmartTooltip.formatString(format || this._ttipDescription.dataset['format'] ||  "$VALUE$", data.title);
						this._ttipDescription.textContent = sText;
					}
					let descrRect = 0; 		// resize scale group for this size
					let scaleFactor = 1;	// will be calculated if real rectangle width, after title and description rendering, 
											// greater than stored in parameter 'data-maxw' in template definition

					if (this._ttipDescrGroup) {
						descrRect = this._ttipDescrGroup.getBoundingClientRect();
						if (maxWidth < descrRect.width) {
							scaleFactor = descrRect.width / maxWidth;
						}
					}
					// value color and width
					if (this._ttipValue) {
						if (typeof data.title.value !== 'undefined') {
							this._ttipScaleGroup ? (this._ttipScaleGroup.style['display'] = 'block') : {};
							this._ttipValue.style['fill'] = data.title.color || '#666';
							let onepct = maxWidth/100;
							if(typeof data.title.valueMax !== 'undefined' && data.title.valueMax !== null) {
								onepct = maxWidth / data.title.valueMax;
								if (this._ttipValue50 && this._ttipValue100) {
									this._ttipValue50.textContent = (data.title.valueMax / 2).toFixed(0);
									this._ttipValue100.textContent = data.title.valueMax;
								}
							} else if (data.title.value > 100) {
								onepct = maxWidth / data.title.value;
								if (this._ttipValue50 && this._ttipValue100) {
									this._ttipValue50.textContent = (data.title.value / 2).toFixed(0);
									this._ttipValue100.textContent = data.title.value;
								}
							} else {
								onepct = maxWidth/100;
								if (this._ttipValue50 && this._ttipValue100) {
									this._ttipValue50.textContent = '50';
									this._ttipValue100.textContent = '100%';
								}
							}
							this._ttipValue.setAttribute('width', data.title.value * onepct || 0);
							if (data.title.link) {
								this._ttipValue.classList.add('sttip-linked');
								this._ttipValue.dataset['linkto'] = data.title.link;
							} else {
								this._ttipValue.classList.remove('sttip-linked');
								this._ttipValue.dataset['linkto'] = '';
							}
							data.title.uuid ? this._ttipValue.dataset['uuid'] = data.title.uuid : '';
							if (this._ttipScaleGroup) {
								if (scaleFactor > 1) {
									let tmp = this._ttipTitleGroup.dataset['x'];
									let translateX = -tmp * (scaleFactor-1);
									this._ttipScaleGroup.setAttributeNS(null, 'transform', `translate(${translateX}, 0) scale(${scaleFactor}, 1)`);
								} else {
									this._ttipScaleGroup.removeAttributeNS(null, 'transform');
								}
							}
						} else if (this._ttipScaleGroup) {
							this._ttipScaleGroup ? (this._ttipScaleGroup.style['display'] = 'none') : {};
						}
					}
				}
				if (typeof data.x === 'number' && typeof data.y === 'number') {
					let forId = 0;
					if (this._shownFor != data.id) {
						this._shownFor = data.id;
						forId = this._shownFor;
					}
					// before moving to position of forId element, check the local storage x and y coordinates
					// and move to these coordinates (the tooltip window was moved by user interaction to seautable place (i hope))
					let left=0, top=0
					if (forId) {
						left = Number(localStorage.getItem('SmartTooltip.x'));
						top = Number(localStorage.getItem('SmartTooltip.y'));
					}
					if (left && top) { // move here!
						const scroll = SmartTooltip.getScroll();
						left += scroll.X;
						top += scroll.Y;

						this._ttipRef.style['left'] = left;
						this._ttipRef.style['top'] = top;
					} else {
						this.move(data.x, data.y, forId, ownerBodyRect);
					}
				}
				// resize the frame rectange of toolip window
				ttipBoundGroupBR = this._ttipBoundGroup.getBoundingClientRect();
				this._ttipFrame.setAttributeNS(null, 'width', ttipBoundGroupBR.width + 12);
				this._ttipFrame.setAttributeNS(null, 'height', ttipBoundGroupBR.height + 12);

				this._ttipGroup.setAttribute("transform", `scale(${scaleToolipFactor})`);
				// get real (after scaling) size of #toolip-group and resize the root SVG
				ttipBoundGroupBR = this._ttipGroup.getBoundingClientRect();
				this._svg.setAttributeNS(null, 'width', ttipBoundGroupBR.width);
				this._svg.setAttributeNS(null, 'height', ttipBoundGroupBR.height);
				window.SmartTooltip._checkMouseMoving();
			}
		}
	}
	hide() {
		if (this._ttipRef && this._ttipGroup) {
			if (!this._pinned)
				this._ttipRef.style['display'] = 'none';
		}
	}
};

