import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/PartyList.css';

const BOSS_CONFIG: { [key: string]: string[] } = {
    '스우': ['익스트림'],
    '검은마법사': ['하드', '익스트림'],
    '세렌': ['노말', '하드', '익스트림'],
    '칼로스': ['이지', '노말', '카오스', '익스트림'],
    '최초의대적자': ['이지', '노말', '하드', '익스트림'],
    '카링': ['이지', '노말', '하드', '익스트림'],
    '찬란한흉성': ['노말', '하드'],
    '림보': ['노말', '하드'],
    '발드릭스': ['노말', '하드'],
};

const PartyList = ({data}: any) => {
    const [posts, setPosts] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- 필터링 상태 ---
    const [filterBoss, setFilterBoss] = useState('전체');
    const [filterType, setFilterType] = useState('전체');

    // --- 입력 폼 상태 ---
    const [formData, setFormData] = useState({
        getType: '구인',
        boss: '검은마법사',
        difficulty: '하드',
        skill: '숙련',
        shortDescription: '',
        nickname: '',
        discord: '사용',
        memberCount: '1',
    });

    const fetchPosts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/posts');
            setPosts(res.data);
        } catch (err) {
            console.error("서버 연결 실패", err);
        }
    };

    const handleSubmit = async () => {
        if (!formData.nickname || !formData.shortDescription) return alert("모든 항목을 입력해주세요.");
        try {
            await axios.post('http://localhost:5000/api/posts', formData);
            setIsModalOpen(false);
            fetchPosts();
        } catch (err) {
            alert("등록 실패");
        }
    };

    const handleDelete = async (id : number) => {
        const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
        if(!confirmDelete) return;

        try{
            await axios.delete(`http://localhost:5000/api/posts/${id}`);
            alert('삭제 완료!');
            
            setPosts(posts => posts.filter(post => post.id !== id));
        }catch(err){
            console.error(err);
            alert('삭제 실패');
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const filteredPosts = posts.filter(post => {
        const matchBoss = filterBoss === '전체' || post.boss === filterBoss;
        // DB 컬럼명이 getType인지 type인지 확인 필요 (일단 getType으로 대응)
        const matchType = filterType === '전체' || post.getType === filterType;
        return matchBoss && matchType;
    });

    if (!data) {
    return (
      <div className="main-container">
        <div className='error-userguide'>
          메뉴 [캐릭터 정보]에서 먼저 닉네임을 검색해주세요!
        </div>
      </div>
    );
  }

    return (
        <div className='partylist-container'>
            <div className="party-board-wrapper">
                <div className='board-main-title'>Board</div>

                {/* 필터 및 등록 버튼 */}
                <div className='input-between' style={{ alignItems: 'center', marginBottom: '15px' }}>
                    <div className="section-card filter-bar" style={{ display: 'flex', gap: '10px', padding: '10px' }}>
                        <select onChange={(e) => setFilterType(e.target.value)} className="sf-select">
                            <option value="전체">구인/구직</option>
                            <option value="구인">구인</option>
                            <option value="구직">구직</option>
                        </select>
                        <select onChange={(e) => setFilterBoss(e.target.value)} className="sf-select">
                            <option value="전체">모든 보스</option>
                            {Object.keys(BOSS_CONFIG).map(bossName => (
                                <option key={bossName} value={bossName}>{bossName}</option>
                            ))}
                        </select>
                    </div>
                    <button className="write-open-btn" onClick={() => setIsModalOpen(true)}>등록</button>
                </div>

                {/* 게시판 목록 - Table 구조 */}
                <div className="section-card party-board-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <table className="party-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>유형</th>
                                <th style={{ width: '120px' }}>보스</th>
                                <th style={{ width: '80px' }}>난이도</th>
                                <th style={{ width: '80px' }}>숙련도</th>
                                <th style={{ width: '30px' }}>인원</th>
                                <th style={{ width: '70px' }}>디코</th>
                                <th>파티 설명</th>
                                <th style={{ width: '120px' }}>작성자</th>
                                <th style = {{ width: '60px'}}>삭제</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={7}><div className='empty-msg'>등록된 파티가 없습니다.</div></td>
                                </tr>
                            ) : (
                                filteredPosts.map(post => (
                                    <tr key={post.id} className="post-row-tr">
                                        <td className="text-center">
                                            <span className={`type-tag ${post.getType}`}>{post.getType}</span>
                                        </td>
                                        <td className="text-center"><b className="boss-name">{post.boss}</b></td>
                                        <td className="text-center">{post.difficulty}</td>
                                        <td className="text-center">
                                            {post.skill} 
                                        </td>
                                        <td className="text-center">
                                            {post.memberCount}
                                        </td>
                                        <td className="text-center dc-icon">
                                            {post.discord === '사용' ? '🎧' : post.discord === '논의' ? '💬' : '❌'}
                                        </td>
                                        <td className="col-desc-td" title={post.shortDescription}>
                                            <div className='col-party-intro'>{post.shortDescription}</div>
                                        </td>
                                        <td className="text-center user-nick">{post.nickname}</td>
                                        <td className='text-center'><button className='delete-btn' disabled = {data.basic.character_name !== post.nickname} onClick = {()=>handleDelete(post.id)}>삭제</button></td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 모집 등록 모달 */}
                {isModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3 className='input-lable'>파티 모집 등록</h3>
                            <div className="modal-grid">
                                <label>유형</label>
                                <select value={formData.getType} onChange={(e) => setFormData({ ...formData, getType: e.target.value })}>
                                    <option value="구인">구인</option>
                                    <option value="구직">구직</option>
                                </select>

                                <label>보스명</label>
                                <select
                                    value={formData.boss}
                                    onChange={(e) => {
                                        const selectedBoss = e.target.value;
                                        const defaultDiff = BOSS_CONFIG[selectedBoss][0];
                                        setFormData({ ...formData, boss: selectedBoss, difficulty: defaultDiff })
                                    }}>
                                    {Object.keys(BOSS_CONFIG).map(bossName => (
                                        <option key={bossName} value={bossName}>{bossName}</option>
                                    ))}
                                </select>

                                <label>난이도</label>
                                <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}>
                                    {BOSS_CONFIG[formData.boss]?.map((diff) => (
                                        <option key={diff} value={diff}>{diff}</option>
                                    ))}
                                </select>

                                {formData.getType === '구인' && (
                                    <>
                                        <label>인원</label>
                                        <input type="number" min="1" value={formData.memberCount} onChange={(e) => setFormData({ ...formData, memberCount: e.target.value })} />
                                    </>
                                )}

                                <label>숙련도</label>
                                <select value={formData.skill} onChange={(e) => setFormData({ ...formData, skill: e.target.value })}>
                                    <option value="트라이">트라이</option>
                                    <option value="초행">초행</option>
                                    <option value="반숙">반숙</option>
                                    <option value="숙련">숙련</option>
                                </select>

                                <label>닉네임</label>
                                <input value={formData.nickname} onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} placeholder="인게임 닉네임" />

                                <label>디스코드</label>
                                <select value={formData.discord} onChange={(e) => setFormData({ ...formData, discord: e.target.value })}>
                                    <option value="미사용">미사용</option>
                                    <option value="사용">사용</option>
                                    <option value="논의">논의</option>
                                </select>

                                <label className="full-width">파티 설명<div className='warnning-p'>{formData.shortDescription.length}/50</div></label>
                                <textarea className="full-width" maxLength= {50} value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} placeholder="상세 내용을 적어주세요" />
                            </div>
                            <div className="modal-btns">
                                <button onClick={handleSubmit} className="calc-submit-btn">등록</button>
                                <button onClick={() => setIsModalOpen(false)} className="cancel-btn">취소</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartyList;