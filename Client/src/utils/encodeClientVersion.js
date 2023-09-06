/**
 * Encode the client version.
 * C++ version: {'1'+1, '0'+2, '4'+3, '0'+4, '5'+5};
 *
 * @param {string} version
 * @return {string}
 */
module.exports = version => {
  version = version.replaceAll('.', '');
  const encoded = [];
  for (let i = 0; i < version.length; i++) {
    encoded.push(
      String.fromCharCode(version[i].charCodeAt(0) + (i + 1))
    );
  }
  return encoded.join('');
};
