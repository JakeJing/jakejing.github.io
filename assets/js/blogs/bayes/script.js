// Get DOM elements
const muInput = document.getElementById("mu");
const sdInput = document.getElementById("sd");
const nInput = document.getElementById("n");
const messageDiv = document.getElementById("message");
const simulateButton = document.getElementById("simulate");
const startsampling = document.getElementById("startMCMC");
const stopsampling = document.getElementById("stopMCMC");
const clearsampling = document.getElementById("clearMCMC");

// Define the global variables data
let data = [];
// global Input_params for the vertical lines in the plot
let Input_params = {
  μ: parseFloat(muInput.value),
  σ: parseFloat(sdInput.value),
};

// Add event listener for the "Simulate" button
simulateButton.addEventListener("click", function () {
  const mu = parseFloat(muInput.value);
  const sd = parseFloat(sdInput.value);
  const n = parseInt(nInput.value);
  // Check if the initial values are valid
  if (sd <= 0 || n < 1) {
    window.alert("Invalid parameter!");
  } else {
    const sim = d3.range(n).map(function () {
      return d3.randomNormal(mu, sd)();
    });
    if (sim.length > 0) {
      data = sim;
      Input_params["μ"] = mu;
      Input_params["σ"] = sd;
      window.alert("Simulation OK! Now you can start sampling!");
      // messageDiv.innerHTML = "OK!";
      // setTimeout(function () {
      //   messageDiv.innerHTML = "";
      // }, 500);
      // messageDiv.style.position = "absolute";
      // messageDiv.style.left = "68%";
      // messageDiv.style.top = "124px";
      // messageDiv.style.color = "green";
      // messageDiv.style.backgroundColor = "white";
    } else {
      window.alert("Please simulate data first!");
    }
  }
});

var params = {
  μ: { type: "real" },
  σ: { type: "real", lower: 0 },
};
var param_names = Object.keys(params);
var params_to_plot = Object.keys(params);

var log_post = function (state, data) {
  var log_post = 0;
  // Priors
  log_post += ld.norm(state.μ, 0, 100);
  log_post += ld.unif(state.σ, 0, 100);
  // Likelihood
  for (var i = 0; i < data.length; i++) {
    log_post += ld.norm(data[i], state.μ, state.σ);
  }
  return log_post;
};

// Setting up the plots
var plot_margins = { l: 40, r: 10, b: 40, t: 40, pad: 4 };
let sampler = new mcmc.AmwgSampler(params, log_post, data);
sampler.burn(1000);
let samples = sampler.sample(1);

for (var i = 0; i < params_to_plot.length; i++) {
  var param = params_to_plot[i];
  $("div#mcmc_plots_div").append(
    "<div>" +
      '<div id = "' +
      param +
      "_trace_div" +
      '" style="width:350px;height:240px;display: inline-block;"></div>' +
      '<div id = "' +
      param +
      "_hist_div" +
      '" style="width:350px;height:240px;display: inline-block;"></div>' +
      "</div>"
  );
  Plotly.plot($("div#" + param + "_trace_div")[0], [{ y: samples[param] }], {
    margin: plot_margins,
    title: "Traceplot of " + param,
  });
  Plotly.plot(
    $("div#" + param + "_hist_div")[0],
    [{ x: samples[param], type: "histogram" }],
    { margin: plot_margins, title: "Posterior of " + param }
  );
}

function update_trace_plots() {
  for (var i = 0; i < params_to_plot.length; i++) {
    var param = params_to_plot[i];
    Plotly.restyle($("div#" + param + "_trace_div")[0], {
      y: [samples[param]],
    });
  }
}

function update_histograms() {
  for (var i = 0; i < params_to_plot.length; i++) {
    // Create a histogram trace
    // var histogramData = {
    //   x: [samples[param]],
    //   type: "histogram",
    // };

    var param = params_to_plot[i];
    Plotly.restyle($("div#" + param + "_hist_div")[0], {
      x: [samples[param]],
      xbins: {},
    });
    const y_max = parseFloat(
      document.getElementById(param + "_hist_div")["layout"]["yaxis"][
        "range"
      ][1]
    );
    Plotly.relayout($("div#" + param + "_hist_div")[0], {
      // yaxis: { range: [0, y_max] },
      shapes: [
        {
          type: "line",
          x0: Input_params[param],
          y0: 0,
          x1: Input_params[param],
          y1: y_max * 0.95, // 0.95 is the best scale
          // y1: null,
          line: {
            color: "red",
            width: 4,
            dash: "dash",
          },
        },
      ],
    });
  }
}

var clear_samples = function () {
  samples = sampler.sample(1);
  update_trace_plots();
  // update_histograms(); // replace this with the following code
  clearTimeout(sample_loop_timeout_id);
  for (var i = 0; i < params_to_plot.length; i++) {
    var param = params_to_plot[i];
    Plotly.restyle($("div#" + param + "_hist_div")[0], {
      x: [samples[param]],
      xbins: {},
    });
    Plotly.relayout($("div#" + param + "_hist_div")[0], {
      // yaxis: { range: [0, 1] },
      yaxis: { range: null },
      shapes: null,
    });
  }
};

var sample_loop_timeout_id;
var sample_loop = function (params, log_post, data) {
  var n_samples = Math.min(250, Math.ceil(samples[param_names[0]].length / 10));
  var more_samples = sampler.sample(n_samples);
  for (var i = 0; i < param_names.length; i++) {
    var param = param_names[i];
    Array.prototype.push.apply(samples[param], more_samples[param]);
  }
  update_trace_plots();
  update_histograms();
  sample_loop_timeout_id = setTimeout(sample_loop, 1);
};

var stop_sample_loop = function () {
  clearTimeout(sample_loop_timeout_id);
  update_trace_plots();
  update_histograms();
};

// Add event listener for the "startsampling" button
startsampling.addEventListener("click", function () {
  // if sampling has begun once (bcs stopMCMC.disabled is true), continue the sampling
  if (document.getElementById("stopMCMC").disabled) {
    sample_loop(params, log_post, data);
    document.getElementById("stopMCMC").disabled = false;
  } else {
    if (data.length > 0) {
      this.disabled = true;
      document.getElementById("stopMCMC").disabled = false;
      // update the sampler with new data after the click
      sampler = new mcmc.AmwgSampler(params, log_post, data);
      sampler.burn(1000);
      samples = sampler.sample(1);
      sample_loop(params, log_post, data);
    } else {
      window.alert("Please simulate data first!");
    }
  }
});

// Add event listener for the "stopsampling" button
stopsampling.addEventListener("click", function () {
  if (data.length > 0) {
    this.disabled = true;
    document.getElementById("startMCMC").disabled = false;
    stop_sample_loop();
  } else {
    window.alert("Please simulate data first!");
  }
});

// Add event listener for the "clearsampling" button
clearsampling.addEventListener("click", function () {
  if (data.length > 0) {
    document.getElementById("startMCMC").disabled = false;
    document.getElementById("stopMCMC").disabled = false;
    clear_samples();
  } else {
    window.alert("Please simulate data first!");
  }
});

