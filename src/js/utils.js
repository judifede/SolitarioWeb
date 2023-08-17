
export default function viewportToPixels(value) {
  /*value=100vh, por ejemplo*/
  var parts = value.match(/([0-9\.]+)(vh|vw)/);
  var q = Number(parts[1]);
  var side =
    window[["innerHeight", "innerWidth"][["vh", "vw"].indexOf(parts[2])]];
  return side * (q / 100);
}

export function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}