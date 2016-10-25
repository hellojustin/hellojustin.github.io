"use strict";

var MugshotPie = function ( selector, data, mugshotUrl ) {
  this.selector   = selector;
  this.data       = data;
  this.mugshotUrl = mugshotUrl;

  this.el         = $( this.selector ).attr('id', 'MugshotPie');
  this.p          = Raphael( 'MugshotPie' );

  eve.on( 'mugshotpie:resize', this.debounce( this.resize, 200 ) );
};

MugshotPie.prototype.arcDefinition = function( grid, sectionPadding ) {
  return function( startT, endT ) {
    var paddedStartT = startT + sectionPadding,
        paddedEndT   = endT - sectionPadding,
        arcFlag = Math.abs( Math.floor( ( paddedEndT - paddedStartT ) / Math.PI ) ),
        start   = grid.cartesian( paddedStartT ),
        end     = grid.cartesian( paddedEndT ),
        p       = [];

    p = p.concat( [ "M", start.x, start.y ] );
    p = p.concat( [ "A", grid.radius, grid.radius, 0, arcFlag, 1, end.x, end.y ] );

    return { path : p };
  }
};

MugshotPie.prototype.pointerDefinition = function( center, radius, padding ) {
  return function( pieSection ) {
    var sectionMidpoint = pieSection.getPointAtLength( pieSection.getTotalLength() / 2 ),
        sectionPadding  = (sectionMidpoint.x > center.x) ? padding + Math.pow(Math.abs(sectionMidpoint.y - radius), 0.75) : -padding - Math.pow(Math.abs(sectionMidpoint.y - radius), 0.75),
        labelLocation   = (sectionMidpoint.x > center.x) ? center.x + radius + 40 : center.x - radius - 40,
        p = [];

    p = p.concat( [ "M", sectionMidpoint.x, sectionMidpoint.y ] );
    p = p.concat( [ "L", labelLocation, sectionMidpoint.y ] );

    return { path : p };
  }
};

MugshotPie.prototype.labelDefinition = function( center, padding ) {
  return function( pointer, text ) {
    var rightSide = pointer.getPointAtLength(0).x > center.x,
        textAnchor = (rightSide) ? 'start' : 'end',
        xVal = pointer.getPointAtLength(pointer.getTotalLength).x,
        x = (rightSide) ? xVal + padding/2 : xVal - padding/2,
        y = pointer.getPointAtLength(pointer.getTotalLength).y;
    return { x : x, y : y, text : text, 'text-anchor' : textAnchor };
  }
};

MugshotPie.prototype.arcSection = function( name, numerator, denominator, totalDegrees ) {
  var num      = numerator,
      denom    = denominator,
      dataRads = Eskimo.getRadians( num / denom * totalDegrees ),
      start    = this.grid.point( name+'start', this.grid.point( 'arcStart' ).t ),
      end      = this.grid.point( name+'end', start.t + dataRads );

  this.grid.point( 'arcStart', start.t + dataRads  );
  return [ start.t, end.t ];
};

MugshotPie.prototype.measure = function() {
  this.p.setSize( this.el.width(), this.el.parent().height() );
  this.center     = { x : this.p.width/2, y : this.p.height/2 };
  this.strokeSize = 20;
  this.radius     = Math.min(this.p.width, this.p.height)/2 - this.strokeSize;
  this.sectionPad = 0.03;

  this.grid       = new Eskimo( this.center, this.radius, Eskimo.getRadians( 270 ), -1 );
  this.p.customAttributes.arc     = this.arcDefinition( this.grid, this.sectionPad );
  this.p.customAttributes.pointer = this.pointerDefinition( this.center, this.radius, this.strokeSize/2 );
  this.p.customAttributes.label   = this.labelDefinition( this.center, this.strokeSize );
}

MugshotPie.prototype.draw = function() {
  this.measure();

  // tell eskimo about our start location
  this.grid.point( 'arcStart', 1.57 );

  this.drawSection( 'Technical\nLeadership', 30, 100, '#009245', 'p2' );
  this.drawSection( 'Hands-on\nDevelopment', 20, 100, '#8CC63F', 'p1' );
  this.drawSection( 'Product\nLeadership', 20, 100, '#2E3192', 'p4' );
  this.drawSection( 'Project\nLeadership', 15, 100, '#29ABE2', 'p3' );
  this.drawSection( 'People\nLeadership', 10, 100, '#93278F', 'p5' );
  this.drawSection( 'UX Research\n& Design', 5, 100, '#D4145A', 'p6' );

  this.drawMugshot( this.mugshotUrl );
};

MugshotPie.prototype.drawSection = function( name, numerator, denominator, color, skillId ) {
  var pieSection = this.p.path().attr( {
    'arc'          : this.arcSection( name, numerator, denominator, 360 ),
    'stroke'       : color,
    'stroke-width' : this.strokeSize
  } );
  pieSection.node.setAttribute('class', 'dimmable-elem');
  pieSection.node.setAttribute('data-skill', skillId);
  var pieSectionPointer = this.p.path().attr( {
    'pointer'      : pieSection,
    'stroke'       : '#999999',
    'stroke-width' : 1
  } );
  var pieSectionLabel = this.p.text().attr( {
    'label'        : [pieSectionPointer, name],
    'fill'         : '#999999',
    'font-size'    : '14px',
    'font-family'  : "'Open Sans', sans-serif"
  } );
  var pieSectionLabelDot = this.p.circle().attr( {
    'cx'           : pieSectionPointer.getPointAtLength(0).x,
    'cy'           : pieSectionPointer.getPointAtLength(0).y,
    'r'            : 3,
    'fill'         : '#999999',
    'stroke-width' : 0
  } );
  return pieSection;
};

MugshotPie.prototype.drawMugshot = function( mugshotUrl ) {
  var cacheBuster = Math.random(),
      imageMask = this.p.circle( this.center.x, this.center.y, this.radius - this.strokeSize ).attr( {
        fill         : 'url(' + mugshotUrl + '?' + cacheBuster + ')',
        'stroke-width' : 0
      } ),
      idRegex   = /url\((.*)\)/,
      pattern   = imageMask.node.getAttribute('fill'),
      patternId = pattern.match(idRegex)[1],
      that = this;

  $(patternId + ' image').on('load', function() {
    $(patternId + ', ' + patternId + ' image').attr({
      'height': that.radius * 2 - that.strokeSize,
      'width' : that.radius * 2 - that.strokeSize
    });
  });
  // $(patternId + ' image').load();

  return imageMask;
};

MugshotPie.prototype.resize = function() {
  this.p.clear();
  this.draw();
};

MugshotPie.prototype.debounce = function( callback, delay ) {
  var timeout;
  return function() {
    var args    = arguments,
        context = this;
    clearTimeout( timeout );
    timeout = setTimeout( function() {
      callback.apply( context, args );
    }, delay );
  }
};

var mugshotPie = new MugshotPie( '.mugshot-pie div', {}, 'img/mug_260x260.jpg' );
mugshotPie.draw();

$( window ).resize( function() { eve( 'mugshotpie:resize', mugshotPie ); } );
