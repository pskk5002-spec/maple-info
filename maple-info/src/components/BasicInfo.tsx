import '../styles/BasicInfo.css';

function BasicInfo({ basic }: any) {
  if (!basic) return null;

  return (
    <div className="basic-info-card">
      <div className="image-wrapper">
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