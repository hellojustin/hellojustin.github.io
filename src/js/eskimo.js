( function( M ) {

  function Eskimo( cartesianCenter, radius, origin, direction ) {
    this.center      = cartesianCenter;
    this.radius      = radius;
    this.origin      = origin || 0.0;
    this.direction   = direction || 1;
    this.namedPoints = {};
  }

  Eskimo.getDegrees = function( radians ) {
    return radians * 180 / M.PI;
  }

  Eskimo.getQuadrant = function( theta ) {
    var q = theta / ( M.PI / 2 );
    q = ( theta >= 0 ) ? M.floor( q ) : M.ceil( q );
    return q % 4
  }

  Eskimo.getQuadrantAngle = function( quadrant ) {
    return ( M.PI / 2 ) * ( quadrant % 4 )
  }

  Eskimo.getRadians = function( degrees ) {
    return degrees * M.PI / 180;
  }

  Eskimo.prototype.cartesian = function( theta, radius ) {
    var adjTheta      = this.origin + theta * this.direction,
        radius        = radius || this.radius,
        quadrant      = Eskimo.getQuadrant( adjTheta ),
        quadrantAngle = Eskimo.getQuadrantAngle( quadrant ),
        localTheta    = adjTheta - quadrantAngle,
        xOffset       = 0.0,
        yOffset       = 0.0;

    if ( quadrant % 2 == 0 ) {
      xOffset = M.cos( localTheta ) * radius;
      yOffset = M.sin( localTheta ) * radius;
    } else {
      xOffset = M.sin( localTheta ) * radius;
      yOffset = M.cos( localTheta ) * radius;
    }

    if ( quadrant == 1 || quadrant == 2 ) { xOffset *= -1 }
    if ( quadrant == 0 || quadrant == 1 ) { yOffset *= -1 }

    return {
      x : this.center.x + xOffset,
      y : this.center.y + yOffset,
      t : theta,
      r : radius
    }
  }

  Eskimo.prototype.point = function( name, theta, radius ) {
    if ( theta ) { this.namedPoints[ name ] = this.cartesian( theta, radius ) }
    return this.namedPoints[ name ];
  }

  window.Eskimo = Eskimo;

  return Eskimo;

}( Math ) );
