import {useState, useEffect} from 'react';
import '../styles/Stats.css';

function Stats({ stats, ability, characterClass }: any) {
  const [activePreset, setActivePreset] = useState(ability?.preset_no || 1);

  // 데이터가 새로 들어오면 현재 적용 중인 프리셋으로 초기화
  useEffect(() => {
    if (ability?.preset_no) setActivePreset(ability.preset_no);
  }, [ability]);

  const jobStatMap: Record<string, { main: string; sub: string }> = {
      // STR 위주
      "히어로": { main: "STR", sub: "DEX" },
      "팔라딘": { main: "STR", sub: "DEX" },
      "다크나이트": { main: "STR", sub: "DEX" },
      "아델": { main: "STR", sub: "DEX" },
      "소울마스터": { main: "STR", sub: "DEX" },
      "아란": { main: "STR", sub: "DEX" },
      "카이저": { main: "STR", sub: "DEX" },
      "데몬슬레이어": { main: "STR", sub: "DEX" },
      "제로": { main: "STR", sub: "DEX" },
      "렌": { main: "STR", sub: "DEX" },
      "미하일": { main: "STR", sub: "DEX" },
      "블래스터": { main: "STR", sub: "DEX" },
      "바이퍼": { main: "STR", sub: "DEX" },
      "아크": { main: "STR", sub: "DEX" },
      "은월": { main: "STR", sub: "DEX" },
      "스트라이커": { main: "STR", sub: "DEX" },
      "캐논슈터": { main: "STR", sub: "DEX" },
      // INT 위주
      "아크메이지(불,독)": { main: "INT", sub: "LUK" },
      "아크메이지(썬,콜)": { main: "INT", sub: "LUK" },
      "비숍": { main: "INT", sub: "LUK" },
      "라라": { main: "INT", sub: "LUK" },
      "플레임위자드": { main: "INT", sub: "LUK" },
      "배틀메이지": { main: "INT", sub: "LUK" },
      "에반": { main: "INT", sub: "LUK" },
      "루미너스": { main: "INT", sub: "LUK" },
      "일리움": { main: "INT", sub: "LUK" },
      "키네시스": { main: "INT", sub: "LUK" },
      // DEX 위주
      "보우마스터": { main: "DEX", sub: "STR" },
      "윈드브레이커": { main: "DEX", sub: "STR" },
      "신궁": { main: "DEX", sub: "STR" },
      "패스파인더": { main: "DEX", sub: "STR" },
      "와일드헌터": { main: "DEX", sub: "STR" },
      "메르세데스": { main: "DEX", sub: "STR" },
      "카인": { main: "DEX", sub: "STR" },
      "메카닉": { main: "DEX", sub: "STR" },
      "엔젤릭버스터": { main: "DEX", sub: "STR" },
      // LUK 위주
      "나이트로드": { main: "LUK", sub: "DEX" },
      "섀도어": { main: "LUK", sub: "DEX" },
      "나이트워커": { main: "LUK", sub: "DEX" },
      "듀얼블레이드": { main: "LUK", sub: "DEX" },
      "카데나": { main: "LUK", sub: "DEX" },
      "칼리": { main: "LUK", sub: "DEX" },
      "호영": { main: "LUK", sub: "DEX" },
      "팬텀": { main: "LUK", sub: "DEX" },
      // HP (데몬어벤져)
      "데몬어벤져": { main: "HP", sub: "STR" },
      // 제논 (올스탯이지만 편의상 설정)
      "제논": { main: "ALL", sub: "ALL" }
    };
  // 1. 해당 직업의 주/부스탯 정보 가져오기 (기본값 STR/DEX)
  const jobInfo = jobStatMap[characterClass] || { main: "STR", sub: "DEX" };

  // 2. API 데이터 배열에서 특정 스탯 수치 찾아내기
  const getStatValue = (name: string) => {
    return stats.find((s: any) => s.stat_name === name)?.stat_value || "0";
  };

  // 3. 주요 스탯들 추출
  const mainValue = getStatValue(jobInfo.main);
  const subValue = getStatValue(jobInfo.sub);
  const combatPower = getStatValue("전투력");

  // 현재 선택한 프리셋의 어빌 옵션 가져오기
  const currentAbility = ability?.[`ability_preset_${activePreset}`];
  const abilityInfo = currentAbility?.ability_info || [];

  return (
    <div className="stats-container">
      <div className="combat-power-box">
        {/* 상단: 전투력 및 주스탯, 부스탯 */}
        <span className="label">전투력</span>
        <span className="value orange">{Number(combatPower).toLocaleString()}</span>
      </div>

      <div className="main-stats-grid">
        <div className="stat-row highlight">
          <span className="label">주스탯 ({jobInfo.main})</span>
          <span className="value">{Number(mainValue).toLocaleString()}</span>
        </div>
        <div className="stat-row">
          <span className="label">부스탯 ({jobInfo.sub})</span>
          <span className="value">{Number(subValue).toLocaleString()}</span>
        </div>
        <hr />
        {/* 중단: 기타 공통 스탯들 */}
        <div className="stat-row highlight">
          <span className="label">보스 데미지</span>
          <span className="value">{getStatValue("보스 몬스터 데미지")}%</span>
        </div>
        <div className="stat-row highlight">
          <span className="label">방어율 무시</span>
          <span className="value">{getStatValue("방어율 무시")}%</span>
        </div>
        <div className="stat-row">
          <span className="label">크리티컬 확률</span>
          <span className="value">{getStatValue("크리티컬 확률")}%</span>
        </div>
        <div className="stat-row">
          <span className="label">버프 지속시간</span>
          <span className="value">{getStatValue("버프 지속시간")}%</span>
        </div>
        <div className="stat-row">
          <span className="label">재사용 대기시간 감소</span>
          <span className="value">{getStatValue("재사용 대기시간 감소 (초)")}초 / {getStatValue("재사용 대기시간 감소 (%)")}%</span>
        </div>
        <div className="stat-row">
          <span className="label">아케인포스</span>
          <span className="value">{getStatValue("아케인포스")}</span>
        </div>
        <div className="stat-row">
          <span className="label">어센틱포스</span>
          <span className="value">{getStatValue("어센틱포스")}</span>
        </div>
        <hr />
        {/* 하단: 어빌리티 영역 */}
        <div className="ability-section">
          <div className="ability-header">
            <span className="title">어빌리티</span>
          </div>
          
          <div className="ability-list">
            {abilityInfo.map((item: any, idx: number) => {
              // 각 줄의 등급에 맞는 클래스 추출 (레전드리, 유니크, 에픽, 레어)
              
              return (
                <div key={idx} className={`ability-row ${item.ability_grade}`}>
                  <span className="ability-dot">●</span>
                  <span className="ability-text">{item.ability_value}</span>
                </div>
              );
            })}
          </div>
          <br />

          {/* --- 우측 하단 프리셋 버튼 --- */}
          <div className="ability-presets">
            {[1, 2, 3].map((num) => (
              <button 
                key={num}
                className={`preset-small-btn ${activePreset === num ? 'active' : ''}`}
                onClick={() => setActivePreset(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;