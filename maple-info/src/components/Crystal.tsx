import { useState, useEffect } from 'react';
import '../styles/Crystal.css';
import CharacterCard from './CharacterCard';

const Crystal = ({data}: any) => {
    //선택한 월드
    const [selectedWorld, setSelectedWorld] = useState('');
    //선택한 캐릭터들(최대 8개)
    const [selectedChars, setSelectedChars] = useState<any[]>([]);

    if (!data) {
        return (
        <div className="main-container">
            <div className='error-userguide'>
            메뉴 [캐릭터 정보]에서 먼저 닉네임을 검색해주세요!
            </div>
        </div>
        );
    }


    //첫 번째 캐릭터의 월드를 기본값으로 설정 (data 변경 시 발생)
    useEffect(()=>{
        if(data.list.length > 0){
            setSelectedWorld(data.list.account_list[0].character_list[0].world_name);
        }
    }, [data]);

    //월드 목록 추출 (= 중복 월드 제거, 캐릭터가 존재하는 월드만 추출)
    //Set(집합: 중복제거) -> Array.from으로 배열로 변환
    const worlds = Array.from(
        new Set(data.list.account_list[0].character_list.map((c:any)=> c.world_name) || [])
    );
    

    return(
        <div className='main-container'>
            
        </div>
    );
}

export default Crystal;