import '../styles/ItemTooltip.css';

interface Props {
  item: any;
  position: { x: number; y: number };
}

const ItemTooltip = ({ item, position }: Props) => {
  if (!item) return null;

  // 등급별 한글 명칭 및 색상 클래스 매핑
  const gradeClass = item.potential_option_grade?.toLowerCase() || '';
  const additionalGradeClass = item.additional_potential_option_grade?.toLowerCase() || '';

  const renderDetailOptions = (statType: string) => {
    const base = Number(item.item_base_option[statType] || 0);
    const add = Number(item.item_add_option[statType] || 0);
    const etc = Number(item.item_etc_option[statType] || 0);
    const star = Number(item.item_starforce_option[statType] || 0);

    // 상세 수치 중 하나라도 0보다 큰 게 있을 때만 괄호 영역 생성
    if (add === 0 && etc === 0 && star === 0) return null;

    return (
        <span className="detail-parentheses">
        ({base}
        {add > 0 && <span className="stat-add"> +{add}</span>}
        {etc > 0 && <span className="stat-etc"> +{etc}</span>}
        {star > 0 && <span className="stat-star"> +{star}</span>})
        </span>
    );
    };


  return (
    <div 
      className="item-tooltip"
      style={{ left: position.x + 20, top: position.y + 20 }}
    >
      {/* 1. 스타포스 */}
      <div className = "star">★{item.starforce}</div>

      {/* 2. 아이템 이름 및 강화 횟수 */}
      <div className={`item-name ${gradeClass}`}>
        {item.item_name} {item.scroll_upgrade > 0 && `(+${item.scroll_upgrade})`}
      </div>
      <div className="item-grade-text">
        ({item.potential_option_grade ? `${item.potential_option_grade} 아이템` : '일반 아이템'})
      </div>

      <hr className="dotted-line" />

      {/* 3. 아이템 이미지 및 기본 분류 */}
      <div className="item-main-info">
        <div className="item-img-box">
          <img src={item.item_icon} alt={item.item_name} />
        </div>
        <div className="item-type-info">
            <p>장비분류 : {item.item_equipment_part}</p>
            
            {/* 스탯들 */}
            {['str', 'dex', 'int', 'luk', 'max_hp', 'attack_power', 'magic_power'].map((stat) => {
                const total = item.item_total_option[stat];
                if (total <= 0) return null;

                // 표시 이름 변환 (예: attack_power -> 공격력)
                const statName = {
                str: 'STR', dex: 'DEX', int: 'INT', luk: 'LUK',
                max_hp: '최대 HP', attack_power: '공격력', magic_power: '마력'
                }[stat];

                return (
                <p key={stat}>
                    {statName} : +{total}
                    {renderDetailOptions(stat)}
                </p>
                );
            })}

            {/* 올스탯 예외 처리 */}
            {item.item_total_option.all_stat > 0 && (
            <p>
                올스탯 : +{item.item_total_option.all_stat}%
                <span className="detail-parentheses">
                (0%
                {Number(item.item_add_option.all_stat) > 0 && (
                    <span className="stat-add"> +{item.item_add_option.all_stat}%</span>
                )}
                {Number(item.item_etc_option.all_stat) > 0 && (
                    <span className="stat-etc"> +{item.item_etc_option.all_stat}%</span>
                )}
                </span>
                )
            </p>
            )}

            {/* 보공/방무는 %가 붙으므로 따로 처리 */}
            {item.item_total_option.boss_damage > 0 && (
                <p>보스 몬스터 공격 시 데미지 : +{item.item_total_option.boss_damage}% 
                {renderDetailOptions('boss_damage')}</p>
            )}
            {item.item_total_option.ignore_monster_armor > 0 && (
                <p>몬스터 방어율 무시 : +{item.item_total_option.ignore_monster_armor}% 
                {renderDetailOptions('ignore_monster_armor')}</p>
            )}
        </div>
      </div>

      <hr className="dotted-line" />

      {/* 4. 잠재능력 */}
      {item.potential_option_1 && (
        <div className="potential-section">
          <div className={`option-title ${gradeClass}`}>○ 잠재능력</div>
          <p>{item.potential_option_1}</p>
          <p>{item.potential_option_2}</p>
          <p>{item.potential_option_3}</p>
        </div>
      )}

      {/* 5. 에디셔널 잠재능력 */}
      {item.additional_potential_option_1 && (
        <div className="potential-section additional">
          <div className={`option-title ${additionalGradeClass}`}>○ 에디셔널 잠재능력</div>
          <p>{item.additional_potential_option_1}</p>
          <p>{item.additional_potential_option_2}</p>
          <p>{item.additional_potential_option_3}</p>
        </div>
      )}

      <hr className="dotted-line" />
      {/* 무기 소울 */}
      {item.soul_name && (
        <div className = "soul-section">
        <p>{item.soul_name}!</p>
        <p>*{item.soul_option}</p>
      </div>
      )}
    </div>
  );
};

export default ItemTooltip;