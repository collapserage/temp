define(function (require) {
  const constants = require('constants');
  const elementCache = require('elementCache');
  const Vertex2D = require('vertex2d');

  return new class Engine {
    rotate(M, center, theta, phi) {
      var ct = Math.cos(theta);
      var st = Math.sin(theta);
      var cp = Math.cos(phi);
      var sp = Math.sin(phi);

      var x = M.x - center.x;
      var y = M.y - center.y;
      var z = M.z - center.z;

      M.x = ct * x - st * cp * y + st * sp * z + center.x;
      M.y = st * x + ct * cp * y - ct * sp * z + center.y;
      M.z = sp * y + cp * z + center.z;
    }

    scale(M, modifier) {
      M.x *= modifier.x || 1;
      M.y *= modifier.y || 1;
      M.z *= modifier.z || 1;
    }

    translate(M, modifier) {
      M.x += modifier.x || 0;
      M.y += modifier.y || 0;
      M.z += modifier.z || 0;
    }

    project(M) {
      return new Vertex2D(M.x, M.z);
    }

    isBackface(face) {
      var ax = face[2].z - face[0].z;
      var ay = face[2].x - face[0].x;
      var bx = face[2].z - face[1].z;
      var by = face[2].x - face[1].x;
      var cz = ax * by - ay * bx;
      return cz > 0;
    };

    render(objects, ctx, dx, dy) {
      // frontMatrix = new Float32Array([
      //   0, 0, 0, 0,
      //   0, 1, 0, 0,
      //   0, 0, 1, 0,
      //   0, 0, 0, 1
      // ]);
      //
      // mat4.multiplyScalar(frontMatrix, 3);

      var time = Date.now();

      ctx.clearRect(0, 0, 2*dx, 2*dy);

      objects.forEach(object => {
        //object.faces = object.faces.sort((a, b) => a[0].y < b[0].y || a[1].y < b[1].y || a[2].y < b[2].y);

        object.faces.forEach(face => {
          if (constants.BACKFACE_CULLING && this.isBackface(face))
            return;

          let projectedFace = this.project(face[0]);
          ctx.beginPath();
          ctx.moveTo(projectedFace.x + dx, projectedFace.y + dy);

          face.forEach(vertice => {
            let projectedFace = this.project(vertice);
            ctx.lineTo(projectedFace.x + dx, projectedFace.y + dy);
          })

          ctx.closePath();
          ctx.stroke();
          ctx.fill();
        })
      })

      elementCache.get('frame-time').textContent = Date.now() - time;
    }
  }
});
