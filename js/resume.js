$('.mugshot-pie, .resume-heatmap').on( 'mouseenter', '.dimmable-elem', function( event ) {
  var el    = $(event.target),
      skill = el.attr('data-skill');
  $('.dimmable-elem:not([data-skill=' + skill + '])').attr('class', 'dimmable-elem dim');
});

$('.mugshot-pie, .resume-heatmap').on( 'mouseleave', '.dimmable-elem', function( event ) {
  var el    = $(event.target),
      skill = el.attr('data-skill');
  $('.dimmable-elem:not([data-skill=' + skill + '])').attr('class', 'dimmable-elem');
});

$('.experience-etc').on('mouseenter', '.employment-detail', function( event ) {
  var el  = $(event.target),
      job = el.attr('data-job');
  $('.dimmable-elem').attr('class', 'dimmable-elem');
  $('.dimmable-elem:not([data-job=' + job + '])').attr('class', 'dimmable-elem dim');
});

$('.experience-etc').on('mouseleave', '.employment-detail', function( event ) {
  var el  = $(event.target),
      job = el.attr('data-job');
  $('.dimmable-elem').attr('class', 'dimmable-elem');
});
