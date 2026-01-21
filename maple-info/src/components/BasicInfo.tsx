import '../styles/BasicInfo.css';
import { LEVEL_MAPS } from './workers/mapImages';

function BasicInfo({ basic }: any) {
  if (!basic) return null;

  const getMapData = (level : number) => {
    const mapData = LEVEL_MAPS.find(m => level >= m.min && level <= m.max);

    //해당 구간이 없을 경우 기본 배경
    return mapData || {name: '시작의마을', img: '/images/maps/시작의마을.png'};
  }

  const mapInfo = getMapData(basic.character_level);

  const cardStyle = {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${mapInfo.img})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'background-image 0.5s ease-in-out', // 배경 바뀔 때 부드럽게
    color: 'white'
  };

  return (
    <div className="basic-info-card">
      <div className="image-wrapper" style={cardStyle}>
        <img src={basic.character_image} alt="캐릭터 모습" className="character-img" />
      </div>
      
      <div className="info-content">
        <div className="world-badge">{basic.world_name}</div>
        <h2 className="char-name">{basic.character_name}</h2>
        
        <div className="detail-row">
          <span className="level-text">Lv.{basic.character_level}</span>
          <span className="divider">|</span>
          <span className="class-text">{basic.character_class}</span>
        </div>

        {basic.character_guild_name && (
          <div className="guild-tag">
            <span className="guild-label">길드</span>
            <span className="guild-name">{basic.character_guild_name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BasicInfo;