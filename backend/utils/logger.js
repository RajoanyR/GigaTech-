/* Logger minimaliste (evite une dependance supplementaire). */
const stamp = () => new Date().toISOString();
module.exports = {
  info: (...a) => console.log(`[INFO ${stamp()}]`, ...a),
  warn: (...a) => console.warn(`[WARN ${stamp()}]`, ...a),
  error: (...a) => console.error(`[ERROR ${stamp()}]`, ...a),
};
