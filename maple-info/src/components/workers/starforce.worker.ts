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
  const ITERATIONS = 30_000;
  const itemLevel = settings.itemLevel || 160;
  const levelCubed = itemLevel ** 3;
  const spareCost = BigInt(settings.itemCost || 0);

  let sumCost = 0n;
  let sumDestroyed = 0;
  const samples: bigint[] = [];

  for (let i = 0; i < ITERATIONS; i++) {
    let star = settings.currentStar;
    let totalCost = 0n;
    let destroyed = 0;

    while (star < settings.targetStar) {
      const cfg = settings.stepSettings?.[star] ?? { catch: true, guard: false };
      let successRate = SUCCESS_RATE[star];
      let destroyRate = DESTROY_RATE[star];

      if ((settings.event === 'shining' || settings.event === 'destroy_reduce') && star >= 15 && star <= 21) {
        destroyRate *= 0.7;
      }
      if (cfg.catch) {
        successRate = Math.min(successRate * 1.05, 1);
      }

      const powStar = Math.pow(star + 1, 2.7);
      let baseCost;

      // 사용자 제공 공식 그대로 적용
      if (star <= 9) baseCost = 1000 + (levelCubed * (star + 1)) / 36;
      else if (star === 10) baseCost = 1000 + (levelCubed * powStar) / 571;
      else if (star === 11) baseCost = 1000 + (levelCubed * powStar) / 314;
      else if (star === 12) baseCost = 1000 + (levelCubed * powStar) / 214;
      else if (star === 13) baseCost = 1000 + (levelCubed * powStar) / 157;
      else if (star === 14) baseCost = 1000 + (levelCubed * powStar) / 107;
      else if (star === 15) baseCost = 1000 + (levelCubed * powStar) / 200;
      else if (star === 16) baseCost = 1000 + (levelCubed * powStar) / 200;
      else if (star === 17) baseCost = 1000 + (levelCubed * powStar) / 150;
      else if (star === 18) baseCost = 1000 + (levelCubed * powStar) / 70;
      else if (star === 19) baseCost = 1000 + (levelCubed * powStar) / 45;
      else if (star === 20) baseCost = 1000 + (levelCubed * powStar) / 200;
      else if (star === 21) baseCost = 1000 + (levelCubed * powStar) / 125;
      else baseCost = 1000 + (levelCubed * powStar) / 200;

      const safeguard = cfg.guard && star >= 15 && star <= 17;
      let stepCost = safeguard ? baseCost * 1.5 : baseCost;

      if (settings.event === 'shining' || settings.event === '30%') {
        stepCost *= 0.7;
      }

      totalCost += BigInt(Math.round(stepCost));

      const roll = Math.random();
      if (roll < successRate) {
        star++;
      } else if (!safeguard && roll < successRate + destroyRate) {
        destroyed++;
        totalCost += spareCost;
        star = 12; // 파괴 시 12성 복원
      } 
    }

    sumCost += totalCost;
    sumDestroyed += destroyed;
    samples.push(totalCost);
  }

  samples.sort((a, b) => (a < b ? -1 : 1));
  const cutoff = Math.floor(samples.length * 0.999);
  const trimmed = samples.slice(0, cutoff);

  self.postMessage({
    averageCost: Number(sumCost / BigInt(ITERATIONS)),
    averageDestruction: sumDestroyed / ITERATIONS,
    percentiles: {
      p30: Number(samples[Math.floor(samples.length * 0.3)]),
      p50: Number(samples[Math.floor(samples.length * 0.5)]),
      p80: Number(samples[Math.floor(samples.length * 0.8)]),
      p99: Number(samples[Math.floor(samples.length * 0.99)]),
    },
    graphData: trimmed.map(v => Number(v)),
    mode: 'simulation',
  });
};