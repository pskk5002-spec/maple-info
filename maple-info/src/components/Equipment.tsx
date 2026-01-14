import { useEffect, useState } from 'react';
import '../styles/Equipment.css';
import ItemTooltip from './ItemTooltip';

function Equipment({ items1, items2, items3, onItemClick }: any) {
  //툴팁 상태
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [mousePos, setMousePos] = useState({x: 0, y: 0});

  const calculateStarforceSum = (items: any[]) => {
    return items?.reduce((acc: number, item: any) => acc + (Number(item.starforce) || 0), 0) || 0;
  };

  const scores = [
    calculateStarforceSum(items1),
    calculateStarforceSum(items2),
    calculateStarforceSum(items3)
  ];

  const bestPresetNum = scores.indexOf(Math.max(...scores)) + 1;

  const [activePreset, setActivePreset] = useState(bestPresetNum);

  useEffect(()=>{
    setActivePreset(bestPresetNum);
  }, [items1, items2, items3, bestPresetNum]);

  const currentItems = activePreset === 1 ? items1 : activePreset === 2 ? items2 : items3;

  const itemMap = currentItems?.reduce((acc: any, item: any) => {
    // API에서 오는 정확한 슬롯명을 key로 저장
    acc[item.item_equipment_slot] = item;
    return acc;
  }, {}) || {};

  // 넥슨 API 표준 명칭 반영 (띄어쓰기 주의)
  const layout = [
    ["반지4", "null", "모자", "null", "엠블렘"],
    ["반지3", "펜던트2", "얼굴장식", "null", "뱃지"],
    ["반지2", "펜던트", "눈장식", "귀고리", "훈장"],
    ["반지1", "무기", "상의", "어깨장식", "보조무기"],
    ["포켓 아이템", "벨트", "하의", "장갑", "망토"],
    ["null", "null", "신발", "null", "기계 심장"]
  ];

  // 툴팁 핸들러 함수
  //맨 처음 마우스가 슬롯 안으로 들어갔을 때 아이템+좌표 입력
  const handleMouseEnter = (item: any, e: React.MouseEvent) =>{
    setHoveredItem(item);
    setMousePos({x: e.clientX, y: e.clientY});
  };
  //툴팁이 마우스를 따라다니도록 좌표 값 입력하기
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({x: e.clientX, y: e.clientY});
  };
  //커서가 슬롯 밖으로 나갔을 때 상태 null 값으로 입력하기
  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <div className="equipment-window">
      <div className="grid-container">
        {layout.flat().map((slotName, idx) => {
          const item = itemMap[slotName];
          // 아이템이 있거나, 'null'이 아닌 지정된 슬롯인 경우에만 슬롯 박스를 보여줌
          // 'null' 자리는 아예 투명하게 비워버립니다.

          return (
            <div 
              key={idx} 
              className={`slot ${!item ? 'empty' : ''} ${item?.potential_option_grade || ''}`}
              style={{ visibility: slotName === 'null' ? 'hidden' : 'visible' }}
              //마우스 이벤트 연결
              onClick={() =>
                item && onItemClick({
                  level: Number(item.item_base_option?.base_equipment_level ?? 0),
                  star: Number(item.starforce ?? 0),
                  price: Number(item.item_price ?? 0),
                  name: item.item_name, // (선택)
                })
              }
              onMouseEnter = {(e) => item && handleMouseEnter(item, e)}
              onMouseMove = {(e) => item && handleMouseMove(e)}
              onMouseLeave = {handleMouseLeave}
            >
              {item && (
                <img 
                  src={item.item_icon} 
                  alt={item.item_name}
                />
              )}
            </div>
          );
        })}
        {/*장비 프리셋 버튼*/}
        <div className="preset-controls">
          {[1, 2, 3].map((num) => (
            <button 
              key={num}
              className={`preset-btn ${activePreset === num ? 'active' : ''}`}
              onClick={() => setActivePreset(num)}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
      {/* 툴팁 컴포넌트 */}
      {hoveredItem && (
        <ItemTooltip item = {hoveredItem} position={mousePos} />
      )}
      
    </div>
  );
}

export default Equipment;