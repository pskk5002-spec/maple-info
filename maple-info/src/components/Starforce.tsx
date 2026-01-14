import React, { useState } from 'react';
import Equipment from './Equipment';
import StarforceInput from './StarforceInput';
import StarforceResult from './StarforceResult';
import '../App.css';
import '../styles/Starforce.css';
import StarforceWorker from './workers/starforce.worker.ts?worker';

interface StarforceProps {
  data: any;
}

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

const Starforce: React.FC<StarforceProps> = ({ data }) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
  };


  const handleCalculate = (inputSettings: StarforceSettings) => {
    if (!selectedItem) {
      alert('장비 선택이 필요합니다.');
      return;
    }

    setLoading(true);
    setCalculationResult(null);

    const worker = new StarforceWorker();

    worker.postMessage({
      settings: inputSettings,
      item: selectedItem,
    });

    worker.onmessage = (e) => {
      setCalculationResult(e.data);
      setLoading(false);
      worker.terminate();
    };

    worker.onerror = (err) => {
      console.error(err);
      setLoading(false);
      worker.terminate();
    };
  };

  return (
    <div className="main-container">
      <h1 className="main-title">스타포스 기대값 계산기</h1>

      {loading && (
        <div style={{ textAlign: 'center', color: '#fff' }}>
          계산 중입니다… (10만 회 시뮬레이션)
        </div>
      )}

      <div className="result-container" style={{ alignItems: 'stretch' }}>
        <div className="section-card" style={{ flex: 1 }}>
          <Equipment
            items1={data.items.item_equipment_preset_1}
            items2={data.items.item_equipment_preset_2}
            items3={data.items.item_equipment_preset_3}
            onItemClick={handleItemSelect}
          />
        </div>

        <div className="section-card" style={{ flex: 1 }}>
          <StarforceInput
            selectedItem={selectedItem}
            onCalculate={handleCalculate}
          />
        </div>

        <div className="section-card" style={{ flex: 1 }}>
          <StarforceResult result={calculationResult} />
        </div>
      </div>
    </div>
  );
};

export default Starforce;
