/// <reference lib="webworker" />

interface StarforceSettings {
  itemLevel: number;
  currentStar: number;
  targetStar: number;
  itemCost: number;
  event: string;
  mode: string;
  stepSettings: {
    [key: number]: {
      catch: boolean;
      guard: boolean;
    };
  };
}

const SUCCESS_RATE = [
  0.95, 0.9, 0.85, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55,
  0.5, 0.45, 0.4, 0.35, 0.3, 0.3, 0.3, 0.15, 0.15, 0.15,
  0.3, 0.15, 0.15, 0.1, 0.1, 0.1, 0.07, 0.05, 0.03, 0.01,
];

const DESTROY_RATE = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0.021, 0.021, 0.068, 0.068, 0.085,
  0.105, 0.1275, 0.17, 0.18, 0.18, 0.18, 0.186, 0.19, 0.194, 0.198,
];

self.onmessage = (e) => {
  const { settings } = e.data as { settings: StarforceSettings };
  const targetStar = settings.targetStar;
  const itemLevel = settings.itemLevel || 160;
  const levelCubed = itemLevel ** 3;
  const spareCost = Number(settings.itemCost || 0);

  // 1. 모든 성급의 확률과 비용 사전 계산
  const baseStats = Array.from({ length: 31 }, (_, s) => {
    const powStar = Math.pow(s + 1, 2.7);
    let base;
    if (s <= 9) base = 1000 + (levelCubed * (s + 1)) / 36;
    else if (s === 10) base = 1000 + (levelCubed * powStar) / 571;
    else if (s === 11) base = 1000 + (levelCubed * powStar) / 314;
    else if (s === 12) base = 1000 + (levelCubed * powStar) / 214;
    else if (s === 13) base = 1000 + (levelCubed * powStar) / 157;
    else if (s === 14) base = 1000 + (levelCubed * powStar) / 107;
    else if (s === 15) base = 1000 + (levelCubed * powStar) / 200;
    else if (s === 16) base = 1000 + (levelCubed * powStar) / 200;
    else if (s === 17) base = 1000 + (levelCubed * powStar) / 150;
    else if (s === 18) base = 1000 + (levelCubed * powStar) / 70;
    else if (s === 19) base = 1000 + (levelCubed * powStar) / 45;
    else if (s === 20) base = 1000 + (levelCubed * powStar) / 200;
    else if (s === 21) base = 1000 + (levelCubed * powStar) / 125;
    else base = 1000 + (levelCubed * powStar) / 200;

    const cfg = settings.stepSettings?.[s] ?? { catch: true, guard: false };
    let p_s = SUCCESS_RATE[s];
    let p_d = DESTROY_RATE[s];
    
    if (cfg.catch) p_s = Math.min(p_s * 1.05, 1);
    if ((settings.event === 'shining' || settings.event === 'destroy_reduce') && s >= 15 && s <= 21) {
      p_d *= 0.7;
    }

    const safeguard = cfg.guard && s >= 15 && s <= 17;
    if (safeguard) p_d = 0;

    let cost = safeguard ? base * 1.5 : base;
    if (settings.event === 'shining' || settings.event === '30%') cost *= 0.7;

    return { p_s, p_d, stepCost: Math.round(cost) };
  });

  /**
   * 2. 하락 없는 마르코프 체인 풀이
   * E[s] = (stepCost + p_s*E[s+1] + p_d*(spare + E[12])) / (p_s + p_d)
   * 이 식은 E[s] = A[s]*E[12] + B[s] 형태의 일차방정식입니다.
   */
  const A = new Array(31).fill(0); // E[12]의 계수
  const B = new Array(31).fill(0); // 상수항
  const AD = new Array(31).fill(0); // 파괴 횟수용 계수
  const BD = new Array(31).fill(0); // 파괴 횟수용 상수

  // 목표지점 기댓값은 0
  A[targetStar] = 0; B[targetStar] = 0;
  AD[targetStar] = 0; BD[targetStar] = 0;

  // 22성부터 12성까지 역순으로 계수 도출
  for (let s = targetStar - 1; s >= 12; s--) {
    const { p_s, p_d, stepCost } = baseStats[s];
    const denom = p_s + p_d;

    if (s === 12) {
      // 12성 자기참조 방정식 풀이
      // E[12] = (stepCost + p_s*(A[13]E[12] + B[13]) + p_d*spare) / p_s
      const e12 = (stepCost + p_s * B[13] + p_d * spareCost) / (p_s * (1 - A[13]));
      const d12 = (p_s * BD[13] + p_d) / (p_s * (1 - AD[13]));
      A[12] = 0; B[12] = e12;
      AD[12] = 0; BD[12] = d12;
    } else {
      // 계수 점화식 대입
      A[s] = (p_s * A[s + 1] + p_d) / denom;
      B[s] = (p_s * B[s + 1] + stepCost + p_d * spareCost) / denom;
      AD[s] = (p_s * AD[s + 1] + p_d) / denom;
      BD[s] = (p_s * BD[s + 1] + p_d) / denom;
    }
  }

  // 최종 기댓값 배열 확정
  const expCost = new Array(31).fill(0);
  const expDestroys = new Array(31).fill(0);
  const e12_val = B[12];
  const d12_val = BD[12];

  for (let s = 12; s <= targetStar; s++) {
    expCost[s] = A[s] * e12_val + B[s];
    expDestroys[s] = AD[s] * d12_val + BD[s];
  }

  // 11성부터 0성까지 역순 DP
  for (let s = 11; s >= 0; s--) {
    const { p_s, stepCost } = baseStats[s];
    expCost[s] = (stepCost + p_s * expCost[s + 1]) / p_s;
    expDestroys[s] = (p_s * expDestroys[s + 1]) / p_s;
  }

  self.postMessage({
    averageCost: expCost[settings.currentStar],
    averageDestruction: expDestroys[settings.currentStar],
    percentiles: { p50: expCost[settings.currentStar] },
    mode: 'markov',
  });
};