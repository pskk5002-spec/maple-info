import { useState, useEffect } from 'react';
import '../styles/Crystal.css';
import CharacterCard from './CharacterCard';

const Crystal = ({data}: any) => {
    //선택한 월드
    const [selectedWorld, setSelectedWorld] = useState('');
    //선택한 캐릭터들(최대 8개)
    const [selectedChars, setSelectedChars] = useState<any[]>([]);

    //반드시 캐릭터 검색 후 이용해야 함!
    if (!data) {
        return (
        <div className="main-container">
            <div className='error-userguide'>
            메뉴 [캐릭터 정보]에서 먼저 닉네임을 검색해주세요!
            </div>
        </div>
        );
    }

    //배열 형태로 캐릭터 리스트를 받음
    const characterList = data?.list?.account_list[0]?.character_list || [];

    //월드 목록 추출 (= 중복 월드 제거, 캐릭터가 존재하는 월드만 추출)
    //Set(집합: 중복제거) -> Array.from으로 배열로 변환
    const worlds = Array.from(
        new Set(characterList.map((c:any)=> c.world_name))
    ) as string[];

    //첫 번째 캐릭터의 월드를 기본값으로 설정 (data 변경 시 발생)
    useEffect(()=>{
        if(characterList.length > 0 && !selectedWorld){
            setSelectedWorld(characterList[0].world_name);
        }
    }, [characterList, selectedWorld]);

    console.log("전체 데이터: ", data);
    console.log("추출된 리스트: ", characterList);
    console.log("추출된 월드: ", worlds);


    return(
        <div className='main-container'>
            <div className = 'main-title'>💵보스 결정 정산({data.basic.character_name})</div>
            <div className='result-wrapper'>
                <select 
                className='sf-select'
                value={selectedWorld}
                onChange={(e)=>setSelectedWorld(e.target.value)}>
                {worlds.map((world : string) =>{
                    return <option key = {world} value={world}>{world}</option>
                })}
                </select>
            </div>
        </div>
    );
}

export default Crystal;