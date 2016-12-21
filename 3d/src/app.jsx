define(['elementCache', 'constants', 'helpers', 'torus', 'engine', 'vertex'], function (elementCache, constants, helpers, torus, engine, vertex) {
  return new class App {
    constructor() {
      this.canvas = cache.get('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.strokeStyle = constants.EDGE_COLOR;
      this.ctx.fillStyle = constants.POLYGON_COLOR;
      this.dx = this.canvas.width / 2;
      this.dy = this.canvas.height / 2;
      this.center = new Vertex(0, 0, 0);

      torus.init(this.center, this.dy);
      this.objects = [torus];

      engine.render(this.objects, this.ctx, this.dx, this.dy);

      this.mousedown = {'left': false, 'right': false};
      this.mx = 0;
      this.my = 0;

      if (constants.AUTOROTATE > 1)
        this.autorotate_timeout = setTimeout(() => this.autorotate(), 16);

      this.attachListeners();
    }

    initMove(e) {
      clearTimeout(this.autorotate_timeout);

      this.mousedown = {
        [e.which === 3 ? 'right' : 'left']: true
      };

      this.mx = e.clientX;
      this.my = e.clientY;
    }

    move(e) {
      if (this.mousedown.left) {
        var theta = (e.clientX - this.mx) * Math.PI / 360;
        var phi = (e.clientY - this.my) * Math.PI / 180;

        for (var i = 0; i < (constants.DETAIL_X + 1) * (constants.DETAIL_Y + 1); ++i)
          engine.rotate(torus.vertices[i], this.center, theta, phi);

        torus.calculateGeometry(torus.vertices);

        this.mx = e.clientX;
        this.my = e.clientY;

        engine.render(this.objects, this.ctx, this.dx, this.dy);
      }

      if (this.mousedown.right) {
        for (var i = 0; i < (constants.DETAIL_X + 1) * (constants.DETAIL_Y + 1); ++i)
          engine.translate(torus.vertices[i], {
            x: e.clientX - this.mx,
            z: e.clientY - this.my,
          });

        torus.calculateGeometry(torus.vertices);

        this.mx = e.clientX;
        this.my = e.clientY;

        engine.render(this.objects, this.ctx, this.dx, this.dy);
      }
    }

    stopMove(e) {
      this.mousedown = {
        [e.which === 3 ? 'right' : 'left']: false
      };

      if (constants.AUTOROTATE > 1)
        this.autorotate_timeout = setTimeout(this.autorotate.bind(this), 1000);
    }

    autorotate() {
      for (var i = 0; i < (constants.DETAIL_X + 1) * (constants.DETAIL_Y + 1); ++i)
        engine.rotate(torus.vertices[i], this.center, -Math.PI / 720 * constants.AUTOROTATE, Math.PI / 720 * constants.AUTOROTATE);

      torus.calculateGeometry(torus.vertices);
      engine.render(this.objects, this.ctx, this.dx, this.dy);

      clearTimeout(this.autorotate_timeout);
      this.autorotate_timeout = setTimeout(this.autorotate.bind(this), 20);
    }

    attachListeners() {
      document.addEventListener('mousemove', this.move.bind(this));
      document.addEventListener('mouseup', this.stopMove.bind(this));
      this.canvas.addEventListener('mousedown', this.initMove.bind(this));
      this.canvas.addEventListener('contextmenu', e => e.preventDefault());
      this.canvas.addEventListener('wheel', e => {
        let diff = 1 + -e.deltaY / 500;
        this.applyScale(e, {
          x: diff,
          y: diff,
          z: diff
        })
      });

      cache.onChange('torus-radius', e => this.applyAndRedraw('RADIUS', e.target.value))
      cache.onChange('tube-radius', e => this.applyAndRedraw('TUBE_RADIUS', e.target.value))
      cache.onChange('polygons-x', e => this.applyAndRedraw('DETAIL_X', e.target.value))
      cache.onChange('polygons-y', e => this.applyAndRedraw('DETAIL_Y', e.target.value))
      cache.onChange('polygon-color', e => this.applyColor('POLYGON_COLOR', e.target.value))
      cache.onChange('edge-color', e => this.applyColor('EDGE_COLOR', e.target.value))
      cache.onChange('autorotate', e => this.autorotateInit('AUTOROTATE', e.target.value))

      cache.onChange('translate-x', e => this.applyTranslate(e, {x: parseInt(e.target.value)}))
      cache.onChange('translate-y', e => this.applyTranslate(e, {y: parseInt(e.target.value)}))
      cache.onChange('translate-z', e => this.applyTranslate(e, {z: parseInt(e.target.value)}))

      cache.onChange('scale-x', e => this.applyScale(e, {x: parseFloat(e.target.value)}))
      cache.onChange('scale-y', e => this.applyScale(e, {y: parseFloat(e.target.value)}))
      cache.onChange('scale-z', e => this.applyScale(e, {z: parseFloat(e.target.value)}))

      cache.onChange('backface-culling', this.setupCulling.bind(this));

      cache.onClick('hamburger', this.toggleMenu.bind(this))
      cache.onClick('projections', this.setupProjections.bind(this));
    }

    toggleMenu() {
      document.body.classList.toggle('menu-shown');
    }

    setupCulling(e) {
      constants.set('BACKFACE_CULLING', e.target.checked);
      engine.render(this.objects, this.ctx, this.dx, this.dy);
    }

    setupProjections() {
      clearTimeout(this.autorotate_timeout);
      cache.get('canvas').classList.toggle('faded');
      cache.get('camera').classList.toggle('faded');
    }

    autorotateInit(variable, speed) {
      clearTimeout(this.autorotate_timeout);
      constants.set(variable, parseInt(speed));
      this.autorotate_timeout = setTimeout(() => this.autorotate(), 16);
    }

    applyColor(variable, value) {
      var color = helpers.hexToRGB(value, 0.3);
      constants.set(variable, color);
      this.ctx[variable === 'POLYGON_COLOR' ? 'fillStyle' : 'strokeStyle'] = color;
    }

    applyAndRedraw(variable, value) {
      constants.set(variable, parseInt(value));
      torus.init(this.center, this.dy);
      engine.render(this.objects, this.ctx, this.dx, this.dy);
    }

    applyTranslate(event, multiplier) {
      if (event.keyCode === 13) {
        torus.vertices.forEach(vertice => {
          engine.translate(vertice, {
            x: multiplier.x || 0,
            y: multiplier.y || 0,
            z: multiplier.z || 0
          });
        })

        torus.calculateGeometry(torus.vertices);
        engine.render(this.objects, this.ctx, this.dx, this.dy);

        event.target.value = '';
      }
    }

    applyScale(event, multiplier) {
      if (event.keyCode === 13 || event.type === 'wheel') {
        torus.vertices.forEach(vertice => {
          engine.scale(vertice, {
            x: multiplier.x || 1,
            y: multiplier.y || 1,
            z: multiplier.z || 1
          });
        })

        engine.render(this.objects, this.ctx, this.dx, this.dy);
        event.target.value = '';
      }
    }

    render() {
      <div class="hamburger"><i class="fa fa-bars"></i></div>
      <div class="projections"><i class="fa fa-camera"></i></div>

      <nav>
        <h1>Controls</h1>

        <strong>General</strong>
        <section>
          <div>Torus radius (10-300): <input type="range" min="10" max="300" class="torus-radius"></div>
          <div>Tube radius (10-300): <input type="range" min="10" max="300" class="tube-radius"></div>
          <div>Polygons on x (10-50): <input type="range" min="10" max="50" class="polygons-x"></div>
          <div>Polygons on y (10-50): <input type="range" min="10" max="50" class="polygons-y"></div>
          <div>Autorotate speed: <input type="range" min="0" max="20" class="autorotate"></div>
          <div>Color (polygon): <input type="color" value="#0096FF" class="polygon-color"></div>
          <div>Color (edge): <input type="color" value="#000000" class="edge-color"></div>
        </section>

        <strong>Matrices</strong>
        <section>
          Translating:
          <input type="text" placeholder="x" class="translate-x">
          <input type="text" placeholder="y" class="translate-y">
          <input type="text" placeholder="z" class="translate-z">
        </section>

        <section>
          Scaling:
          <input type="text" placeholder="x" class="scale-x">
          <input type="text" placeholder="y" class="scale-y">
          <input type="text" placeholder="z" class="scale-z">
        </section>

        <section>
          Rotation:
          <input type="text" placeholder="x">
          <input type="text" placeholder="y">
          <input type="text" placeholder="z">
        </section>

        <strong>Backface culling</strong>
        <section>
          Hide invisible lines: <input type="checkbox" class="backface-culling">
        </section>

        <strong>Statistics</strong>
        <section>
          Avg frame time: <span class="frame-time"></span> ms
        </section>
      </nav>

      <main>
        <canvas height="800" width="800"></canvas>
        <section class="camera">
          <canvas height="800" width="800"></canvas>
        </section>
      </main>
    }
  }
});
