import React, { useState } from 'react';
import Equipment from './Equipment';
import StarforceInput from './StarforceInput';
import StarforceResult from './StarforceResult';
import '../App.css';
import '../styles/Starforce.css';
import StarforceWorker from './workers/starforce.worker.ts?worker';
import MarkovWorker from './workers/markov.worker?worker';

interface StarforceProps {
  data: any;
}

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

const Starforce: React.FC<StarforceProps> = ({ data }) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resultMode, setResultMode] = useState<string>('simulation');

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
  };

  const handleCalculate = (inputSettings: StarforceSettings) => {
    setLoading(true);
    setCalculationResult(null);

    setResultMode(inputSettings.mode);

    console.log(resultMode);

    let worker = new StarforceWorker();

    if(inputSettings.mode === 'markov'){
      worker = new MarkovWorker();
    }

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


  if (!data) {
    return (
      <div className="main-container">
        <div className='error-userguide'>
          메뉴 [캐릭터 정보]에서 먼저 닉네임을 검색해주세요!
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <h1 className="main-title">스타포스 기댓값 계산기</h1>

      {loading && (
        <div style={{ textAlign: 'center', color: '#888' }}>
          계산 중입니다… (3만 회 시뮬레이션)
        </div>
      )}

      <div className="result-container">
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

        <div className="section-card" style={{ flex: 1, minHeight: 700}}>
          <StarforceResult result={calculationResult} mode = {resultMode}/>
        </div>
      </div>
    </div>
  );
};

export default Starforce;
