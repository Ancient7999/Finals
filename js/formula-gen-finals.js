/**
 * Unlimited formula practice generators for Medical Physics Finals (draft).
 * Scope: Chapter 7 (Atomic and Nuclear Physics).
 * Same architecture as the PT2 generator:
 * FORMULA_METADATA + QUESTION_GENERATORS + variants, exposed as window.FinalsFormulaGen.
 */
(function (global) {
  'use strict';

  const FORMULA_METADATA = {
    photonEnergy:    { name: 'Photon energy',           description: 'E = h f', variants: ['E', 'f'] },
    deBroglie:       { name: 'de Broglie wavelength',   description: 'λ = h / (m v)', variants: ['λ', 'v', 'm'] },
    nuclearRadius:   { name: 'Nuclear radius',          description: 'r = 1.2×10⁻¹⁵ × A⅓', variants: ['r', 'A'] },
    halfLife:        { name: 'Half-life',               description: 'λ = 0.693 / T½', variants: ['λ', 'T½'] },
    activity:        { name: 'Activity',                description: 'R = λ N', variants: ['R', 'N', 'λ'] },
    absorbedDose:    { name: 'Absorbed dose',           description: 'D = E / m', variants: ['D', 'E', 'm'] },
    doseEquivalent:  { name: 'Dose equivalent',         description: 'H = D × QF', variants: ['H', 'D', 'QF'] }
  };

  /* —— helpers (as in Finals) —— */
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function shuffle(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = x[i]; x[i] = x[j]; x[j] = t; } return x; }
  function toSuperscript(exp) { const map = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺' }; return String(exp).split('').map(function (c) { return map[c] || c; }).join(''); }
  function fmtSci(n, digits) {
    if (!Number.isFinite(n)) return String(n);
    const d = digits == null ? 3 : digits; const abs = Math.abs(n);
    if (abs !== 0 && (abs >= 1e4 || abs < 1e-2)) {
      let exp = Math.floor(Math.log10(abs)); let mant = n / Math.pow(10, exp);
      if (Math.abs(Number(mant.toFixed(d))) >= 10) { exp += 1; mant = n / Math.pow(10, exp); }
      return mant.toFixed(d).replace(/\.?0+$/, '') + ' × 10' + toSuperscript(exp);
    }
    if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n)).replace('-', '−');
    return n.toFixed(d).replace(/\.?0+$/, '').replace('-', '−');
  }
  function fmtWithUnit(n, unit, digits) { return fmtSci(n, digits) + (unit ? ' ' + unit : ''); }
  function mapLine(valueText, symbol) { return valueText + ' → ' + symbol; }
  const R2D = 180 / Math.PI, D2R = Math.PI / 180;

  /**
   * Options from the correct value plus distractors. Works for negative answers
   * (sign-flip distractor allowed) and for pure ratios (unit '').
   * Labels are compared as text, so the 4 options are always distinct.
   */
  function buildOpts(ans, unit, digits, extra) {
    const mults = [0.25, 0.5, 2, 4, 0.1, 10, 0.2, 5, 1.5, 0.75, 3, 1 / 3];
    const vals = [ans]; const labels = [fmtWithUnit(ans, unit, digits)];
    function tryAdd(c) {
      if (!Number.isFinite(c)) return;
      const minDiff = Math.max(Math.abs(ans) * 0.08, 1e-30);
      if (!vals.every(function (v) { return Math.abs(v - c) >= minDiff; })) return;
      const l = fmtWithUnit(c, unit, digits); if (labels.indexOf(l) >= 0) return;
      vals.push(c); labels.push(l);
    }
    (extra || []).forEach(function (c) { if (vals.length < 4) tryAdd(c); });
    let tries = 0;
    while (vals.length < 4 && tries < 80) { tries++; tryAdd(ans * pick(mults)); }
    let k = 1; while (vals.length < 4 && k < 200) { tryAdd(ans === 0 ? k : ans * (1 + 0.37 * k)); k++; }
    while (vals.length < 4) {
      const c = (ans === 0 ? (vals.length + 1) : ans * (10 + vals.length * 10));
      let l = fmtWithUnit(c, unit, digits);
      if (labels.indexOf(l) >= 0) l = l + ' '; // unique fallback label
      vals.push(c); labels.push(l);
    }
    const order = shuffle([0, 1, 2, 3]);
    return { options: order.map(function (i) { return labels[i]; }), correct: order.indexOf(0), value: ans };
  }

  function pack(meta) {
    const md = FORMULA_METADATA[meta.key];
    return {
      type: 'mcq',
      id: 'FORMF_' + meta.key + '_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1e6).toString(36),
      cat: 'Formulas · ' + md.name,
      q: meta.q, options: meta.built.options, correct: meta.built.correct, answerValue: meta.built.value,
      explain: meta.explain,
      formulaKey: meta.key, _formulaVariant: meta.variant,
      formulaHint: meta.hint, formulaMap: meta.map || [], formulaPlugIn: meta.plug || '',
      formulaSteps: meta.steps || [], formulaName: md.name, formulaEq: md.description,
      formulaWorked: meta.worked || null,
      __formulaMode: true
    };
  }
  /* the specific case of a ± formula, shown between the original formula and the rearranged one */
  const WORKED_CASE = {
    dopplerSource: {
      0: { note: 'Source moves towards the listener: take the minus sign, v − v_S, so f′ is higher than f.' },
      1: { note: 'Source moves away from the listener: take the plus sign, v + v_S, so f′ is lower than f.' },
      2: { note: 'Source moves towards the listener: take the minus sign, then solve for v_S.', eq: 'f′ = f × v / (v − v_S)' }
    }
  };
  /** Common finish: steps = [formula, plug-in, result]. */
  function done(key, variant, q, hint, map, plug, ans, unit, digits, extra, explainTail) {
    const res = fmtWithUnit(ans, unit, digits);
    // worked help for "Show formula": the generator's own givens, formula, rearranged form and numbers
    const base = FORMULA_METADATA[key].description, lhs = String(hint).split('=')[0].trim();
    const branch = WORKED_CASE[key] && WORKED_CASE[key][variant];
    // a reciprocal form (1/d_i = …): the numbers give 1/d_i in unit⁻¹ first, then its inverse is the distance asked for
    const recip = /^1\s*\/\s*(.+)$/.exec(lhs), inner = recip && /^1 \/ \((.*)\)$/.exec(String(plug));
    const target = recip ? recip[1].trim() : lhs;
    const sub = inner ? lhs + ' = ' + inner[1] + ' = ' + fmtWithUnit(1 / ans, unit ? unit + '⁻¹' : '', digits) + ', so ' + target + ' = ' + plug : lhs + ' = ' + plug;
    const resLine = target + ' = ' + res;
    const worked = {
      caseNote: branch ? branch.note : '',
      branch: branch && branch.eq && branch.eq !== hint ? branch.eq : '',
      givens: (map || []).map(function (l) { const p = String(l).split(' → '); return p.length === 2 ? p[1] + ' = ' + p[0] : String(l); }),
      equation: base,
      rearranged: hint !== base ? hint : '',
      substitution: sub,
      result: resLine
    };
    return pack({ key: key, variant: variant, q: q, hint: hint, map: map, plug: plug, worked: worked,
      steps: inner ? [hint, sub, resLine] : [hint, '= ' + plug, '= ' + res],
      explain: (inner ? sub + ' = ' + res : hint + ' = ' + plug + ' = ' + res) + '.' + (explainTail ? ' ' + explainTail : ''),
      built: buildOpts(ans, unit, digits, extra) });
  }

  /* —— Chapter 7 —— */
  const H = 6.63e-34;
  const R0 = 1.2e-15;

  function genPhotonEnergy() {
    const v = randInt(0, 1);
    const f = pick([1e14, 5e14, 1e15, 2e15, 5e15, 1e18, 2e18]);
    const E = H * f;
    if (v === 0) return done('photonEnergy', v,
      'A photon has frequency ' + fmtSci(f) + ' Hz. What is its energy? (h = 6.63 × 10⁻³⁴ J·s)',
      'E = h f', [mapLine('6.63 × 10⁻³⁴ J·s', 'h'), mapLine(fmtSci(f) + ' Hz', 'f')],
      '6.63 × 10⁻³⁴ · ' + fmtSci(f), E, 'J', 3, [H / f, E * 1.6e-19]);
    return done('photonEnergy', v,
      'A photon has energy ' + fmtSci(E) + ' J. What is its frequency? (h = 6.63 × 10⁻³⁴ J·s)',
      'f = E / h', [mapLine(fmtSci(E) + ' J', 'E'), mapLine('6.63 × 10⁻³⁴ J·s', 'h')],
      fmtSci(E) + ' / 6.63 × 10⁻³⁴', f, 'Hz', 3);
  }

  function genDeBroglie() {
    const v = randInt(0, 2);
    const m = pick([1.67e-27, 9.1e-31, 0.02, 1e-25]);
    const sp = pick([1e6, 2e6, 20, 100, 1e5]);
    const lam = H / (m * sp);
    if (v === 0) return done('deBroglie', v,
      'A particle of mass ' + fmtSci(m) + ' kg moves at ' + fmtSci(sp) + ' m/s. What is its de Broglie wavelength? (h = 6.63 × 10⁻³⁴ J·s)',
      'λ = h / (m v)', [mapLine('6.63 × 10⁻³⁴', 'h'), mapLine(fmtSci(m) + ' kg', 'm'), mapLine(fmtSci(sp) + ' m/s', 'v')],
      '6.63 × 10⁻³⁴ / (' + fmtSci(m) + ' · ' + fmtSci(sp) + ')', lam, 'm', 3);
    if (v === 1) return done('deBroglie', v,
      'A particle of mass ' + fmtSci(m) + ' kg has de Broglie wavelength ' + fmtSci(lam) + ' m. What is its speed?',
      'v = h / (m λ)', [mapLine('6.63 × 10⁻³⁴', 'h'), mapLine(fmtSci(m) + ' kg', 'm'), mapLine(fmtSci(lam) + ' m', 'λ')],
      '6.63 × 10⁻³⁴ / (' + fmtSci(m) + ' · ' + fmtSci(lam) + ')', sp, 'm/s', 3);
    return done('deBroglie', v,
      'A particle moving at ' + fmtSci(sp) + ' m/s has de Broglie wavelength ' + fmtSci(lam) + ' m. What is its mass?',
      'm = h / (λ v)', [mapLine('6.63 × 10⁻³⁴', 'h'), mapLine(fmtSci(lam) + ' m', 'λ'), mapLine(fmtSci(sp) + ' m/s', 'v')],
      '6.63 × 10⁻³⁴ / (' + fmtSci(lam) + ' · ' + fmtSci(sp) + ')', m, 'kg', 3);
  }

  function genNuclearRadius() {
    const v = randInt(0, 1);
    const A = pick([12, 16, 27, 56, 64, 107, 238]);
    const r = R0 * Math.pow(A, 1 / 3);
    if (v === 0) return done('nuclearRadius', v,
      'What is the radius of a nucleus with mass number A = ' + A + '? (r₀ = 1.2 × 10⁻¹⁵ m)',
      'r = 1.2×10⁻¹⁵ × A⅓', [mapLine(String(A), 'A')],
      '1.2 × 10⁻¹⁵ · ' + A + '⅓', r, 'm', 3, [R0 * A, R0 * Math.pow(A, 1 / 2)]);
    return done('nuclearRadius', v,
      'A nucleus has radius ' + fmtSci(r) + ' m. What is its mass number A? (r₀ = 1.2 × 10⁻¹⁵ m)',
      'A = (r / 1.2×10⁻¹⁵)³', [mapLine(fmtSci(r) + ' m', 'r')],
      '(' + fmtSci(r) + ' / 1.2 × 10⁻¹⁵)³', A, '', 0);
  }

  function genHalfLife() {
    const v = randInt(0, 1);
    const T = pick([3.8, 15, 30, 50, 5730]);
    const lam = 0.693 / T;
    if (v === 0) return done('halfLife', v,
      'A radioactive sample has half-life ' + T + ' (time units). What is its decay constant λ?',
      'λ = 0.693 / T½', [mapLine(T + '', 'T½')], '0.693 / ' + T, lam, 'time⁻¹', 4);
    return done('halfLife', v,
      'A radioactive nuclide has decay constant ' + fmtSci(lam, 4) + ' (time⁻¹). What is its half-life?',
      'T½ = 0.693 / λ', [mapLine(fmtSci(lam, 4), 'λ')], '0.693 / ' + fmtSci(lam, 4), T, 'time', 2);
  }

  function genActivity() {
    const v = randInt(0, 2);
    const N = pick([1e12, 2e15, 5e18, 1e20]);
    const lam = pick([1e-6, 2e-7, 5e-8, 1e-5]);
    const R = lam * N;
    if (v === 0) return done('activity', v,
      'A sample contains ' + fmtSci(N) + ' radioactive nuclei with decay constant ' + fmtSci(lam) + ' s⁻¹. What is its activity?',
      'R = λ N', [mapLine(fmtSci(lam) + ' s⁻¹', 'λ'), mapLine(fmtSci(N), 'N')],
      fmtSci(lam) + ' · ' + fmtSci(N), R, 'Bq', 3);
    if (v === 1) return done('activity', v,
      'A sample has activity ' + fmtSci(R) + ' Bq and decay constant ' + fmtSci(lam) + ' s⁻¹. How many radioactive nuclei are present?',
      'N = R / λ', [mapLine(fmtSci(R) + ' Bq', 'R'), mapLine(fmtSci(lam) + ' s⁻¹', 'λ')],
      fmtSci(R) + ' / ' + fmtSci(lam), N, '', 3);
    return done('activity', v,
      'A sample of ' + fmtSci(N) + ' nuclei has activity ' + fmtSci(R) + ' Bq. What is the decay constant?',
      'λ = R / N', [mapLine(fmtSci(R) + ' Bq', 'R'), mapLine(fmtSci(N), 'N')],
      fmtSci(R) + ' / ' + fmtSci(N), lam, 's⁻¹', 3);
  }

  function genAbsorbedDose() {
    const v = randInt(0, 2);
    const E = pick([0.5, 1, 2, 5, 10]);
    const m = pick([0.05, 0.1, 0.5, 1, 2]);
    const D = E / m;
    if (v === 0) return done('absorbedDose', v,
      E + ' J of energy is absorbed by ' + m + ' kg of tissue. What is the absorbed dose?',
      'D = E / m', [mapLine(E + ' J', 'E'), mapLine(m + ' kg', 'm')],
      E + ' / ' + m, D, 'Gy', 3, [E * m, E]);
    if (v === 1) return done('absorbedDose', v,
      'A tissue of mass ' + m + ' kg receives an absorbed dose of ' + fmtSci(D) + ' Gy. How much energy was absorbed?',
      'E = D × m', [mapLine(fmtSci(D) + ' Gy', 'D'), mapLine(m + ' kg', 'm')],
      fmtSci(D) + ' · ' + m, E, 'J', 3);
    return done('absorbedDose', v,
      E + ' J of energy deposited gives an absorbed dose of ' + fmtSci(D) + ' Gy. What is the mass of the tissue?',
      'm = E / D', [mapLine(E + ' J', 'E'), mapLine(fmtSci(D) + ' Gy', 'D')],
      E + ' / ' + fmtSci(D), m, 'kg', 3);
  }

  function genDoseEquivalent() {
    const v = randInt(0, 2);
    const D = pick([0.01, 0.02, 0.05, 0.1, 0.5, 1, 2]);
    const QF = pick([1, 1, 2, 3, 5, 10, 20]);
    const H = D * QF;
    if (v === 0) return done('doseEquivalent', v,
      'An absorbed dose of ' + D + ' Gy is delivered by radiation with quality factor ' + QF + '. What is the dose equivalent?',
      'H = D × QF', [mapLine(D + ' Gy', 'D'), mapLine(String(QF), 'QF')],
      D + ' × ' + QF, H, 'Sv', 3, [D / QF, D + QF]);
    if (v === 1) return done('doseEquivalent', v,
      'The dose equivalent is ' + fmtSci(H) + ' Sv for radiation with QF = ' + QF + '. What was the absorbed dose?',
      'D = H / QF', [mapLine(fmtSci(H) + ' Sv', 'H'), mapLine(String(QF), 'QF')],
      fmtSci(H) + ' / ' + QF, D, 'Gy', 3);
    return done('doseEquivalent', v,
      'An absorbed dose of ' + D + ' Gy produces a dose equivalent of ' + fmtSci(H) + ' Sv. What is the quality factor?',
      'QF = H / D', [mapLine(fmtSci(H) + ' Sv', 'H'), mapLine(D + ' Gy', 'D')],
      fmtSci(H) + ' / ' + D, QF, '', 2);
  }

  const QUESTION_GENERATORS = {
    photonEnergy: genPhotonEnergy,
    deBroglie: genDeBroglie,
    nuclearRadius: genNuclearRadius,
    halfLife: genHalfLife,
    activity: genActivity,
    absorbedDose: genAbsorbedDose,
    doseEquivalent: genDoseEquivalent
  };
  function allKeys() { return Object.keys(QUESTION_GENERATORS); }
  function generateQuestion(selectedKeys) {
    const keys = (selectedKeys && selectedKeys.length ? selectedKeys : allKeys()).filter(function (k) { return QUESTION_GENERATORS[k]; });
    return QUESTION_GENERATORS[pick(keys.length ? keys : allKeys())]();
  }

  global.FinalsFormulaGen = { FORMULA_METADATA: FORMULA_METADATA, QUESTION_GENERATORS: QUESTION_GENERATORS, generateQuestion: generateQuestion, allKeys: allKeys, fmtSci: fmtSci };
})(typeof window !== 'undefined' ? window : globalThis);
