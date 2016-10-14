"use strict";

var ResumeHeatmap = function ( selector, data, emplDetailsSelector, amateurDetailsSelector ) {
  this.presetColors      = data.presetColors;
  this.skills            = data.skills;
  this.proSkillUse       = $.map( data.skillUsage, function( obj ) {
    return { month: obj.month, year: obj.year, data: obj.professional };
  });
  this.amateurSkillUse   = $.map( data.skillUsage, function( obj ) {
    return { month: obj.month, year: obj.year, data: obj.amateur };
  });
  this.selector          = selector;
  this.element           = $( '#' + this.selector );
  this.emplDetailsEls    = $( emplDetailsSelector );
  this.amateurDetailsEls = $( amateurDetailsSelector );
  this.p                 = Raphael( this.selector );

  eve.on( 'heatmap:resize', this.debounce( this.resize, 200 ) );
};

ResumeHeatmap.prototype.measure = function() {
  this.totalWidth        = this.element.width()

  this.bracketWidth      = this.totalWidth * .20;
  this.bracketRangeWidth = this.bracketWidth * .10;
  this.bracketTailWidth  = this.bracketWidth * .65;
  this.bracketSpace      = this.bracketWidth * .10

  this.heatmapWidth      = this.totalWidth * .7;
  this.cellWidth         = ( this.heatmapWidth / 10 ) * .9;
  this.cellSpace         = ( this.heatmapWidth / 10 ) * .1;

  this.cellHeight        = this.cellWidth;
  this.colWidth          = this.cellWidth + this.cellSpace;
  this.rowHeight         = this.cellHeight + this.cellSpace;
  this.proX              = this.bracketWidth;
  this.proHeight         = this.rowHeight * this.proSkillUse.length;
  this.proWidth          = this.heatmapWidth;

  this.labelWidth        = this.totalWidth * .1;
  this.labelSpace        = this.labelWidth * .25;
  this.labelX            = this.proX + this.heatmapWidth + this.labelSpace;
  this.fontSize          = this.labelWidth * .5;

  this.skillsFontSize    = 14;
  this.skillsPadding     = this.skillsFontSize * .5
  this.skillHeight       = this.skillsFontSize + this.skillsPadding*2
  this.skillsHeight      = this.skills.length * this.skillHeight;

  this.presentDate       = { month: 10, year: 2015 };
  this.element.height( this.proHeight + this.skillsHeight );
  this.p.setSize( this.element.width(), this.element.parent().height() );

  return this.totalWidth;
};

ResumeHeatmap.prototype.draw = function() {
  if ( this.measure() > 50 ) {
    this.legend = this.drawSkills( this.skills );

    this.proSkillsHeatmap = this.drawRows( this.proSkillUse );
    this.proSkillsHeatmap.attr({ stroke : 'none' });
    this.proSkillsHeatmap.transform( "T" + this.proX + ",0" );

    this.labels = this.drawYearLabels();
    this.labels.transform( "T0," + this.skillsHeight );

    this.jobBrackets = this.drawBrackets( this.emplDetailsEls );
    this.jobBrackets.attr({ 'stroke' : 'rgba(  62,  96, 111, 1 )' });
  }
};

ResumeHeatmap.prototype.debounce = function( callback, delay ) {
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

ResumeHeatmap.prototype.resize = function() {
  this.p.clear();
  this.draw();
};

ResumeHeatmap.prototype.drawSkills = function( skills ) {
  this.p.setStart();
  for ( var skillNum = 0; skillNum < skills.length; skillNum++ ) {
    this.p.rect( this.proX,
                 this.skillHeight * skillNum,
                 this.heatmapWidth - this.cellSpace,
                 this.skillHeight ).attr({
      'fill'   : this.presetColors[ skills[skillNum].color ],
      'stroke' : 'none'
    });

    this.p.text( ( this.heatmapWidth - this.cellSpace )/1.25,
                 ( this.skillHeight * skillNum ) + this.skillsFontSize,
                 skills[skillNum].name ).attr({
      'font-size' : this.skillsFontSize,
      'fill'      : 'rgba( 252, 255, 245, 1 )'
    });
  }
  return this.p.setFinish();
};

ResumeHeatmap.prototype.drawRows = function( data, rowSize ) {
  this.p.setStart();
  for ( var rowNum = 0; rowNum < data.length; rowNum++ ) {
    var skillUsage = data[rowNum];
    this.drawRow( rowNum, skillUsage );
  }
  return this.p.setFinish();
};

ResumeHeatmap.prototype.drawRow = function( num, data ) {
  for ( var colNum = 0; colNum < data.data.length; colNum++ ) {
    var cellData = data.data[colNum];
    this.drawCell( num, colNum, cellData );
  }
};

ResumeHeatmap.prototype.drawCell = function( row, col, data ) {
  var color = this.presetColors[ data ],
      x     = col * ( this.cellHeight + this.cellSpace ),
      y     = row * ( this.cellWidth  + this.cellSpace ) + this.skillsHeight + this.cellSpace;
  this.p.rect( x, y, this.cellWidth, this.cellHeight ).attr({ fill : color });
};

ResumeHeatmap.prototype.drawYearLabels = function() {
  var currRowYear = 0,
      nextRowYear = 0;
  this.p.setStart();
  for ( var rowNum = 0; rowNum < this.proSkillUse.length-1; rowNum++ ) {
    if ( currRowYear != nextRowYear ) {
      this.drawYearLabel( rowNum, currRowYear );
    }
    currRowYear = this.proSkillUse[rowNum].year;
    nextRowYear = this.proSkillUse[rowNum+1].year;
  }
  return this.p.setFinish();
};

ResumeHeatmap.prototype.drawYearLabel = function( row, year ) {
  var x     = this.labelX,
      y     = row * ( this.cellHeight + this.cellSpace ),
      textX = x+this.cellWidth*0.7,
      textY = y-this.fontSize/2,
      text  = "'" + year.toString().slice( 2 );
  this.p.rect( x, y-1, this.labelWidth, 0.5 ).attr({
    'fill'   : 'none',
    'stroke' : 'rgba( 209, 219, 189, 1 )'
  });
  this.p.text( textX, textY, text ).attr({
    'font-size' : this.fontSize,
    'fill'      : 'rgba( 209, 219, 189, 1 )'
  });
};

ResumeHeatmap.prototype.drawBrackets = function( elements ) {
  this.p.setStart();
  for ( var i = 0; i < elements.length; i++ ) {
    this.drawBracket( elements[i] );
  }
  return this.p.setFinish();
}

ResumeHeatmap.prototype.drawBracket = function( el ) {
  var $el      = $( el ),
      data     = $el.data(),
      startRow = this.getRowFromMonthYear( data.startMonth, data.startYear ),
      endRow   = this.getRowFromMonthYear( data.endMonth,   data.endYear   ),
      elY      = $el.position().top + $el.find( 'header' ).outerHeight(),
      topY, height;

  if ( endRow === 0 ) {
    topY   = this.cellHeight/2 + this.skillsHeight;
    height = ( startRow - endRow ) * ( this.cellHeight + this.cellSpace );
  } else {
    topY   = endRow * ( this.cellHeight + this.cellSpace ) + this.cellHeight/2 + this.skillsHeight;
    height = ( startRow - endRow ) * ( this.cellHeight + this.cellSpace );
  }

  this.p.path().attr({
    path : [ [ 'M', this.bracketWidth-this.bracketSpace,     topY            ],
             [ 'C', this.bracketTailWidth,                   topY,
                    this.bracketWidth-this.bracketSpace,     topY + height/2,
                    this.bracketTailWidth,                   topY + height/2 ],
             [ 'C', this.bracketWidth-this.bracketSpace,     topY + height/2,
                    this.bracketTailWidth,                   topY + height,
                    this.bracketWidth-this.bracketSpace,     topY + height   ],
             [ 'M', 0,                                       elY-0.5         ],
             [ 'C', this.bracketTailWidth,                   elY-0.5,
                    0,                                       topY + height/2,
                    this.bracketTailWidth,                   topY + height/2 ] ]
  });
};

ResumeHeatmap.prototype.getRowFromMonthYear = function( month, year ) {
  if ( year === this.presentDate.year ) {
    return this.presentDate.month - month;
  } else if ( this.presentDate.year - year === 1 ) {
    return this.presentDate.month + ( 12 - month );
  } else {
    var monthsThisYear         = this.presentDate.month,
        monthsIntercedingYears = 12 * ( this.presentDate.year - 1 - year ),
        monthsInOccurringYear  = 12 - month;
    return monthsThisYear + monthsIntercedingYears + monthsInOccurringYear;
  }
};

var data    = {
  presetColors : {
    p1 : "rgba( 140, 198,  63, 0.75 )",
    p2 : "rgba(   0, 146,  69, 0.75 )",
    p3 : "rgba(  41, 171, 226, 0.75 )",
    p4 : "rgba(  46,  49, 146, 0.75 )",
    p5 : "rgba( 147,  39, 143, 0.75 )",
    p6 : "rgba( 212,  20,  90, 0.75 )",
    p7 : "rgba( 247, 147,  30, 0.75 )",
    p8 : "rgba( 224, 212,  35, 0.75 )",
  },
  skills : [
    { name : "Hands-on Development", color : 'p1' },
    { name : "Technical Leadership", color : 'p2' },
    { name : "Project Management",   color : 'p3' },
    { name : "Product Management",   color : 'p4' },
    { name : "People Management",    color : 'p5' },
    { name : "Interaction Design",   color : 'p6' },
    { name : "Visual Design",        color : 'p7' },
    { name : "Marketing",            color : 'p8' }
  ],
  skillUsage : [
    { month : 10, year  : 2015, professional  : [ 'p1', 'p1', 'p3', 'p4', 'p4', 'p4', 'p4', 'p7', 'p8', 'p8' ], amateur : [] },
    { month :  9, year  : 2015, professional  : [ 'p1', 'p1', 'p2', 'p3', 'p4', 'p4', 'p4', 'p5', 'p6', 'p8' ], amateur : [] },
    { month :  8, year  : 2015, professional  : [ 'p1', 'p1', 'p2', 'p3', 'p4', 'p4', 'p4', 'p6', 'p7', 'p7' ], amateur : [] },
    { month :  7, year  : 2015, professional  : [ 'p1', 'p1', 'p2', 'p3', 'p4', 'p4', 'p4', 'p5', 'p6', 'p7' ], amateur : [] },
    { month :  6, year  : 2015, professional  : [ 'p1', 'p1', 'p2', 'p3', 'p4', 'p4', 'p4', 'p4', 'p6', 'p7' ], amateur : [] },
    { month :  5, year  : 2015, professional  : [ 'p1', 'p1', 'p2', 'p3', 'p4', 'p4', 'p4', 'p5', 'p6', 'p7' ], amateur : [] },
    { month :  4, year  : 2015, professional  : [ 'p1', 'p1', 'p2', 'p3', 'p4', 'p4', 'p4', 'p4', 'p6', 'p7' ], amateur : [] },
    { month :  3, year  : 2015, professional  : [ 'p1', 'p1', 'p2', 'p3', 'p4', 'p4', 'p4', 'p5', 'p6', 'p7' ], amateur : [] },
    { month :  2, year  : 2015, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2', 'p2' ], amateur : [ 'p7', 'p6', 'p5', 'p4', 'p1' ] },
    { month :  1, year  : 2015, professional  : [ 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2', 'p2', 'p3' ], amateur : [ 'p7', 'p6', 'p5', 'p4', 'p1' ] },

    { month : 12, year  : 2014, professional  : [ 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2', 'p2', 'p3', 'p3' ], amateur : [ 'p7', 'p6', 'p4', 'p1' ] },
    { month : 11, year  : 2014, professional  : [ 'p1', 'p2', 'p2', 'p2', 'p2', 'p2', 'p2', 'p3', 'p3', 'p3' ], amateur : [ 'p6', 'p4', 'p1', 'p1' ] },
    { month : 10, year  : 2014, professional  : [ 'p1', 'p2', 'p2', 'p2', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4' ], amateur : [ 'p4', 'p4', 'p1' ] },
    { month :  9, year  : 2014, professional  : [ 'p2', 'p2', 'p2', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4', 'p4' ], amateur : [ 'p4', 'p4', 'p1' ] },
    { month :  8, year  : 2014, professional  : [ 'p1', 'p2', 'p2', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4', 'p4' ], amateur : [ 'p4', 'p1' ] },
    { month :  7, year  : 2014, professional  : [ 'p1', 'p2', 'p2', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4', 'p4' ], amateur : [ 'p4' ] },
    { month :  6, year  : 2014, professional  : [ 'p2', 'p2', 'p2', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4', 'p4' ], amateur : [] },
    { month :  5, year  : 2014, professional  : [ 'p1', 'p2', 'p3', 'p3', 'p4', 'p4', 'p4', 'p5', 'p5', 'p5' ], amateur : [ 'p4', 'p1', 'p1' ] },
    { month :  4, year  : 2014, professional  : [ 'p1', 'p2', 'p3', 'p3', 'p4', 'p4', 'p4', 'p5', 'p5', 'p5' ], amateur : [ 'p4', 'p1', 'p1' ] },
    { month :  3, year  : 2014, professional  : [ 'p1', 'p2', 'p3', 'p3', 'p3', 'p4', 'p4', 'p4', 'p5', 'p5' ], amateur : [ 'p4', 'p1', 'p1' ] },
    { month :  2, year  : 2014, professional  : [ 'p1', 'p2', 'p3', 'p3', 'p3', 'p4', 'p4', 'p4', 'p5', 'p5' ], amateur : [ 'p4', 'p1', 'p1' ] },
    { month :  1, year  : 2014, professional  : [ 'p1', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4', 'p4', 'p5', 'p5' ], amateur : [ 'p4', 'p1', 'p1' ] },

    { month : 12, year  : 2013, professional  : [ 'p1', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4', 'p4', 'p5', 'p5' ], amateur : [ 'p4', 'p1', 'p1' ] },
    { month : 11, year  : 2013, professional  : [ 'p1', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4', 'p4', 'p5', 'p5' ], amateur : [ 'p4', 'p1', 'p1' ] },
    { month : 10, year  : 2013, professional  : [ 'p1', 'p2', 'p2', 'p3', 'p3', 'p3', 'p3', 'p4', 'p5', 'p5' ], amateur : [ 'p4', 'p1', 'p1' ] },
    { month :  9, year  : 2013, professional  : [ 'p1', 'p1', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4', 'p5', 'p5' ], amateur : [ 'p4', 'p1', 'p1', 'p1' ] },
    { month :  8, year  : 2013, professional  : [ 'p1', 'p1', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4', 'p5', 'p5' ], amateur : [ 'p4', 'p1', 'p1', 'p1' ] },
    { month :  7, year  : 2013, professional  : [ 'p1', 'p1', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4', 'p5', 'p5' ], amateur : [ 'p1', 'p1', 'p1', 'p1' ] },
    { month :  6, year  : 2013, professional  : [ 'p1', 'p1', 'p2', 'p2', 'p2', 'p3', 'p3', 'p4', 'p5', 'p5' ], amateur : [ 'p1', 'p1', 'p1', 'p1' ] },
    { month :  5, year  : 2013, professional  : [ 'p1', 'p1', 'p2', 'p2', 'p2', 'p3', 'p3', 'p4', 'p5', 'p5' ], amateur : [ 'p6', 'p2', 'p2', 'p1', 'p1' ] },
    { month :  4, year  : 2013, professional  : [ 'p1', 'p1', 'p1', 'p2', 'p2', 'p3', 'p3', 'p3', 'p5', 'p5' ], amateur : [ 'p6', 'p2', 'p2', 'p1', 'p1' ] },
    { month :  3, year  : 2013, professional  : [ 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p3', 'p3', 'p3', 'p5' ], amateur : [ 'p2', 'p2', 'p1', 'p1' ] },
    { month :  2, year  : 2013, professional  : [ 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p3', 'p3', 'p3', 'p5' ], amateur : [ 'p2', 'p2', 'p1', 'p1' ] },
    { month :  1, year  : 2013, professional  : [ 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p3', 'p3', 'p5' ], amateur : [ 'p2', 'p1', 'p1', 'p1' ] },

    { month : 12, year  : 2012, professional  : [ 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p3', 'p3', 'p5' ], amateur : [ 'p1' ] },
    { month : 11, year  : 2012, professional  : [ 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2', 'p3', 'p5' ], amateur : [ 'p1' ] },
    { month : 10, year  : 2012, professional  : [ 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2', 'p3', 'p3' ], amateur : [ 'p1', 'p1' ] },
    { month :  9, year  : 2012, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p3', 'p3' ], amateur : [ 'p1', 'p1' ] },
    { month :  8, year  : 2012, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2', 'p3' ], amateur : [ 'p1', 'p1' ] },
    { month :  7, year  : 2012, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2', 'p3' ], amateur : [ 'p1', 'p1', 'p1' ] },
    { month :  6, year  : 2012, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p3' ], amateur : [ 'p4', 'p1', 'p1' ] },
    { month :  5, year  : 2012, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2' ], amateur : [ 'p4', 'p1', 'p1' ] },
    { month :  4, year  : 2012, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2' ], amateur : [ 'p1', 'p1', 'p1' ] },
    { month :  3, year  : 2012, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2' ], amateur : [ 'p1', 'p1', 'p1' ] },
    { month :  2, year  : 2012, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2' ], amateur : [ 'p1', 'p1', 'p1' ] },
    { month :  1, year  : 2012, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2' ], amateur : [ 'p1', 'p1' ] },

    { month : 12, year  : 2011, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2' ], amateur : [ 'p1', 'p1' ] },
    { month : 11, year  : 2011, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2' ], amateur : [ 'p1', 'p1' ] },
    { month : 10, year  : 2011, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2' ], amateur : [ 'p1' ] },
    { month :  9, year  : 2011, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2' ], amateur : [ 'p1' ] },
    { month :  8, year  : 2011, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2' ], amateur : [ 'p1' ] },
    { month :  7, year  : 2011, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2' ], amateur : [ 'p1' ] },
    { month :  6, year  : 2011, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2' ], amateur : [] },
    { month :  5, year  : 2011, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2' ], amateur : [] },
    { month :  4, year  : 2011, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p3' ], amateur : [] },
    { month :  3, year  : 2011, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p3' ], amateur : [ 'p1', 'p1', 'p1' ] },
    { month :  2, year  : 2011, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p3' ], amateur : [ 'p1', 'p1', 'p1' ] },
    { month :  1, year  : 2011, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p3' ], amateur : [ 'p1', 'p1', 'p1' ] },

    { month : 12, year  : 2010, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p3' ], amateur : [ 'p1', 'p1' ] },
    { month : 11, year  : 2010, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p3' ], amateur : [ 'p1', 'p1' ] },
    { month : 10, year  : 2010, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p3' ], amateur : [ 'p1', 'p1' ] },
    { month :  9, year  : 2010, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p3' ], amateur : [ 'p1' ] },
    { month :  8, year  : 2010, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p3' ], amateur : [ 'p1' ] },
    { month :  7, year  : 2010, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p3' ], amateur : [ 'p1' ] },
    { month :  6, year  : 2010, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2' ], amateur : [] },
    { month :  5, year  : 2010, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2' ], amateur : [] },
    { month :  4, year  : 2010, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1' ], amateur : [] },
    { month :  3, year  : 2010, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },
    { month :  2, year  : 2010, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },
    { month :  1, year  : 2010, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },

    { month : 12, year  : 2009, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },
    { month : 11, year  : 2009, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },
    { month : 10, year  : 2009, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },
    { month :  9, year  : 2009, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },
    { month :  8, year  : 2009, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },
    { month :  7, year  : 2009, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },
    { month :  6, year  : 2009, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },
    { month :  5, year  : 2009, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },
    { month :  4, year  : 2009, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },
    { month :  3, year  : 2009, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },
    { month :  2, year  : 2009, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },
    { month :  1, year  : 2009, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2', 'p2' ], amateur : [] },

    { month : 12, year  : 2008, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2' ], amateur : [] },
    { month : 11, year  : 2008, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2' ], amateur : [] },
    { month : 10, year  : 2008, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2', 'p2' ], amateur : [] },
    { month :  9, year  : 2008, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2' ], amateur : [] },
    { month :  8, year  : 2008, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2' ], amateur : [] },
    { month :  7, year  : 2008, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p2' ], amateur : [] },
    { month :  6, year  : 2008, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2' ], amateur : [] },
    { month :  5, year  : 2008, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2' ], amateur : [] },
    { month :  4, year  : 2008, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1' ], amateur : [] },
    { month :  3, year  : 2008, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1' ], amateur : [] },
    { month :  2, year  : 2008, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1' ], amateur : [] },
    { month :  1, year  : 2008, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1' ], amateur : [] },

    { month : 12, year  : 2007, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1' ], amateur : [] },
    { month : 11, year  : 2007, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1' ], amateur : [] },
    { month : 10, year  : 2007, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1' ], amateur : [] },
    { month :  9, year  : 2007, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1' ], amateur : [] },
    { month :  8, year  : 2007, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1' ], amateur : [] },
    { month :  7, year  : 2007, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1' ], amateur : [] },
    { month :  6, year  : 2007, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1' ], amateur : [] },
    { month :  5, year  : 2007, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p1' ], amateur : [] },
    { month :  4, year  : 2007, professional  : [ 'p0', 'p0', 'p0', 'p0', 'p0', 'p1', 'p1', 'p2', 'p7', 'p7' ], amateur : [] },
    { month :  3, year  : 2007, professional  : [ 'p0', 'p0', 'p0', 'p0', 'p0', 'p1', 'p1', 'p2', 'p7', 'p7' ], amateur : [] },
    { month :  2, year  : 2007, professional  : [ 'p0', 'p0', 'p0', 'p0', 'p0', 'p1', 'p1', 'p2', 'p7', 'p7' ], amateur : [] },
    { month :  1, year  : 2007, professional  : [ 'p0', 'p0', 'p0', 'p0', 'p0', 'p1', 'p1', 'p2', 'p7', 'p7' ], amateur : [] },

    { month : 12, year  : 2006, professional  : [ 'p0', 'p0', 'p0', 'p0', 'p0', 'p1', 'p1', 'p2', 'p7', 'p7' ], amateur : [] },
    { month : 11, year  : 2006, professional  : [ 'p0', 'p0', 'p0', 'p0', 'p0', 'p1', 'p1', 'p2', 'p7', 'p7' ], amateur : [] },
    { month : 10, year  : 2006, professional  : [ 'p0', 'p0', 'p0', 'p0', 'p0', 'p1', 'p1', 'p2', 'p7', 'p7' ], amateur : [] },
    { month :  9, year  : 2006, professional  : [ 'p0', 'p0', 'p0', 'p0', 'p0', 'p1', 'p1', 'p2', 'p7', 'p7' ], amateur : [] },
    { month :  8, year  : 2006, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p7', 'p7', 'p7' ], amateur : [] },
    { month :  7, year  : 2006, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p7', 'p7', 'p7' ], amateur : [] },
    { month :  6, year  : 2006, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p7', 'p7', 'p7' ], amateur : [] },
    { month :  5, year  : 2006, professional  : [ 'p1', 'p1', 'p1', 'p1', 'p1', 'p1', 'p2', 'p7', 'p7', 'p7' ], amateur : [] },
    { month :  4, year  : 2006, professional  : [ 'p0', 'p0', 'p0', 'p0', 'p0', 'p1', 'p1', 'p2', 'p7', 'p7' ], amateur : [] },
    { month :  3, year  : 2006, professional  : [ 'p0', 'p0', 'p0', 'p0', 'p0', 'p1', 'p1', 'p2', 'p7', 'p7' ], amateur : [] },
    { month :  2, year  : 2006, professional  : [ 'p0', 'p0', 'p0', 'p0', 'p0', 'p1', 'p1', 'p2', 'p7', 'p7' ], amateur : [] },
    { month :  1, year  : 2006, professional  : [ 'p0', 'p0', 'p0', 'p0', 'p0', 'p1', 'p1', 'p2', 'p7', 'p7' ], amateur : [] },
  ]
};

var heatmap = new ResumeHeatmap( 'ResumeHeatmap', data, '.employment-detail', '.amateur-detail.range' );
heatmap.draw();
$( window ).resize( function() { eve( 'heatmap:resize', heatmap ); } );
$( function () {
  $( '.gallery a' ).lightbox();
} );