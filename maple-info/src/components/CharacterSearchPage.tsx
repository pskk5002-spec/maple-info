import { useState, useEffect } from 'react';
import Equipment from '../components/Equipment.tsx';
import BasicInfo from '../components/BasicInfo.tsx';
import Stats from '../components/Stats.tsx';
import { useNavigate } from 'react-router-dom';

// Props 타입 정의 (App에서 받아올 항목들)
function CharacterSearchPage({ data, loading, selectedDate }: any) {
  const [characterName, setCharacterName] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const cleanName = characterName.trim();

    if(!cleanName) return alert("정보를 불러올 수 없습니다.");

    //URL 변경
    navigate(`/?name=${encodeURIComponent(cleanName)}`);
  }

  useEffect(() => {
    if (data && !new URLSearchParams(location.search).get('name')) {
      navigate(`/?name=${data.basic.character_name}`, { replace: true });
    }
  }, []);

  return (
    <div className="main-container">
      <h1 className='main-title'>Maple Info</h1>
      <div className="search-area">
        <img className = "yeti" src = "/images/characters/예티.webp" alt = "예티" />
        <input 
          className="search-input" 
          value={characterName} 
          onChange={(e) => setCharacterName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // 부모의 함수 실행
          placeholder='캐릭터 닉네임 입력'
        />
        <button className="search-button" onClick={handleSearch} disabled={loading}>
          {loading ? '검색 중...' : '검색'}
        </button>
        
        {selectedDate && (
            <span className="info-date">데이터 기준일: {selectedDate}</span>
        )}
      </div>

      {/* data가 있으면 표시 (App에서 관리하므로 유지됨) */}
      {data && (
        <div className='result-container'>
          <div className="section-card">
            <Equipment 
              items1={data.items.item_equipment_preset_1} 
              items2={data.items.item_equipment_preset_2} 
              items3={data.items.item_equipment_preset_3} 
            />
          </div>
          <div className="section-card">
            <BasicInfo basic={data.basic} />
          </div>
          <div className="section-card">
            <Stats 
              stats={data.stats.final_stat}
              ability={data.ability} 
              characterClass={data.basic.character_class}
              items={data.items}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CharacterSearchPage;