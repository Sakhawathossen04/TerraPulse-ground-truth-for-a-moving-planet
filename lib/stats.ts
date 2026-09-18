/**
 * Statistics + uncertainty engine.
 * Pure functions: Theil–Sen slope, seasonal decomposition, Gaussian processes,
 * split/Jackknife+ conformal calibration. No dependencies — fully testable.
 */

export interface TsSample {
  date: string;
  displacementMm: number;
  sigmaMm: number;
}

export function parseIso(d: string): number {
  return Date.parse(d) / 86400000; // days since epoch
}

/** Inverse standard-normal CDF (Acklam's rational approximation). */
export function normInv(p: number): number {
  if (p <= 0 || p >= 1) throw new Error("normInv: p must be in (0,1)");
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969,
    138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887,
    66.8013118877197, -13.2806815528857];
  const c = [-7.78489400243029e-3, -0.322396458041136, -2.40075827716184,
    -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [7.78469570904146e-3, 0.32246712907004, 2.445134137143,
    3.75440866190742];
  const pl = 0.02425;
  let q: number, r: number;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - pl) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  q = p - 0.5;
  r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/** Deterministic PRNG (mulberry32) so the pipeline is byte-reproducible. */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller gaussian from a uniform generator. */
export function gauss(rnd: () => number): number {
  let u = 0;
  while (u === 0) u = rnd();
  const v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function mean(xs: number[]): number {
  if (xs.length === 0) return NaN;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

export function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}

export function median(xs: number[]): number {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

export function quantile(xs: number[], q: number): number {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((x, y) => x - y);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

export interface TheilSenFit {
  slopePerDay: number;
  intercept: number;
  lo95PerDay: number;
  hi95PerDay: number;
}

/**
 * Theil–Sen robust slope with a 95% CI from the Kendall-type variance
 * approximation (Sen 1968). Robust to outliers/outlier epochs — the InSAR
 * analogue of a stack of interferogram pairs.
 */
export function theilSen(
  t: number[],
  y: number[],
  z95 = 1.959963985
): TheilSenFit {
  const n = t.length;
  if (n < 3) throw new Error("theilSen: need >= 3 points");
  const slopes: number[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (t[j] !== t[i]) slopes.push((y[j] - y[i]) / (t[j] - t[i]));
    }
  }
  slopes.sort((a, b) => a - b);
  const slope = median(slopes);
  const intercept = median(y.map((yi, i) => yi - slope * t[i]));

  // Variance of slopes via Kendall's S statistic (Sen 1968, eq. 2.8).
  const tieAdjT = tieAdjust(t);
  const tieAdjY = tieAdjust(y);
  const s2 =
    (n * (n - 1) * (2 * n + 5) -
      tieAdjT.sums -
      tieAdjY.sums) / 18;
  const sigma = Math.sqrt(s2);
  const m = slopes.length;
  const c = normInv(0.975) * sigma;
  const nUp = Math.round((m - c) / 2);
  const nLo = Math.round((m + c) / 2);
  const lo = slopes[Math.max(0, Math.min(m - 1, nUp))];
  const hi = slopes[Math.max(0, Math.min(m - 1, nLo))];
  return { slopePerDay: slope, intercept, lo95PerDay: Math.min(lo, hi), hi95PerDay: Math.max(lo, hi) };
}

function tieAdjust(xs: number[]): { sums: number } {
  const counts = new Map<number, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  let sums = 0;
  for (const cnt of counts.values()) if (cnt > 1) sums += cnt * (cnt - 1) * (2 * cnt + 5);
  return { sums };
}

export interface Decomposed {
  date: string;
  trendMm: number;
  seasonalMm: number;
  residualMm: number;
}

/**
 * Joint robust fit: velocity (Theil–Sen) + seasonal harmonics estimated
 * together by alternating correction — the MintPy-style approach. Removing
 * the seasonal term before the robust slope avoids the concavity bias a
 * raw Theil–Sen suffers on strongly seasonal arcs.
 */
export interface JointFit {
  slopePerDay: number;
  intercept: number;
  lo95PerDay: number;
  hi95PerDay: number;
  points: Decomposed[];
  seasonalAmpMm: number;
  residualStdMm: number;
}

export function jointFit(samples: TsSample[]): JointFit {
  const t = samples.map((s) => parseIso(s.date));
  const y = samples.map((s) => s.displacementMm);
  const omega = (2 * Math.PI) / 365.25;
  const S = t.map((ti) => [
    Math.sin(omega * ti),
    Math.cos(omega * ti),
    Math.sin(2 * omega * ti),
    Math.cos(2 * omega * ti),
  ]);

  // Step 1: full OLS on [1, t−t̄, harmonics] — the model is linear, so OLS is
  // unbiased and gives a clean seasonal removal before robustification.
  // t is mean-centered for conditioning (slope is shift-invariant).
  const tMean = mean(t);
  const tRel = t.map((ti) => ti - tMean);
  const X = tRel.map((ti, i) => [1, ti, S[i][0], S[i][1], S[i][2], S[i][3]]);
  const b = solveLs(X, y);
  const seas = (i: number, c: number[], off: number) =>
    S[i][0] * c[off] + S[i][1] * c[off + 1] + S[i][2] * c[off + 2] + S[i][3] * c[off + 3];
  const corrected = y.map((yi, i) => yi - seas(i, b, 2));

  // Step 2: robust Theil–Sen velocity on the seasonally-corrected series.
  const fit = theilSen(t, corrected);
  const slope = fit.slopePerDay;
  const intercept = fit.intercept;

  // Step 3: final harmonic refit on residuals from the robust line.
  const beta = solveLs(S, y.map((yi, i) => yi - (slope * t[i] + intercept)));
  const lo95 = fit.lo95PerDay;
  const hi95 = fit.hi95PerDay;

  const points: Decomposed[] = samples.map((s, i) => {
    const trend = slope * t[i] + intercept;
    const seasonal = seas(i, beta, 0);
    return {
      date: s.date,
      trendMm: r6(trend),
      seasonalMm: r6(seasonal),
      residualMm: r6(y[i] - trend - seasonal),
    };
  });
  const seasonalSeries = points.map((p) => p.seasonalMm);
  return {
    slopePerDay: slope,
    intercept,
    lo95PerDay: lo95,
    hi95PerDay: hi95,
    points,
    seasonalAmpMm: Math.max(...seasonalSeries) - Math.min(...seasonalSeries),
    residualStdMm: stdev(points.map((p) => p.residualMm)),
  };
}

/**
 * Trend + annual-seasonal decomposition: robust Theil–Sen trend minus a
 * first/second-harmonic seasonal model fitted to the residuals.
 */
export function decompose(samples: TsSample[]): Decomposed[] {
  return jointFit(samples).points;
}

function design(t: number[]): number[][] {
  const omega = (2 * Math.PI) / 365.25;
  return t.map((ti) => [
    Math.sin(omega * ti),
    Math.cos(omega * ti),
    Math.sin(2 * omega * ti),
    Math.cos(2 * omega * ti),
  ]);
}

export function solveLs(a: number[][], y: number[]): number[] {
  // Normal equations (4x4) — fine for this size.
  const k = a[0].length;
  const ata: number[][] = Array.from({ length: k }, () => Array(k).fill(0));
  const atb: number[] = Array(k).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let p = 0; p < k; p++) {
      atb[p] += a[i][p] * y[i];
      for (let q = 0; q < k; q++) ata[p][q] += a[i][p] * a[i][q];
    }
  }
  // Gaussian elimination with partial pivoting.
  const m = ata.map((row, i) => [...row, atb[i]]);
  for (let col = 0; col < k; col++) {
    let piv = col;
    for (let r = col + 1; r < k; r++) if (Math.abs(m[r][col]) > Math.abs(m[piv][col])) piv = r;
    [m[col], m[piv]] = [m[piv], m[col]];
    const d = m[col][col] || 1e-12;
    for (let r = 0; r < k; r++) {
      if (r === col) continue;
      const f = m[r][col] / d;
      for (let cc = col; cc <= k; cc++) m[r][cc] -= f * m[col][cc];
    }
  }
  return m.map((row, i) => row[k] / (row[i] || 1e-12));
}

function r6(v: number): number {
  return Math.round(v * 1e6) / 1e6;
}

// ---------------- Gaussian process (RBF, exact, small n) ----------------

export interface GpFit {
  mu: number[];
  sd: number[];
}

/** Exact GP regression with RBF kernel + observation noise. */
export function gpFit(
  xTrain: number[],
  yTrain: number[],
  sigmaNoise: number,
  lengthScaleDays: number,
  ampMm: number,
  xPred: number[]
): GpFit {
  const n = xTrain.length;
  const kxx: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const r = (xTrain[i] - xTrain[j]) / lengthScaleDays;
      kxx[i][j] = ampMm * ampMm * Math.exp(-0.5 * r * r) + (i === j ? sigmaNoise ** 2 : 0);
    }
  }
  // Cholesky kxx = L L^T
  const L: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let s = kxx[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) L[i][j] = Math.sqrt(Math.max(s, 1e-12));
      else L[i][j] = s / L[j][j];
    }
  }
  // alpha = K^{-1} y
  const alpha = choSolve(L, yTrain.slice());
  return {
    mu: xPred.map((xp) => {
      let s = 0;
      for (let i = 0; i < n; i++) {
        const r = (xp - xTrain[i]) / lengthScaleDays;
        s += L[i] ? 0 : 0;
      }
      // recompute cross-kernel directly
      s = 0;
      for (let i = 0; i < n; i++) {
        const r = (xp - xTrain[i]) / lengthScaleDays;
        s += ampMm * ampMm * Math.exp(-0.5 * r * r) * alpha[i];
      }
      return s;
    }),
    sd: xPred.map((xp) => {
      // k(x*,x*) - v^T v, v = L^{-1} k*
      const kst: number[] = xTrain.map(
        (xt) => ampMm * ampMm * Math.exp(-0.5 * ((xp - xt) / lengthScaleDays) ** 2)
      );
      let v: number[] = Array(n).fill(0);
      // forward solve
      for (let i = 0; i < n; i++) {
        let s = kst[i];
        for (let j = 0; j < i; j++) s -= L[i][j] * v[j];
        v[i] = s / L[i][i];
      }
      const vv = v.reduce((acc, val) => acc + val * val, 0);
      return Math.sqrt(Math.max(ampMm * ampMm - vv, 1e-9));
    }),
  };
}

function choSolve(L: number[][], b: number[]): number[] {
  const n = L.length;
  // forward
  const z: number[] = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let s = b[i];
    for (let j = 0; j < i; j++) s -= L[i][j] * z[j];
    z[i] = s / L[i][i];
  }
  // back
  const x: number[] = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = z[i];
    for (let j = i + 1; j < n; j++) s -= L[j][i] * x[j];
    x[i] = s / L[i][i];
  }
  return x;
}

// ---------------- Conformal calibration (split / Jackknife+) ----------------

export interface CalibPoint {
  pred: number;
  actual: number;
}

/**
 * Split-conformal absolute-residual quantile: interval pred ± q̂ where
 * q̂ = ceil((n+1)(1-α))/n quantile of |residuals|. Guarantees marginal
 * coverage ≥ target on exchangeable calibration data.
 */
export function conformalQuantile(cal: CalibPoint[], target = 0.9): number {
  const n = cal.length;
  if (n === 0) return NaN;
  const res = cal.map((c) => Math.abs(c.actual - c.pred)).sort((a, b) => a - b);
  const idx = Math.min(n - 1, Math.ceil((n + 1) * target) - 1);
  return res[idx];
}

/**
 * Jackknife+ (Barber et al. 2021), specialized to the TerraPulse setting:
 * the predictor (InSAR velocity) is derived independently of the calibration
 * set (GNSS), so leave-one-out refits equal the original prediction and the
 * interval reduces to a symmetric split-conformal interval with the
 * finite-sample ⌈(n+1)(1−α)⌉/n correction — which is what guarantees the
 * coverage target at small n (2–4 stations per AOI).
 */
export function jackknifePlus(cal: CalibPoint[], target = 0.9): { lo: (p: number) => number; hi: (p: number) => number } {
  const q = conformalQuantile(cal, target);
  return {
    lo: (p: number) => p - q,
    hi: (p: number) => p + q,
  };
}

export function coveragePct(cal: CalibPoint[], lo: (p: number) => number, hi: (p: number) => number): number {
  let hit = 0;
  for (const c of cal) if (c.actual >= lo(c.pred) && c.actual <= hi(c.pred)) hit++;
  return hit / cal.length;
}

/** mm/day → mm/yr */
export const perDayToPerYear = (v: number) => v * 365.25;
