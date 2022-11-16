var flags = {
  scrolled: false,
  resized: false
}
var timers = {
  scroll: -1,
  resize: -1,
  delta: 16.67 //  (1/60fps) / 1000ms = 16.67ms per frame
}
var windowValues = {
  width: 0,
  height: 0,
  scrollX: 0,
  scrollY: 0
}

/* set initial values */
windowValues.width = window.innerWidth;
windowValues.height = window.innerHeight;
windowValues.scrollX = window.pageXOffset;
windowValues.scrollY = window.pageYOffset;

/* prepare scroll function */
window.addEventListener('scroll', function(){
  flags.scrolled = true;
  windowValues.scrollX = window.pageXOffset;
  windowValues.scrollY = window.pageYOffset;
  if (timers.scroll !== -1) clearTimeout(timers.scroll);
  timers.scroll = window.setTimeout(function(){
    flags.scrolled = false;
  }, timers.delta);
});

/* prepare resize function */
window.addEventListener('resize', function(){
  flags.resized = true;
  windowValues.width = window.innerWidth;
  windowValues.height = window.innerHeight;
  if (timers.resize !== -1) clearTimeout(timers.resize);
  timers.resize = window.setTimeout(function(){
    flags.resized = false;
  }, timers.delta);
});

var requestScrollAnimation = function(callback, delay) {
  delay = delay || timers.delta;
  return setInterval(function(){
    if (flags.scrolled) {
      window.requestAnimationFrame(callback);
    }
  }, delay);
}

var requestResizeAnimation = function(callback, delay) {
  delay = delay || timers.delta;
  return setInterval(function(){
    if (flags.resized) {
      window.requestAnimationFrame(callback);
    }
  }, delay);
}