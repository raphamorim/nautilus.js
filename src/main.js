function loadScript(config, currentQueue) {
  var origins = config.origins;
  var pathIsArray = _.isArray(config.path);
  var paths = pathIsArray ? config.path : [];
  var path = pathIsArray ? config.path[0] : config.path;
  var useOrigins = origins.length > 0 && !_.isAbsoluteURL(path);
  var url = useOrigins ? origins[0] + path : path;
  var isCSS = /\.css$/.test(url);

  var element = document.createElement(isCSS ? 'link' : 'script');
  element.type = isCSS ? 'text/css' : 'text/javascript';
  element.onload = handleLoad;
  element.onreadystatechange = handleReadyStateChange;
  element.onerror = handleError;
  if (isCSS) {
    element.rel = 'stylesheet';
    element.href = url;
  } else {
    element.async = true;
    element.src = url;
  }
  document.head.appendChild(element);

  function handleLoad() {
    queue.incr(currentQueue);
  }

  function handleReadyStateChange() {
    if (element.readyState === 'complete') {
      handleLoad();
    }
  }

  function handleError() {
    console.warn(
      '[nautilus] occurred an error while fetching',
      url
    );
    if (useOrigins) {
      loadScript({
        origins: origins.slice(1),
        path: path,
      }, currentQueue);
    }
    if (paths.length > 1) {
      loadScript({
        origins: origins,
        path: paths.slice(1),
      }, currentQueue);
    }
  }
}

function fetchBuiltIn(arr) {
  fetch.apply(this, arr)
}

function fetch() {
  var args = Array.prototype.slice.call(arguments);
  var paths = args[0];
  if (typeof(paths) === 'string') {
    paths = [paths];
  }

  if (_.isArray(args[1])) {
    args[1] = fetchBuiltIn.bind(this, args.slice(1, args.length));
  }

  var q = queue.push(paths.length, args[1]);
  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    loadScript({
      origins: uOrigins,
      path: uPaths[path] || path
    }, q);
  }
}

this.config = function (settings) {
  if (_.isArray(settings.origins)) {
    uOrigins = uOrigins.concat(settings.origins);
  }
  if (typeof(settings.paths) === 'object') {
    uPaths = _.merge(uPaths, settings.paths);
  }
};

this.getConfig = function () {
  return {
    origins: uOrigins,
    paths: uPaths
  }
};

this.resetConfig = function () {
  uOrigins = [];
  uPaths = {};
  queue.reset();
};
