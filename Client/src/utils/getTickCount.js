module.exports = () => {
  const hrtime = process.hrtime();
  const nanoseconds = hrtime[0] * 1e9 + hrtime[1];
  return Math.floor(nanoseconds / 1e6);
};
