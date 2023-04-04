function gaussian(mu, sd) {
  var x1, x2, w;
  do {
    x1 = 2 * Math.random() - 1;
    x2 = 2 * Math.random() - 1;
    w = x1 * x1 + x2 * x2;
  } while (w >= 1);
  w = Math.sqrt((-2 * Math.log(w)) / w);
  return mu + sd * x1 * w;
}
function simulate() {
  // Get input values
  var mu = parseFloat(document.getElementById("mu").value);
  var sd = parseFloat(document.getElementById("sd").value);
  var n = parseInt(document.getElementById("n").value);
  var data = [];
  for (var i = 0; i < n; i++) {
    data.push(gaussian(mu, sd));
  }
  var binSize = 1;
  var histogram = {};
  for (var i = 0; i < data.length; i++) {
    var bin = Math.round(data[i] / binSize);
    if (histogram[bin]) {
      histogram[bin]++;
    } else {
      histogram[bin] = 1;
    }
  }
  var histogramArray = [];
  for (var bin in histogram) {
    histogramArray.push([parseFloat(bin) * binSize, histogram[bin]]);
  }
  histogramArray.sort(function (a, b) {
    return a[0] - b[0];
  });
  var x = histogramArray.map(function (item) {
    return item[0];
  });
  var y = histogramArray.map(function (item) {
    return item[1];
  });
  var data = [
    {
      x: x,
      y: y,
      type: "bar",
      marker: {
        color: "rgb(26, 118, 255)",
        line: {
          color: "rgb(8,48,107)",
          width: 1.5,
        },
      },
    },
  ];
  Plotly.newPlot("plot", data);
}
document.getElementById("simulate-btn").addEventListener("click", simulate);
