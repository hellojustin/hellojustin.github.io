"use strict";

var ResumeHeatmap = function ( selector, data, emplDetailsSelector ) {
  this.selector          = selector;
  this.presetColors      = data.presetColors;
  this.skills            = data.skills;
  this.proSkillUse       = $.map( data.skillUsage, function( obj ) {
    return { month: obj.month, year: obj.year, data: obj.professional, job: obj.job };
  });

  this.el                = $( this.selector ).attr( 'id', 'ResumeHeatmap' );
  this.emplDetailsEls    = $( emplDetailsSelector );
  this.p                 = Raphael( 'ResumeHeatmap' );

  eve.on( 'heatmap:resize', this.debounce( this.resize, 200 ) );
};

ResumeHeatmap.prototype.measure = function() {
  this.totalWidth        = this.el.width()

  this.bracketWidth      = this.totalWidth * .20;
  this.bracketRangeWidth = this.bracketWidth * .10;
  this.bracketTailWidth  = this.bracketWidth * .65;
  this.bracketSpace      = this.bracketWidth * .10

  this.heatmapWidth      = this.totalWidth - this.bracketWidth * 2;
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

  this.presentDate       = { month: 11, year: 2018 };
  this.el.height( this.proHeight + this.skillsHeight );
  this.p.setSize( this.el.width(), this.el.parent().height() );

  return this.totalWidth;
};

ResumeHeatmap.prototype.draw = function() {
  if ( this.measure() > 50 ) {
    this.legend = this.drawSkills( this.skills );

    this.proSkillsHeatmap = this.drawRows( this.proSkillUse );
    this.proSkillsHeatmap.attr({ stroke : 'none' });
    this.proSkillsHeatmap.transform( "T" + this.proX + ",0" );

    this.jobBrackets = this.drawBrackets( this.emplDetailsEls );
    this.jobBrackets.attr({ 'stroke' : '#999999' });
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
    var rect = this.p.rect( this.proX,
                 this.skillHeight * skillNum,
                 this.heatmapWidth - this.cellSpace,
                 this.skillHeight ).attr({
      'fill'   : this.presetColors[ skills[skillNum].id ],
      'stroke' : 'none'
    });
    rect.node.setAttribute('class', 'dimmable-elem');
    rect.node.setAttribute('data-skill', skills[skillNum].id);

    this.p.text().attr({
      'x'           : this.proX + this.heatmapWidth / 2,
      'y'           : this.skillHeight * skillNum + this.skillsFontSize,
      'text'        : skills[skillNum].name,
      'font-size'   : this.skillsFontSize,
      'fill'        : 'rgba( 252, 255, 245, 1 )',
      'text-anchor' : 'middle'
    }).node.setAttribute('pointer-events', 'none');
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
    var cellData = data.data[colNum],
        job      = data.job;
    this.drawCell( num, colNum, cellData, job );
  }
};

ResumeHeatmap.prototype.drawCell = function( row, col, data, job ) {
  var color = this.presetColors[ data ],
      x     = col * ( this.cellHeight + this.cellSpace ),
      y     = row * ( this.cellWidth  + this.cellSpace ) + this.skillsHeight + this.cellSpace,
      rect  = this.p.rect( x, y, this.cellWidth, this.cellHeight ).attr({fill : color});

  rect.node.setAttribute('class', 'dimmable-elem');
  rect.node.setAttribute('data-skill', data);
  rect.node.setAttribute('data-job', job);
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
      parentY  = $el.parent().position().top,
      elY      = $el.position().top - parentY + $el.height()/2,
      topY, height, path;

  if ( endRow === 0 ) {
    topY   = this.cellHeight/2 + this.skillsHeight;
    height = ( startRow - endRow ) * ( this.cellHeight + this.cellSpace );
  } else {
    topY   = endRow * ( this.cellHeight + this.cellSpace ) + this.cellHeight/2 + this.skillsHeight;
    height = ( startRow - endRow ) * ( this.cellHeight + this.cellSpace );
  }

  path = this.p.path().attr({
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

  // if the element is to the right of the heatmap...
  if ($el.position().left > this.el.position().left ) {
    var xTransform = this.proX + this.heatmapWidth + this.bracketSpace;
    path.transform( "T" + xTransform + ",0, S-1,1" );
  }
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

var heatmap = new ResumeHeatmap( '.resume-heatmap', data, '.desktop .employment-detail' );
heatmap.draw();
$( window ).resize( function() { eve( 'heatmap:resize', heatmap ); } );
$( function () {
  $( '.gallery a' ).lightbox();
} );
