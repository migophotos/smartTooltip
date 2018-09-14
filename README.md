# smartTooltip
javascript generated svg-based tooltip control with some "smart" functionality such as: pinning to target element, fix in client coordinates, ...

The control uses the built-in template to display tooltips.
 * The tooltip window can be "pinned" and will be displayed next to the element until the pinMe option is turned off.
It also use customized templates for individual elements.
 * To take advantage of this functionality, place the custom template on the server and call the static initialization function before first call of SmartTooltip.showTooltip(...), passing the element ID and the full name of the template in arguments.
 for example: SmartTooltip.initTooltip('pie-123', 'toolip.svg');
 
 An Internal template implementation shows the array of data as flat pie diagramm with title and legend.
 The data argument in function showTemplate have the next structure:
 const data = {
  	id: target identificator,
		x:  evt.clientX,
		y:  evt.clientY,
		options: {
			// the client rectangle coordinates of correspondent element.
			// this coordinates will used for place 'the pinned' tooltip near this element
			tRect: { left: 0, top:0, right:0, bottom:0 },
			// run indicator is a small circle near the legend. It's fill color is green, when this parameter equals true and red when false.
			isRun: true / false
		},
		title: {
			uuid:	  'unique target id'
			legend: 'Title legend',
			name:   'Title legend may be defined here also',
			descr:	'Description'
			value:  'This text will be shown as description',
			color:  'state color',
			link:   'external URL',
			[titleFormat]: 'title formating string with internal variables, such as $VALUE$, $NAME$, $DESCR$, ....
			[descrFormat]: same as titleFormat string but for second string of text in title section
		},
		targets: [
			{
				uuid:	  'unuque target id'
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
  
  Example of use:
 
 1. Conventional use:
  if (!window.SmartTooltip) {
    window.SmartTooltip = new SmartTooltip();
  }
  ....
  ....
  window.SmartTooltip.init(idElement, templateFileName);
  ...
  window.SmartTooltip.show(data)
  window.SmartTooltip.move(evt.clientX, evt.clientY);
  window.SmartTooltip.hide();
 
 2. Use internal template
  SmartTooltip.showTooltip(data);
  SmartTooltip.moveTooltip(evt.clientX, evt.clientY);
  SmartTooltip.hideTooltip();
 
