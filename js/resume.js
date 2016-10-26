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
