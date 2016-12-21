const p5 = function () {};

p5.Vector = function() {
  var x,y,z;
  // This is how it comes in with createVector()
  if(arguments[0] instanceof p5) {
    // save reference to p5 if passed in
    this.p5 = arguments[0];
    x  = arguments[1][0] || 0;
    y  = arguments[1][1] || 0;
    z  = arguments[1][2] || 0;
  // This is what we'll get with new p5.Vector()
  } else {
    x = arguments[0] || 0;
    y = arguments[1] || 0;
    z = arguments[2] || 0;
  }
  /**
   * The x component of the vector
   * @property x
   * @type {Number}
   */
  this.x = x;
  /**
   * The y component of the vector
   * @property y
   * @type {Number}
   */
  this.y = y;
  /**
   * The z component of the vector
   * @property z
   * @type {Number}
   */
  this.z = z;
};

p5.Vector.prototype.cross = function (v) {
  var x = this.y * v.z - this.z * v.y;
  var y = this.z * v.x - this.x * v.z;
  var z = this.x * v.y - this.y * v.x;
  if (this.p5) {
    return new p5.Vector(this.p5,[x,y,z]);
  } else {
    return new p5.Vector(x,y,z);
  }
};

p5.Vector.prototype.mag = function () {
  return Math.sqrt(this.magSq());
};

p5.Vector.prototype.magSq = function () {
  var x = this.x, y = this.y, z = this.z;
  return (x * x + y * y + z * z);
};

p5.Vector.prototype.normalize = function () {
  return this.mag() === 0 ? this : this.div(this.mag());
};

p5.Vector.prototype.sub = function (x, y, z) {
  if (x instanceof p5.Vector) {
    this.x -= x.x || 0;
    this.y -= x.y || 0;
    this.z -= x.z || 0;
    return this;
  }
  if (x instanceof Array) {
    this.x -= x[0] || 0;
    this.y -= x[1] || 0;
    this.z -= x[2] || 0;
    return this;
  }
  this.x -= x || 0;
  this.y -= y || 0;
  this.z -= z || 0;
  return this;
};

p5.Vector.prototype.add = function (x, y, z) {
  if (x instanceof p5.Vector) {
    this.x += x.x || 0;
    this.y += x.y || 0;
    this.z += x.z || 0;
    return this;
  }
  if (x instanceof Array) {
    this.x += x[0] || 0;
    this.y += x[1] || 0;
    this.z += x[2] || 0;
    return this;
  }
  this.x += x || 0;
  this.y += y || 0;
  this.z += z || 0;
  return this;
};

p5.Vector.prototype.copy = function () {
  if (this.p5) {
    return new p5.Vector(this.p5,[this.x, this.y, this.z]);
  } else {
    return new p5.Vector(this.x,this.y,this.z);
  }
};

p5.Vector.prototype.mult = function (n) {
  this.x *= n || 0;
  this.y *= n || 0;
  this.z *= n || 0;
  return this;
};

p5.Vector.prototype.div = function (n) {
  this.x /= n;
  this.y /= n;
  this.z /= n;
  return this;
};

p5.Vector.prototype.dot = function (x, y, z) {
  if (x instanceof p5.Vector) {
    return this.dot(x.x, x.y, x.z);
  }
  return this.x * (x || 0) +
         this.y * (y || 0) +
         this.z * (z || 0);
};

p5.Vector.cross = p5.Vector.prototype.cross;
p5.Vector.mag = p5.Vector.prototype.mag;
p5.Vector.magSq = p5.Vector.prototype.magSq;
p5.Vector.sub = p5.Vector.prototype.sub;
p5.Vector.mult = p5.Vector.prototype.mult;
p5.Vector.add = p5.Vector.prototype.add;
p5.Vector.div = p5.Vector.prototype.div;
p5.Vector.dot = p5.Vector.prototype.dot;

p5.Geometry = function (detailX, detailY, callback) {
  //an array containing every vertex
  //@type [p5.Vector]
  this.vertices = [];
  //an array containing 1 normal per vertex
  //@type [p5.Vector]
  //[p5.Vector, p5.Vector, p5.Vector,p5.Vector, p5.Vector, p5.Vector,...]
  this.vertexNormals = [];
  //an array containing each three vertex indices that form a face
  //[[0, 1, 2], [2, 1, 3], ...]
  this.faces = [];
  //a 2D array containing uvs for every vertex
  //[[0.0,0.0],[1.0,0.0], ...]
  this.uvs = [];
  this.detailX = (detailX !== undefined) ? detailX: 1;
  this.detailY = (detailY !== undefined) ? detailY: 1;
  if(callback instanceof Function){
    callback.call(this);
  }
  return this;
};

p5.Geometry.prototype.computeFaces = function(){
  var sliceCount = this.detailX + 1;
  var a, b, c, d;
  for (var i = 0; i < this.detailY; i++){
    for (var j = 0; j < this.detailX; j++){
      a = i * sliceCount + j;// + offset;
      b = i * sliceCount + j + 1;// + offset;
      c = (i + 1)* sliceCount + j + 1;// + offset;
      d = (i + 1)* sliceCount + j;// + offset;
      this.faces.push([a, b, d]);
      this.faces.push([d, b, c]);
    }
  }
  return this;
  };

p5.Geometry.prototype._getFaceNormal = function(faceId,vertId){
  var face = this.faces[faceId];
  var vA = this.vertices[face[vertId%3]];
  var vB = this.vertices[face[(vertId+1)%3]];
  var vC = this.vertices[face[(vertId+2)%3]];

  var n = p5.Vector.cross(
    p5.Vector.sub(vB,vA),
    p5.Vector.sub(vC,vA));
  var sinAlpha = p5.Vector.mag(n) /
  (p5.Vector.mag(p5.Vector.sub(vB,vA))*
    p5.Vector.mag(p5.Vector.sub(vC,vA)));

  n = n.normalize();
  return n.mult(Math.asin(sinAlpha));
};

p5.Geometry.prototype.computeNormals = function (){
  for(var v=0; v < this.vertices.length; v++){
    var normal = new p5.Vector();
    for(var i=0; i < this.faces.length; i++){
      //if our face contains a given vertex
      //calculate an average of the normals
      //of the triangles adjacent to that vertex
      if(this.faces[i][0] === v ||
        this.faces[i][1] === v ||
        this.faces[i][2] === v)
      {
        normal = normal.add(this._getFaceNormal(i, v));
      }
    }
    normal = normal.normalize();
    this.vertexNormals.push(normal);
  }
  return this;
};

p5.Geometry.prototype.averageNormals = function() {
  for(var i = 0; i <= this.detailY; i++){
    var offset = this.detailX + 1;
    var temp = p5.Vector
      .add(this.vertexNormals[i*offset],
        this.vertexNormals[i*offset + this.detailX]);
    temp = p5.Vector.div(temp, 2);
    this.vertexNormals[i*offset] = temp;
    this.vertexNormals[i*offset + this.detailX] = temp;
  }
  return this;
};
