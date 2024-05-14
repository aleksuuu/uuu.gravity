// https://physics.stackexchange.com/a/333436

outlets = 5;

var _g = 9.8; // m/s/s
var _h0 = 5; // init height (m)
var tmax = 10;
var _hstop = 0.001; // stop when bounce is less than 1cm (also used to detect collision)
var _cor = 0.75; // 0 to 1, coefficient of restitution
var _max_bounces = 10;
var _sample_rate = 44100;
var tau = 0.001; // contact time for bounce
//var dt = 0.001; // s, time step

// var plot_period = 10;
var d_plot = 0.01; // s, plotting step

function bang() {
  //outlet(0, "myvalue", "is", myval);
  calculate();
}

function g(v) {
  _g = v;
  calculate();
}

function h0(v) {
  _h0 = v;
  calculate();
}

function max_time_in_seconds(v) {
  tmax = v;
  calculate();
}

function max_bounces(v) {
  _max_bounces = v;
  calculate();
}

function hstop(v) {
  _hstop = v;
  calculate();
}

function cor(v) {
  // coefficient of restitution
  _cor = v;
  calculate();
}

function sample_rate(v) {
  _sample_rate = v;
  calculate();
}

function calculate() {
  var dt = 1 / _sample_rate;
  var plot_period = d_plot / dt;
  var v = 0; // m/s, current velocity
  var t = 0; // s, starting time

  var t_samples = [];
  var max_heights_normalized = [];
  var heights = [];

  var hmax = _h0; // keep track of the max height
  var hmaxlast = hmax;
  var h = _h0;
  var freefall = true; // 1 = free fall, 0 = in contact
  var last_freefall = true;
  var tlast = -Math.sqrt((2 * _h0) / _g); // time we would have launched to get to _h0 at t=0
  var vmax = Math.sqrt(2 * hmax * _g);
  var num_bounces = 0;
  var plot = 0;
  while (num_bounces < _max_bounces && t < tmax && hmax > _hstop) {
    if (!(plot % plot_period)) {
      heights.push(h);
    }
    plot++;
    last_freefall = freefall;
    hmaxlast = hmax;
    if (freefall) {
      var hnew = h + v * dt - 0.5 * _g * dt * dt;
      if (hnew < 0) {
        // hit the ground
        //seconds.push(t);
        t_samples.push(Math.round(t * _sample_rate));
        max_heights_normalized.push(hmax / _h0);
        t = tlast + 2 * Math.sqrt((2 * hmax) / _g);
        freefall = false;
        tlast = t + tau;
        h = 0;
        num_bounces++;
      } else {
        t = t + dt;
        v = v - _g * dt;
        h = hnew;
      }
    } else {
      // bouncing back
      t = t + tau;
      vmax = vmax * _cor;
      v = vmax;
      freefall = true;
      h = 0;
    }
    hmax = (0.5 * vmax * vmax) / _g;
  }
  outlet(1, max_heights_normalized);
  outlet(0, t_samples);

  var plot_tmax = 10;
  if (t < 0.25) {
    plot_tmax = 0.25;
  } else if (t < 0.5) {
    plot_tmax = 0.5;
  } else if (t < 1) {
    plot_tmax = 1;
  } else if (t < 2) {
    plot_tmax = 2;
  } else if (t < 5) {
    plot_tmax = 5;
  }
  var numpoints = plot_tmax / d_plot;

  // var numpoints = 0.5 / d_plot;
  outlet(4, plot_tmax);
  outlet(3, "numpoints 1");
  outlet(3, 1);
  outlet(3, "numpoints " + numpoints);
  outlet(3, "definerange 0 " + _h0 * 100);
  outlet(2, heights);
}

function includes(arr, e) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == e) {
      return true;
    }
  }
  return false;
}
