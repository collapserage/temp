define(['es6!elementCache'], elementCache => {
  return new class Constants {
    constructor() {
      let storage = JSON.parse(localStorage.getItem('constants')) || {};

      this.DETAIL_X = storage.DETAIL_X || 10;
      this.DETAIL_Y = storage.DETAIL_Y || 10;
      this.RADIUS = storage.RADIUS || 100;
      this.TUBE_RADIUS = storage.TUBE_RADIUS || 30;
      this.AUTOROTATE = storage.AUTOROTATE || 1;
      this.POLYGON_COLOR = storage.POLYGON_COLOR || 'rgba(0, 150, 255, 0.3)';
      this.EDGE_COLOR = storage.EDGE_COLOR || 'rgba(0, 0, 0, 0.3)';
      this.BACKFACE_CULLING = storage.BACKFACE_CULLING || false;

      elementCache.get('polygons-x').value = this.DETAIL_X;
      elementCache.get('polygons-y').value = this.DETAIL_Y;
      elementCache.get('torus-radius').value = this.RADIUS;
      elementCache.get('tube-radius').value = this.TUBE_RADIUS;
      elementCache.get('autorotate').value = this.AUTOROTATE;
      elementCache.get('polygon-color').value = this.POLYGON_COLOR;
      elementCache.get('edge-color').value = this.EDGE_COLOR;
      elementCache.get('backface-culling').checked = this.BACKFACE_CULLING;
    }

    set(constant, value) {
      this[constant] = value;
      localStorage.setItem('constants', JSON.stringify(this));
    }
  };
});
