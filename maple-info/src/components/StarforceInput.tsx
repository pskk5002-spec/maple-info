import React, { useState, useEffect } from 'react';

interface StarforceInputProps {
  selectedItem: any;
  onCalculate: (settings: any) => void;
}

const StarforceInput: React.FC<StarforceInputProps> = ({ selectedItem, onCalculate }) => {
  const [targetStar, setTargetStar] = useState(22);
  const [itemCost, setItemCost] = useState(0);
  const [event, setEvent] = useState('none');
  const [itemLevel, setItemLevel] = useState(160);
  const [currentStar, setCurrentStar] = useState(0);

  useEffect(() => {
    if (!selectedItem) return;

    setItemLevel(selectedItem.level);
    setCurrentStar(selectedItem.star);
    setItemCost(selectedItem.price);
  }, [selectedItem]);



  // 12성부터 21성까지 상세 설정 관리
  const [stepSettings, setStepSettings] = useState<{ [key: number]: { catch: boolean; guard: boolean } }>(
    Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [i + 12, { catch: true, guard: false }])
    )
  );

  const toggleSetting = (star: number, type: 'catch' | 'guard') => {
    setStepSettings(prev => ({
      ...prev,
      [star]: { ...prev[star], [type]: !prev[star][type] }
    }));
  };

  const handleEventChange = (eventId: string) => {
    setEvent(prev => prev === eventId ? 'none' : eventId);
  };

  const handleSubmit = () => {
    onCalculate({
      itemLevel,
      currentStar,
      targetStar,
      itemCost,
      event,
      stepSettings,
    });
  };

  return (
    <div className="input-form-wrapper">
      <h2 className="input-header">장비 상세 옵션</h2>

      {/* 목표 및 매물 비용 */}
      <div className="input-group">
        <label>목표 및 매물 비용</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="number" className="sf-input" value={targetStar} onChange={(e) => setTargetStar(Number(e.target.value))} />
          <input type="number" className="sf-input" placeholder="매물 비용(메소)" onChange={(e) => setItemCost(Number(e.target.value))} />
        </div>
        <label>
          아이템 레벨
          <input
            type="number"
            value={itemLevel}
            onChange={e => setItemLevel(Number(e.target.value))}
          />
        </label>

        <label>
          현재 스타포스
          <input
            type="number"
            value={currentStar}
            min={0}
            max={24}
            onChange={e => setCurrentStar(Number(e.target.value))}
          />
        </label>
      </div>

      {/* 이벤트 선택 */}
      <div className="input-group">
        <label>이벤트 선택</label>
        <div className="event-check-group">
          {[
            { id: '30%', label: '비용 30% 할인' },
            { id: 'destroy_reduce', label: '파괴확률 30% 감소' },
            { id: 'shining', label: '샤이닝 (30% 할인 + 파괴 30% 감소)' }
          ].map(opt => (
            <label key={opt.id} className="event-check-item">
              <input type="checkbox" checked={event === opt.id} onChange={() => handleEventChange(opt.id)} />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 구간별 상세 설정 테이블 */}
      <div className="input-group">
        <label>구간별 상세 설정</label>
        <div className="setting-scroll-area">
          <table className="detail-setting-table">
            <thead>
              <tr>
                <th>구간</th>
                <th>스캐</th>
                <th>파방</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(stepSettings).map((star) => {
                const s = Number(star);
                if (s >= targetStar) return null;
                return (
                  <tr key={s}>
                    <td className="star-label">{s}★ ➔ {s + 1}★</td>
                    <td>
                      <input type="checkbox" checked={stepSettings[s].catch} onChange={() => toggleSetting(s, 'catch')} />
                    </td>
                    <td>
                      {/* 파방 가능 구간: 15, 16, 17성 (정정된 규칙 반영) */}
                      {[15, 16, 17].includes(s) ? (
                        <input type="checkbox" checked={stepSettings[s].guard} onChange={() => toggleSetting(s, 'guard')} />
                      ) : <span className="disabled-text">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <button className="calc-submit-btn" onClick={handleSubmit} disabled={!selectedItem}>
        기대값 계산 시작
      </button>
    </div>
  );
};

export default StarforceInput;