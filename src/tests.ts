function oguKombinacijas() {
  const max_ogas = 10;
  const ogas = ['avene', 'janoga', 'mellene', 'vinoga', 'zemene'];

  let count = 1;

  for (let i = 0; i < max_ogas; i++) {
    for (let j = i; j < max_ogas; j++) {
      // for ()
    }
  }

  // es nez

  const combinations = [];
  for (let i = 0; i < ogas.length; i++) {
    for (let j = i; j < ogas.length; j++) {
      for (let k = j; k < ogas.length; k++) {
        for (let l = k; l < ogas.length; l++) {
          for (let m = l; m < ogas.length; m++) {
            const [avene, janoga, mellen, vinoga, zemene] = [ogas[i], ogas[j], ogas[k], ogas[l], ogas[m]];
            combinations.push([ogas[i], ogas[j], ogas[k], ogas[l], ogas[m]]);
          }
        }
      }
    }
  }
}
