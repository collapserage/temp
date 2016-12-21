define(['es6!constants', 'es6!vertex'], function (constants, vertex) {
  return new class Torus {
    init(center, side) {
      this.calculateGeometry(function () {
        for (var i = 0; i <= constants.DETAIL_Y; i++) {
          var phi = 2 * Math.PI * i / constants.DETAIL_Y;
          var phiNext = constants.RADIUS + constants.TUBE_RADIUS * Math.cos(phi);

          for (var j = 0; j <= constants.DETAIL_X; j++) {
            var theta = 2 * Math.PI * j / constants.DETAIL_X;

            this.vertices.push(new p5.Vector(
              center.x + phiNext * Math.cos(theta),
              center.y + phiNext * Math.sin(theta),
              constants.TUBE_RADIUS * Math.sin(phi)
            ));
          }
        }
      });
    }

    calculateGeometry(mesh) {
      var callback = typeof mesh === 'function' ? mesh : function () {this.vertices = mesh};
      var torusGeom = new p5.Geometry(constants.DETAIL_X, constants.DETAIL_Y, callback);
      torusGeom.computeFaces().computeNormals();

      if (typeof mesh === 'function')
        this.initial = torusGeom;

      this.vertices = torusGeom.vertices.map(vertex => new Vertex(vertex.x, vertex.y, vertex.z));
      this.faces = torusGeom.faces.map(face => [
        this.vertices[face[0]],
        this.vertices[face[1]],
        this.vertices[face[2]]
      ]);
    }
  }
});
