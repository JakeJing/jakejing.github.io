function simulate_data(mu, sd, n) {
  simdata = d3.range(n).map(function () {
    return d3.randomNormal(mu, sd)();
  });
  return simdata;
}
var form = document.querySelector("form");
form.addEventListener("submit", function () {
  // remove event as well
  if (localStorage.getItem("simvalue")) {
    localStorage.removeItem("simvalue");
  }
  if (localStorage.getItem("sim-mu")) {
    localStorage.removeItem("sim-mu");
  }
  if (localStorage.getItem("sim-sd")) {
    localStorage.removeItem("sim-sd");
  }
  var mu = parseFloat(form.elements.mu.value);
  var sd = parseFloat(form.elements.sd.value);
  var n = parseInt(form.elements.n.value);
  simdata = simulate_data(mu, sd, n);
  localStorage.setItem("simvalue", JSON.stringify(simdata));
  localStorage.setItem("sim-mu", JSON.stringify(mu));
  localStorage.setItem("sim-sd", JSON.stringify(sd));
  // event.preventDefault(); problematic, remove this line
});

if (localStorage.getItem("simvalue")) {
  var data = JSON.parse(localStorage.getItem("simvalue"));
} else {
  // data is not available, make a placeholder and generate a warning!
  console.error("Pls simulate some data!");
  var data = Array(1);
}

var params = {
  mu: { type: "real" },
  sd: { type: "real", lower: 0 },
};

var log_post = function (state, data) {
  var log_post = 0;
  // Priors
  log_post += ld.norm(state.mu, 0, 100);
  log_post += ld.unif(state.sd, 0, 100);
  // Likelihood
  for (var i = 0; i < data.length; i++) {
    log_post += ld.norm(data[i], state.mu, state.sd);
  }
  return log_post;
};

// Initializing the sampler and generate a sample of size 1000
var sampler = new mcmc.AmwgSampler(params, log_post, data);
sampler.burn(1000);
var samples = sampler.sample(1);

// Below is just the code to run the sampler and
// to plot the samples. It's somewhat of a hack...

// Setting up the plots
var plot_margins = { l: 40, r: 10, b: 40, t: 40, pad: 4 };

var param_names = Object.keys(params);
var params_to_plot = Object.keys(params);

for (var i = 0; i < params_to_plot.length; i++) {
  var param = params_to_plot[i];
  $("div#mcmc_plots_div").append(
    "<div>" +
      '<div id = "' +
      param +
      "_trace_div" +
      '" style="width:350px;height:250px;display: inline-block;"></div>' +
      '<div id = "' +
      param +
      "_hist_div" +
      '" style="width:350px;height:250px;display: inline-block;"></div>' +
      "</div>"
  );
  Plotly.plot($("div#" + param + "_trace_div")[0], [{ y: samples[param] }], {
    margin: plot_margins,
    title: "Traceplot of " + param,
  });
  // var layout = {
  //   shapes: [
  //     {
  //       type: "line",
  //       x0: 3,
  //       y0: 0,
  //       x1: 3,
  //       y1: 1,
  //       line: {
  //         color: "red",
  //         width: 2,
  //         dash: "dashdot",
  //       },
  //     },
  //   ],
  // };
  Plotly.plot(
    $("div#" + param + "_hist_div")[0],
    [{ x: samples[param], type: "histogram" }],
    // layout,
    { margin: plot_margins, title: "Posterior of " + param }
  );
}

var update_trace_plots = function () {
  for (var i = 0; i < params_to_plot.length; i++) {
    var param = params_to_plot[i];
    Plotly.restyle($("div#" + param + "_trace_div")[0], {
      y: [samples[param]],
    });
  }
};

var update_histograms = function () {
  for (var i = 0; i < params_to_plot.length; i++) {
    var param = params_to_plot[i];
    Plotly.restyle($("div#" + param + "_hist_div")[0], {
      x: [samples[param]],
      xbins: {},
    });
    var y_max = parseFloat(
      document.getElementById(param + "_hist_div")["layout"]["yaxis"][
        "range"
      ][1]
    );
    // if original sim params available, add vertical lines
    if (JSON.parse(localStorage.getItem("sim-" + param))) {
      // console.log("check whether params available!");
      Plotly.relayout($("div#" + param + "_hist_div")[0], {
        shapes: [
          {
            type: "line",
            x0: JSON.parse(localStorage.getItem("sim-" + param)),
            y0: 0,
            x1: JSON.parse(localStorage.getItem("sim-" + param)),
            y1: y_max,
            line: {
              color: "red",
              width: 4,
              dash: "dash",
            },
          },
        ],
      });
    } else {
      // no sim params available, change it layout as the default
      Plotly.relayout($("div#" + param + "_hist_div")[0], {
        yaxis: { range: [0, 1] },
        shapes: null,
      });
    }
  }
};

// Below are the functions that enables starting and stopping the
// sampling using the buttons

var clear_samples = function () {
  samples = sampler.sample(1);
  if (localStorage.getItem("simvalue")) {
    localStorage.removeItem("simvalue");
    // console.log("simvalue deleted from local storage");
  }
  if (localStorage.getItem("sim-mu")) {
    localStorage.removeItem("sim-mu");
    // console.log("simvalue deleted from local storage");
  }
  if (localStorage.getItem("sim-sd")) {
    localStorage.removeItem("sim-sd");
    // console.log("simvalue deleted from local storage");
  }
  update_trace_plots();
  update_histograms(); // replace this with the following code
};

var sample_loop_timeout_id;
var sample_loop = function () {
  var n_samples = Math.min(250, Math.ceil(samples[param_names[0]].length / 10));
  var more_samples = sampler.sample(n_samples);
  for (var i = 0; i < param_names.length; i++) {
    var param = param_names[i];
    Array.prototype.push.apply(samples[param], more_samples[param]);
  }
  update_trace_plots();
  sample_loop_timeout_id = setTimeout(sample_loop, 1);
};

var stop_sample_loop = function () {
  clearTimeout(sample_loop_timeout_id);
  update_trace_plots();
  update_histograms();
  // for (var i = 0; i < params_to_plot.length; i++) {
  //   var param = params_to_plot[i];
  //   Plotly.restyle($("div#" + param + "_hist_div")[0], {
  //     x: [samples[param]],
  //     xbins: {},
  //   });
  //   Plotly.relayout($("div#" + param + "_hist_div")[0], {
  //     yaxis: { range: [0, 1] },
  //     shapes: null,
  //   });
  // }
};

// clear_samples(); // remove it, otherwise, it will clear whenever load the script
