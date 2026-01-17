import React, { useState, useEffect } from 'react';

interface StarforceInputProps {
  selectedItem: any;
  onCalculate: (settings: any) => void;
}

const StarforceInput: React.FC<StarforceInputProps> = ({ selectedItem, onCalculate }) => {
  const [targetStar, setTargetStar] = useState(22);
  const [itemCost, setItemCost] = useState<string>('');
  const [event, setEvent] = useState('none');
  const [itemLevel, setItemLevel] = useState(160);
  const [currentStar, setCurrentStar] = useState(0);

  //메소 포맷, useEffect 활용하여 실시간으로 포맷 제공
  const [formatMesoOut, setFormatMesoOut] = useState("");

  //모드 상태
  const [calcMethod, setCalcMethod] = useState<string>('');

  useEffect(() => {
    if (!selectedItem) return;

    setItemLevel(selectedItem.level);
    setCurrentStar(selectedItem.star);
    setItemCost(selectedItem.price);
  }, [selectedItem]);

  useEffect(()=>{
    setFormatMesoOut(formatMeso(Number(itemCost) || 0));
  }
  ,[itemCost])



  // 12성부터 21성까지 상세 설정 관리
  const [stepSettings, setStepSettings] = useState<{ [key: number]: { catch: boolean; guard: boolean } }>(
    Object.fromEntries(
      Array.from({ length: 18 }, (_, i) => [i + 12, { catch: true, guard: false }])
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
      itemCost: Number(itemCost) || 0,
      event,
      mode: calcMethod,
      stepSettings,
    });
  };

  const formatMeso = (meso: number) => {
  if (meso === 0) return '0';
  
  // 단위별 계산
  const trillion = Math.floor(meso / 1000000000000);
  const billion = Math.floor((meso % 1000000000000) / 100000000);
  const tenThousand = Math.floor((meso % 100000000) / 10000);
  const rest = Math.floor(meso % 10000); // 1만 미만 단위
  
  let result = '';
  if (trillion > 0) result += `${trillion}조 `;
  if (billion > 0) result += `${billion}억 `;
  if (tenThousand > 0) result += `${tenThousand}만 `;
  if (rest > 0) result += `${rest} `; // 천 단위 콤마 추가
  
  return result.trim();
};

  return (
    <div className="input-form-wrapper">
      <h2 className="input-header">장비 상세 옵션</h2>

      {/* 목표 및 매물 비용 */}
      <div className="input-group">
        <div className="input-between">
          <div className='input-lable'>
            목표 스타포스
            <input 
              type="number" 
              className="sf-input" 
              value={targetStar} 
              min = {0}
              max = {30}
              onChange={(e) => setTargetStar(Number(e.target.value))} 
            />
          </div>
          <div className='input-lable'>
            매물 비용(메소)
            <input 
              type="number" 
              className="sf-input" 
              placeholder="매물 비용" 
              value={itemCost}
              step={10000000}
              min = {0}
              onChange={(e) => setItemCost(e.target.value)} 
            />
            <div className='input-formatmeso'>{formatMesoOut || ' '}</div>
          </div>
        </div>
        <div className = "input-between">
          <div className='input-lable'>
            아이템 레벨
            <input
              type="number"
              className="sf-input"
              value={itemLevel}
              step={5}
              max = {300}
              min = {0}
              onChange={e => setItemLevel(Number(e.target.value))}
            />
          </div>

          <div className='input-lable'>
            현재 스타포스
            <input
              type="number"
              className="sf-input"
              value={currentStar}
              min={0}
              max={24}
              onChange={e => setCurrentStar(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 이벤트 선택 */}
      <div className="input-group">
        <div className='input-lable' style={ {fontSize: '20px'}}>썬데이 메이플</div>
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

      {/* 모드 선택 (시뮬, 마르코프 체인) */}
      <div className='input-group'>
        <div className='input-lable' style={ {fontSize: '18px'}}>모드 선택</div>
        <select 
        className='sf-select'
        value={calcMethod}
        onChange={(e)=>setCalcMethod(e.target.value)}>
          <option value = "simulation">시뮬레이션</option>
          <option value = "markov">마르코프 체인</option>
        </select>
      </div>

      {/* 구간별 상세 설정 테이블 */}
      <div className="input-group">
        <label>구간별 상세 설정</label>
        <div className="setting-scroll-area">
          <table className="detail-setting-table">
            <thead>
              <tr>
                <th>구간</th>
                <th>스타캐치</th>
                <th>파방</th>
              </tr>
            </thead>
            <tbody>
              {/* 12성부터 (targetStar - 1)성까지의 행을 생성 */}
              {Array.from({ length: Math.max(0, targetStar - 12) }, (_, i) => i + 12).map((s) => {
                // stepSettings[s]가 없을 경우를 대비해 초기값 제공 (방어 코드)
                const settings = stepSettings[s] || { catch: true, guard: false };
                
                return (
                  <tr key={s}>
                    <td className="star-label">{s}★ ➔ {s + 1}★</td>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={settings.catch} 
                        onChange={() => toggleSetting(s, 'catch')} 
                      />
                    </td>
                    <td>
                      {[15, 16, 17].includes(s) ? (
                        <input 
                          type="checkbox" 
                          checked={settings.guard} 
                          onChange={() => toggleSetting(s, 'guard')} 
                        />
                      ) : <span className="disabled-text">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <button className="calc-submit-btn" onClick={handleSubmit}>
        기댓값 계산 시작
      </button>
    </div>
  );
};

export default StarforceInput;