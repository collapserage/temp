requirejs.config({
  paths: {
    'react': '../vendor/react.min',
    'reactDOM': '../vendor/react-dom.min'
  }
});

define(['react', 'reactDOM', 'app'], function (React, ReactDOM, app) {
  return ReactDOM.render(React.createElement(app), document.querySelector('app'));
});
