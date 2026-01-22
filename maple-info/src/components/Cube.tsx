import { useState, useEffect} from 'react';
import CubeResult from './CubeResult';

   /*잠재능력 확률(등급업)
    (블큐 똑같음)
    레어 -> 에픽 15%
    에픽 -> 유니크 3.5%
    유니크 -> 레전 1.4%
    ====(장큡)====
    레어 -> 에픽 4.7619%
    에픽 -> 유니크 1.1858%
    ====(명큡)====
    레어 -> 에픽 7.9994%
    에픽 -> 유니크 1.6959%
    유니크 -> 레전드리 0.1996%
    ====(에디)====
    레어 -> 에픽 2.3810%
    에픽 -> 유니크 0.9804%
    유니크 -> 레전드리 0.7000%
    ====(화에큡)====
    레어 -> 에픽 4.7619%
    에픽 -> 유니크 1.9608%
    유니크 -> 레전드리 0.7000%
    */


const POTENTIAL_RATES = {
    MESO : {
        RARE_TO_EPIC: 0.150000001275,
        EPIC_TO_UNIQUE: 0.035,
        UNIQUE_TO_LEGENDARY: 0.014,
    },
    JANGIN : {
        RARE_TO_EPIC: 0.047619,
        EPIC_TO_UNIQUE: 0.011858,
    },
    MYUNGJANG: {
        RARE_TO_EPIC: 0.079994,
        EPIC_TO_UNIQUE: 0.016959,
        UNIQUE_TO_LEGENDARY: 0.001996,
    },
    MESO_ADDITIONAL : {
        RARE_TO_EPIC: 0.02381,
        EPIC_TO_UNIQUE: 0.09804,
        UNIQUE_TO_LEGENDARY: 0.007,
    },
    WHITE_ADDITIONAL : {
        RARE_TO_EPIC: 0.047619,
        EPIC_TO_UNIQUE: 0.019608,
        UNIQUE_TO_LEGENDARY: 0.007,
    },
    STRANGE:{
        RARE_TO_EPIC: 0.04,
    },
}

const GRADE_ORDER: { [key: string]: number } = {
  rare: 1,
  epic: 2,
  unique: 3,
  legendary: 4
};

const ALL_GRADES = [
  { value: 'rare', label: '레어' },
  { value: 'epic', label: '에픽' },
  { value: 'unique', label: '유니크' },
  { value: 'legendary', label: '레전드리' },
];

const ITEMLEVEL_MESO = [
    { min: 1, max: 159, rare: 4000000, epic: 16000000, unique: 34000000, legendary: 40000000},
    { min: 160, max: 199, rare: 4250000, epic: 17000000, unique: 36125000, legendary: 42500000},
    { min: 200, max: 249, rare: 4500000, epic: 18000000, unique: 38250000, legendary: 45000000},
    { min: 250, max: 300, rare: 5000000, epic: 20000000, unique: 42500000, legendary: 50000000},
];

const Cube = () => {
    const [mode, setMode] = useState<string>('upgrade');
    const [cubeType, setCubeType] = useState<string>('mesoPotential');
    const [currentPotential, setCurrentPotential] = useState<string>('potential');
    const [currentGrade, setCurrentGrade] = useState<string>('rare');
    const [targetGrade, setTargetGrade] = useState<string>('epic');
    const [itemLevel, setItemLevel] = useState<number>(0);
    const [result, setResult] = useState<{ count: number; cost: number } | null>(null);

    useEffect(() => {
    // 목표 등급이 현재 등급보다 낮거나 같아지면, 현재 등급의 바로 다음 단계로 강제 설정
    if (GRADE_ORDER[targetGrade] <= GRADE_ORDER[currentGrade]) {
        if (currentGrade === 'rare') setTargetGrade('epic');
        else if (currentGrade === 'epic') setTargetGrade('unique');
        else if (currentGrade === 'unique') setTargetGrade('legendary');
    }
    }, [currentGrade]);

    const calcUpgrade = () => {
        if (!cubeType || !currentGrade || !targetGrade) {
            return alert("모든 옵션을 선택해주세요.");
        }

        const grades = ['rare', 'epic', 'unique', 'legendary'];
        const startIndex = grades.indexOf(currentGrade);
        const endIndex = grades.indexOf(targetGrade);

        if (startIndex >= endIndex) return;

        // 천장(보정) 테이블
        const CEILING_TABLE: { [key: string]: number[] } = {
            mesoPotential: [10, 42, 107],
            blackcube: [10, 42, 107],
            mesoAdditional: [62, 152, 214],
            redcube: [25, 83, 500],
            strangeAdditional: [31, 76, 214],
        };

        let totalExpectedCount = 0;
        let totalMesoCost = 0;

        // 121레벨 이상일 때 발생하는 큐브 감정 비용 (메소 재설정 시에는 미적용)
        const appraisalCost = itemLevel >= 121 ? 20 * Math.pow(itemLevel, 2) : 0;

        for (let i = startIndex; i < endIndex; i++) {
            const currentStepStr = grades[i];
            const nextStepStr = grades[i + 1];
            const rateKey = `${currentStepStr.toUpperCase()}_TO_${nextStepStr.toUpperCase()}`;

            // 1. 확률 테이블 매칭
            let rateTable;
            if (cubeType === 'mesoPotential' || cubeType === 'blackcube') rateTable = POTENTIAL_RATES.MESO;
            else if (cubeType === 'Jangin') rateTable = POTENTIAL_RATES.JANGIN;
            else if (cubeType === 'myunjang') rateTable = POTENTIAL_RATES.MYUNGJANG;
            else if (cubeType === 'mesoAdditional') rateTable = POTENTIAL_RATES.MESO_ADDITIONAL;
            else if (cubeType === 'whitecube') rateTable = POTENTIAL_RATES.WHITE_ADDITIONAL;
            else if (cubeType === 'strangecube') rateTable = POTENTIAL_RATES.STRANGE;

            const p = (rateTable as any)?.[rateKey];
            if (!p) {
                alert(`${cubeType}으로는 ${nextStepStr} 등급에 도달할 수 없습니다.`);
                return;
            }

            // 2. 천장 값 적용
            const ceilingRow = CEILING_TABLE[cubeType];
            const stackLimit = ceilingRow ? ceilingRow[i] : Infinity;

            let stepExpectedCount = 0;
            if (stackLimit && stackLimit !== Infinity) {
                stepExpectedCount = (1 - Math.pow(1 - p, stackLimit + 1)) / p;
            } else {
                stepExpectedCount = 1 / p;
            }

            totalExpectedCount += stepExpectedCount;

            // 3. 비용 계산 로직
            if (cubeType === 'mesoPotential' || cubeType === 'mesoAdditional') {
                // [메소 재설정] 감정 비용을 추가하지 않고 ITEMLEVEL_MESO 테이블 수치만 사용
                const levelConfig = ITEMLEVEL_MESO.find(item => itemLevel >= item.min && itemLevel <= item.max) 
                                    || ITEMLEVEL_MESO[0];
                const costPerTry = (levelConfig as any)[currentStepStr]; 
                totalMesoCost += stepExpectedCount * costPerTry;
            } else {
                // [아이템 큐브] 블랙, 장인, 명장, 화에큐 등은 매 클릭마다 '감정 비용' 발생
                totalMesoCost += stepExpectedCount * appraisalCost;
            }
        }

        setResult({ 
            count: totalExpectedCount, 
            cost: Math.floor(totalMesoCost) 
        });
    };

    return(
        <div className="main-container">
            <div className='main-title'>🔎잠재능력 계산기</div>
            <div className="result-container">
                {/* input, result 2개로 구현 
                모드 선택 => 정보 수집 => 계산*/}
                <div className = "section-card">
                    <div className = "input-form-wrapper">
                        <div className = "input-header">FORM</div>

                    {/* 1. 모드 선택 (우선순위)*/}
                    <div className = "input-group">
                        <div className='input-between'>
                            <div>
                        <div className = "mode-label-row">
                            <div className = "mode-title">모드 선택</div>
                        </div>
                        <select 
                            className='sf-select'
                            value={mode}
                            onChange={(e)=>setMode(e.target.value)}>
                            <option value = "upgrade">등급업</option>
                            <option value = "option">옵션</option>
                         </select>
                         </div>
                        <div>
                         <div className = "mode-label-row">
                            <div className = "mode-title">아이템 레벨</div>
                        </div>
                         <input 
                         className = "sf-input"
                         value={itemLevel}
                         max = {300}
                         min = {0}
                         onChange = {(e) => setItemLevel(Number(e.target.value))}
                         />
                         </div>
                         </div>
                    </div>

                    {/* 2. 등급업 (currentGrade, targetGrade) */}
                    { mode === 'upgrade' &&
                        <div className='input-group'>
                            <div className='input-between'>
                                <div>
                                    <div className='mode-label-row'>
                                    <div className = 'mode-title'>잠재/에디</div>
                                    </div>
                                    <select 
                                        className='sf-select'
                                        value={currentPotential}
                                        onChange={(e)=>setCurrentPotential(e.target.value)}>
                                        <option value = "potential">잠재능력</option>
                                        <option value = "additional">에디셔널</option>
                                    </select>
                                </div>
                                <div>
                                    <div className='mode-label-row'>
                                    <div className = 'mode-title'>소모</div>
                                    </div>
                                    <select 
                                        className='sf-select'
                                        value={cubeType}
                                        onChange={(e)=>setCubeType(e.target.value)}>
                                        { currentPotential === 'potential' ?(
                                        <>
                                        <option value = "mesoPotential">메소</option>
                                        <option value = "blackcube">블랙큐브</option>
                                        <option value = "Jangin">장인의큐브</option>
                                        <option value = "myunjang">명장의큐브</option>
                                        </>
                                        ):(
                                        <>
                                        <option value = "mesoAdditional">메소</option>
                                        <option value = "whitecube">화에큐</option>
                                        <option value = "strangecube">수큡</option>
                                        </>
                                        )
                                        }
                                       
                                    </select>
                                </div>
                            </div>
                            <div className='input-between'>
                                <div>
                                <div className='mode-label-row'>
                                    <div className = 'mode-title'>현재 등급</div>
                                        </div>
                                        <select 
                                            className='sf-select'
                                            value={currentGrade}
                                            onChange={(e)=>setCurrentGrade(e.target.value)}>
                                            <option value = "rare">레어</option>
                                            <option value = "epic">에픽</option>
                                            <option value = "unique">유니크</option>
                                        </select>
                                 </div>

                                 <div>
                                <div className='mode-label-row'>
                                    <div className = 'mode-title'>목표 등급</div>
                                        </div>
                                        <select 
                                            className='sf-select'
                                            value={targetGrade}
                                            onChange={(e)=>setTargetGrade(e.target.value)}>
                                            {ALL_GRADES
                                            .filter(grade => GRADE_ORDER[grade.value] > GRADE_ORDER[currentGrade])
                                            .map(grade => (
                                                <option key={grade.value} value={grade.value}>
                                                {grade.label}
                                                </option>
                                            ))
                                            }
                                        </select>
                                 </div>
                            </div>
                            <br />
                            <button className="calc-submit-btn" 
                            onClick={calcUpgrade}
                            onKeyDown={(e) => e.key === 'Enter' && calcUpgrade()}
                            >
                            기댓값 계산 시작
                            </button>
                        </div>
                    }
                    </div>
                </div>
                {/* 결과값 영역*/}
                <div className='section-card'>
                    <CubeResult result = { result }/>
                </div>
            </div>
        </div>
    )
}

export default Cube;