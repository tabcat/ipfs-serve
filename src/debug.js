
module.exports = (enabled = false) => (...p) => {
  if (enabled) p.map(v => console.log(v))
}
