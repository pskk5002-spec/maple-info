import { useState, useEffect } from 'react';
import { BOSS_LIST, BOSS_NAMES } from './BOSS_LIST';
/* 
캐릭터를 추가하고 해당 캐릭터 줄의 '보스 추가' 버튼을 누르면
모달을 띄우고 보스 초상화 grid를 선택하여 totalAccount에 추가함 
*/

interface Raider {
    //캐릭터 정보
    character_class: string;
    character_level: number;
    //캐릭터가 선택한 보스의 정보
    bosses: {
        bossName: string;
        diff: string;
        meso: number;
    }[];
}

//최대 선택할 수 있는 캐릭터
const MAX_CHARS = 8;

//직업 리스트
const CLASS_LIST = [
    "히어로", "팔라딘", "다크나이트", "소울마스터", "미하일", "블래스터",
    "데몬슬레이어", "데몬어벤져", "아란", "카이저", "아델", "렌", "제로",
    "아크메이지(불,독)", "아크메이지(썬,콜)", "비숍", "플레임위자드", "배틀메이지",
    "에반", "루미너스", "일리움", "라라", "키네시스", "보우마스터", "신궁",
    "패스파인더", "윈드브레이커", "와일드헌터", "메르세데스", "카인", "나이트로드",
    "섀도어", "듀얼블레이드", "나이트워커", "팬텀", "카데나", "칼리", "호영",
    "바이퍼", "캡틴", "캐논슈터", "스트라이커", "메카닉", "은월", "엔젤릭버스터", "아크", "제논"
];

const CrystalList = () => {
    // 캐릭터 추가 모달 상태
    const [isAddCharModalOpen, setIsAddCharModalOpen] = useState(false);
    // 보스 선택 모달 상태
    const [isBossModalOpen, setIsBossModalOpen] = useState(false);
    
    //선택한 캐릭터들(최대 8개)
    const [selectedChars, setSelectedChars] = useState<Raider[]>([]);
    //현재 보스를 선택 중인 캐릭터 index
    const [activeCharIndex, setActiveCharIndex] = useState<number | null>(null);

    const [selectedDiff, setSelectedDiff] = useState<Record<string, string>>({});

    //입력 상태
    const [inputClass, setInputClass] = useState('');
    const [inputLevel, setInputLevel] = useState<number | ''>('');

    //캐릭터별 메소 계산
    const getCharTotal = (raider: Raider) =>
        raider.bosses.reduce((sum, b) => sum + b.meso, 0);

    // 전체 계정 메소 합계
    const totalAccount = selectedChars.reduce(
        (sum, raider) => sum + getCharTotal(raider),
        0
    );

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

    // 캐릭터 추가
    const handleAddRaider = () => {
        //유효성 검사
        if (!inputClass || Number(inputLevel) <= 0 || Number(inputLevel) > 300) {
            alert("정확한 클래스와 레벨을 입력해주세요!");
            return;
        }

        if (selectedChars.length >= MAX_CHARS) {
            alert("총 8개 캐릭터까지 등록할 수 있습니다!");
            return;
        }
        
        if (!CLASS_LIST.includes(inputClass)) {
            alert("존재하지 않는 직업입니다.");
            setInputClass('');
            return;
        }

        //객체 생성
        const newRaider: Raider = {
            character_class: inputClass,
            character_level: Number(inputLevel),
            bosses: [],
        };

        setSelectedChars((prev) => [...prev, newRaider]);

        //입력창 초기화 및 모달 닫기
        setInputClass('');
        setInputLevel('');
        setIsAddCharModalOpen(false);
    };

    // 캐릭터 삭제
    const handleDelRaider = (targetIndex: number) => {
        setSelectedChars((prev) => prev.filter((_, index) => index !== targetIndex));
    };

    // 보스 추가 버튼 클릭 (특정 캐릭터)
    const handleOpenBossModal = (charIndex: number) => {
        setActiveCharIndex(charIndex);
        setIsBossModalOpen(true);
    };

    // 보스 선택/선택 취소
    const handleBossClick = (bossName: string) => {
        if (activeCharIndex === null) return;

        const exists = selectedChars[activeCharIndex].bosses.some(
            b => b.bossName === bossName
        );

        // 이미 선택된 보스라면 선택 취소
        if (exists) {
            setSelectedChars(prev =>
                prev.map((char, idx) =>
                    idx === activeCharIndex
                        ? {
                            ...char,
                            bosses: char.bosses.filter(b => b.bossName !== bossName)
                        }
                        : char
                )
            );
            return;
        }

        const diff = selectedDiff[bossName];
        if (!diff) {
            alert('난이도를 선택해주세요');
            return;
        }

        const boss = BOSS_LIST.find(
            b => b.name === bossName && b.diff === diff
        );
        if (!boss) return;

        setSelectedChars(prev =>
            prev.map((char, idx) =>
                idx === activeCharIndex
                    ? {
                        ...char,
                        bosses: [
                            ...char.bosses,
                            { bossName, diff, meso: boss.meso }
                        ]
                    }
                    : char
            )
        );
    };

    // 현재 active 캐릭터가 해당 보스를 선택했는지 확인
    const isBossSelected = (bossName: string) => {
        if (activeCharIndex === null || !selectedChars[activeCharIndex]) return false;

        return selectedChars[activeCharIndex].bosses.some(
            b => b.bossName === bossName
        );
    };

    // 난이도 초기화
    useEffect(() => {
        const initialDiffs: Record<string, string> = {};
        BOSS_NAMES.forEach(name => {
            const firstBoss = BOSS_LIST.find(b => b.name === name);
            if (firstBoss) initialDiffs[name] = firstBoss.diff;
        });
        setSelectedDiff(initialDiffs);
    }, []);

    return (
        <div className="input-form-wrapper crystal">
            <div className='input-between'>
                <div className='mode-title'>현재 캐릭터 수 {selectedChars.length}/{MAX_CHARS}</div>
                <button 
                    className="add-btn"
                    onClick={() => setIsAddCharModalOpen(true)}
                >
                    +
                </button>
            </div>
            
            {selectedChars.length > 0 && <div><br /><hr /><br /></div>}

            {/* 캐릭터 목록 */}
            {selectedChars.map((raider, index) => (
                <div className='raider-row' key={index}>
                    <div className='raider-set'>
                        <div className='level-lable'>{raider.character_level}</div>
                        <div className='class-lable' style={{fontSize: '18px'}}>{raider.character_class}</div>
                        <div className='meso-display'>
                            {formatMeso(getCharTotal(raider))}
                        </div>
                    </div>
                    <div className='raider-buttons'>
                        <button 
                            className='boss-add-btn'
                            onClick={() => handleOpenBossModal(index)}
                        >
                            보스
                        </button>
                        <button 
                            className='raider-del-btn'
                            onClick={() => handleDelRaider(index)}
                        >
                            삭제
                        </button>
                    </div>
                </div>
            ))}

            {/* 전체 계정 합계 */}
            {selectedChars.length > 0 && (
                <div className='total-account-display'>
                    <strong>전체 합계:</strong> {formatMeso(totalAccount)} 메소
                </div>
            )}

            {/* 캐릭터 추가 모달 */}
            {isAddCharModalOpen && (
                <div className='modal-overlay' onClick={() => setIsAddCharModalOpen(false)}>
                    <div className="modal-content add-char" onClick={(e) => e.stopPropagation()}>
                        <h3 className='mode-title' style={{fontSize: '20px'}}>캐릭터 추가</h3>
                        <div className='input-between'>
                            <div>
                                <div className='mode-label-row'>
                                    <div className='mode-title'>레벨</div>
                                </div>
                                <input 
                                    type="number"
                                    className='sf-input'
                                    placeholder='레벨'
                                    value={inputLevel}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setInputLevel(val === '' ? '' : Number(val));
                                    }}
                                    max={300}
                                    min={1}
                                />
                            </div>
                            <div>
                                <div className='mode-label-row'>
                                    <div className='mode-title'>직업</div>
                                </div>
                                <input 
                                    className='sf-input'
                                    placeholder='직업 입력/선택'
                                    list='job-options'
                                    value={inputClass}
                                    onChange={(e) => setInputClass(e.target.value)}
                                />
                                <datalist id='job-options'>
                                    {CLASS_LIST.map((job) => (
                                        <option key={job} value={job} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <button 
                                    className='modal-add-btn'
                                    onClick={handleAddRaider}
                                >
                                    추가
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 보스 선택 모달 */}
            {isBossModalOpen && activeCharIndex !== null && (
                <div className='modal-overlay' onClick={() => setIsBossModalOpen(false)}>
                    <div className="modal-content crystal" onClick={(e) => e.stopPropagation()}>
                        <h3 className='mode-title'>
                            {selectedChars[activeCharIndex].character_class} (Lv.{selectedChars[activeCharIndex].character_level}) - 보스 선택
                        </h3>
                        <br />
                        
                        <div className="boss-grid">
                            {BOSS_NAMES.map((bossName) => (
                                <div
                                    className={`boss-cell ${isBossSelected(bossName) ? 'selected' : ''}`}
                                    key={bossName}
                                    onClick={() => handleBossClick(bossName)}
                                >
                                    <div className='boss-name'>
                                        {bossName}
                                    </div>
                                    <select 
                                        className="boss-diff"
                                        value={selectedDiff[bossName] ?? ''}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) =>
                                            setSelectedDiff(prev => ({
                                                ...prev,
                                                [bossName]: e.target.value,
                                            }))
                                        }
                                    >
                                        {BOSS_LIST
                                            .filter(bossObj => bossObj.name === bossName)
                                            .map((bossObj) => (
                                                <option
                                                    key={`${bossObj.name}-${bossObj.diff}`}
                                                    value={bossObj.diff}
                                                >
                                                    {bossObj.diff}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            ))}
                        </div>
                        
                        <div className='modal-totalAccount'>
                            현재 캐릭터 메소: {getCharTotal(selectedChars[activeCharIndex]).toLocaleString()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrystalList;