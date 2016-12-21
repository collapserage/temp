define(require => {
  return new class ElementCache {
    constructor() {
      let $ = document.querySelector.bind(document);

      this.cache = {
        'canvas': $('canvas'),
        'camera': $('.camera'),
        'camera-canvas': $('.camera-canvas'),
        'frame-time': $('.frame-time'),
        'torus-radius': $('.torus-radius'),
        'tube-radius': $('.tube-radius'),
        'polygons-x': $('.polygons-x'),
        'polygons-y': $('.polygons-y'),
        'polygon-color': $('.polygon-color'),
        'edge-color': $('.edge-color'),
        'autorotate': $('.autorotate'),
        'translate-x': $('.translate-x'),
        'translate-y': $('.translate-y'),
        'translate-z': $('.translate-z'),
        'scale-x': $('.scale-x'),
        'scale-y': $('.scale-y'),
        'scale-z': $('.scale-z'),
        'backface-culling': $('.backface-culling'),
        'hamburger': $('.hamburger'),
        'projections': $('.projections')
      }
    }

    get(selector) {
      return this.cache[selector];
    }

    listen(selector, event, callback) {
      this.get(selector).addEventListener(event, callback)
    }

    onClick(selector, callback) {
      this.get(selector).addEventListener('click', callback)
    }

    onChange(selector, callback) {
      this.get(selector).addEventListener('change', callback);
      this.get(selector).addEventListener('keyup', callback);
    }
  }
});
