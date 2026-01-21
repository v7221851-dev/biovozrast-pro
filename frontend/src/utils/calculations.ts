// Логика расчетов биологического возраста

/**
 * Расчет по модели Levine (PhenoAge)
 */
export function calculatePhenoAge(
  age: number,
  albumin: number,
  creatinine: number,
  glucose: number,
  crp: number,
  lymphPct: number,
  mcv: number,
  rdw: number,
  alp: number,
  wbc: number
): number | null {
  try {
    const crpMgDl = crp > 0 ? crp / 10 : 0.01;
    const xb = -19.907 - 0.0336 * albumin + 0.0095 * creatinine + 0.1953 * glucose 
              + 0.0954 * Math.log(crpMgDl) - 0.0120 * lymphPct + 0.0268 * mcv 
              + 0.3306 * rdw + 0.0019 * alp + 0.0554 * wbc + 0.0804 * age;
    const gamma = 0.0076927;
    const m = 1 - Math.exp((-Math.exp(xb) * (Math.exp(120 * gamma) - 1)) / gamma);
    return Math.round((141.50 + (Math.log(-0.00553 * Math.log(1 - m))) / 0.090165) * 100) / 100;
  } catch {
    return null;
  }
}

/**
 * Расчет по методике Войтенко
 */
export function calculateVoitenko(
  gender: 'Мужской' | 'Женский',
  sbp: number,
  dbp: number,
  bht: number,
  sb: number,
  bw: number
): number | null {
  try {
    let ba: number;
    if (gender === 'Мужской') {
      ba = 26.985 + 0.215 * sbp - 0.155 * bht - 0.57 * sb + 0.445 * bw;
    } else {
      ba = -1.18 + 0.012 * sbp + 0.012 * dbp - 0.057 * bht - 0.50 * sb + 0.248 * bw;
    }
    return Math.round(ba * 100) / 100;
  } catch {
    return null;
  }
}

/**
 * Расчет интегрального возраста
 */
export function calculateIntegralAge(phenoAge: number, voitenko: number): number {
  return Math.round(((phenoAge + voitenko) / 2) * 100) / 100;
}
