/// <reference lib="webworker" />

interface StarforceSettings {
  itemLevel: number;
  currentStar: number;
  targetStar: number;
  itemCost: number;
  event: string;
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

// 비용 계산용 분모 테이블
const COST_DIVISORS: { [key: number]: number } = {
  10: 571, 11: 314, 12: 214, 13: 157, 14: 107, 15: 200, 
  16: 200, 17: 150, 18: 70, 19: 45, 20: 200, 21: 125
};

self.onmessage = (e: MessageEvent) => {
  const { settings } = e.data as { settings: StarforceSettings };
  const ITERATIONS = 30_000;
  const itemLevel = settings.itemLevel || 160;
  const levelCubed = itemLevel ** 3;
  const spareCost = BigInt(settings.itemCost || 0);

  // --- 1. 사전 계산 (Pre-calculation) ---
  // 루프 안에서 if와 Math 연산을 아예 없애기 위해 모든 수치를 배열화합니다.
  const stepStats = new Array(31);
  
  for (let s = 0; s < 30; s++) {
    const cfg = settings.stepSettings?.[s] ?? { catch: true, guard: false };
    
    // 확률 계산
    let sRate = SUCCESS_RATE[s];
    let dRate = DESTROY_RATE[s];
    if (cfg.catch) sRate = Math.min(sRate * 1.05, 1);
    
    // 파괴 확률 보정 (이벤트)
    if ((settings.event === 'shining' || settings.event === 'destroy_reduce') && s >= 15 && s <= 21) {
      dRate *= 0.7;
    }

    // 비용 계산 (미리 BigInt화)
    const powStar = Math.pow(s + 1, 2.7);
    let baseCost;
    if (s <= 9) baseCost = 1000 + (levelCubed * (s + 1)) / 36;
    else baseCost = 1000 + (levelCubed * powStar) / (COST_DIVISORS[s] ?? 200);

    const safeguard = cfg.guard && s >= 15 && s <= 17;
    let finalCost = safeguard ? baseCost * 1.5 : baseCost;
    if (settings.event === 'shining' || settings.event === '30%') finalCost *= 0.7;

    stepStats[s] = {
      successThreshold: sRate,
      destroyThreshold: sRate + (safeguard ? 0 : dRate),
      cost: BigInt(Math.round(finalCost)),
      isSafeguard: safeguard
    };
  }

  // 결과 저장용 변수
  let sumCost = 0n;
  let sumDestroyed = 0;
  const samples = new BigUint64Array(ITERATIONS); // 메모리 효율을 위해 TypedArray 사용

  // --- 2. 메인 시뮬레이션 루프 ---
  for (let i = 0; i < ITERATIONS; i++) {
    let star = settings.currentStar;
    let totalCost = 0n;
    let destroyedCount = 0;

    while (star < settings.targetStar) {
      const stats = stepStats[star];
      totalCost += stats.cost;

      const roll = Math.random();
      
      if (roll < stats.successThreshold) {
        star++;
      } else if (roll < stats.destroyThreshold) {
        // 파괴 시
        destroyedCount++;
        totalCost += spareCost;
        star = 12;
      }
      // 실패 시 유지는 별도 처리 없이 다시 while문 처음으로 (star 변동 없음)
    }

    sumCost += totalCost;
    sumDestroyed += destroyedCount;
    samples[i] = totalCost;
  }

  // --- 3. 결과 가공 ---
  samples.sort();
  
  const p30 = Number(samples[Math.floor(ITERATIONS * 0.3)]);
  const p50 = Number(samples[Math.floor(ITERATIONS * 0.5)]);
  const p80 = Number(samples[Math.floor(ITERATIONS * 0.8)]);
  const p99 = Number(samples[Math.floor(ITERATIONS * 0.99)]);

  // 그래프 데이터 (샘플링 최적화)
  const cutoff = Math.floor(ITERATIONS * 0.999);
  const graphData = Array.from(samples.slice(0, cutoff)).map(v => Number(v));

  self.postMessage({
    averageCost: Number(sumCost / BigInt(ITERATIONS)),
    averageDestruction: sumDestroyed / ITERATIONS,
    percentiles: { p30, p50, p80, p99 },
    graphData,
    mode: 'simulation',
  });
};