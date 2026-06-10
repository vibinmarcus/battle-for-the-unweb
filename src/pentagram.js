(function() {
  function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

  function animProp(el, prop, from, to, dur, delay, cb) {
    if (!el) return;
    setTimeout(() => {
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const v = from + (to - from) * ease(t);
        if (prop === 'opacity') el.setAttribute('opacity', v.toFixed(3));
        else if (prop === 'stroke-dashoffset') el.setAttribute('stroke-dashoffset', v.toFixed(2));
        if (t < 1) requestAnimationFrame(step);
        else if (cb) cb();
      }
      requestAnimationFrame(step);
    }, delay);
  }

  function fadeIn(el, dur, delay, cb) { animProp(el, 'opacity', 0, 1, dur, delay, cb); }

  function drawLine(lEl, gEl, dEl, dgEl, dashLen, dur, delay, cb) {
    if (lEl) lEl.setAttribute('stroke-dashoffset', dashLen);
    animProp(lEl, 'stroke-dashoffset', dashLen, 0, dur, delay, () => {
      if (gEl) gEl.classList.add('pgl-lit');
      if (dEl) fadeIn(dEl, 300, 0);
      if (dgEl) fadeIn(dgEl, 300, 0);
      if (cb) cb();
    });
  }

  function pEl(id) { return document.getElementById(id); }

  const lineDur = 700, lineGap = 120;

  setTimeout(() => {
    fadeIn(pEl('pd1'),  250, 0);
    fadeIn(pEl('pdg1'), 250, 0);
    drawLine(pEl('pl1'), pEl('pgl1'), pEl('pd2'), pEl('pdg2'), 448, lineDur, 0, () => {
      drawLine(pEl('pl2'), pEl('pgl2'), pEl('pd3'), pEl('pdg3'), 448, lineDur, lineGap, () => {
        drawLine(pEl('pl3'), pEl('pgl3'), pEl('pd4'), pEl('pdg4'), 448, lineDur, lineGap, () => {
          drawLine(pEl('pl4'), pEl('pgl4'), pEl('pd5'), pEl('pdg5'), 448, lineDur, lineGap, () => {
            drawLine(pEl('pl5'), pEl('pgl5'), null, null, 448, lineDur, lineGap, () => {
              animProp(pEl('pPentagon'), 'stroke-dashoffset', 1382, 0, 900, 0);
              fadeIn(pEl('pPentagon'), 600, 0);
              animProp(pEl('pOuterC'),  'stroke-dashoffset', 1634, 0, 1400, 100, () => {
                const hc = document.getElementById('homeContent');
                if (hc) hc.style.opacity = '1';
              });
              fadeIn(pEl('pOuterC'),  400, 100);
              animProp(pEl('pOuterCG'), 'stroke-dashoffset', 1634, 0, 1400, 100);
              fadeIn(pEl('pOuterCG'), 400, 100);
              setTimeout(() => { fadeIn(pEl('pEmbers'), 800, 400); }, 300);
            });
          });
        });
      });
    });
  }, 400);
})();
