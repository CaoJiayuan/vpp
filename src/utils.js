export function versionCompare(a, b) {
  if (a === b) {
    return 0;
  }
  let a_components = a.split('.')
  let b_components = b.split(".");
  let len = Math.min(a_components.length, b_components.length);
  for (let i = 0; i < len; i++) {
    if (parseInt(a_components[i]) > parseInt(b_components[i])) {
      return 1;
    }

    if (parseInt(a_components[i]) < parseInt(b_components[i])) {
      return -1;
    }
  }

  if (a_components.length > b_components.length) {
    return 1;
  }

  if (a_components.length < b_components.length) {
    return -1;
  }

  return 0;
}