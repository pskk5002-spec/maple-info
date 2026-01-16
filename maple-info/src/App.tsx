import { useEffect, useState, useRef } from 'react';
import { Routes, Route, NavLink, useLocation} from 'react-router-dom';
import axios from 'axios';
import CharacterSearchPage from './components/CharacterSearchPage';
import './App.css';
import Starforce from './components/Starforce';
import BossPettern from './components/BossPettern';

function App() {
  // 전역 데이터 상태
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const location = useLocation();

  const lastSearchedName = useRef<string>('');


  // 날짜 계산 로직
  const getQueryDate = () => {
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    const hour = kstDate.getUTCHours();
    const daysToSubtract = hour < 2 ? 2 : 1;
    const targetDate = new Date(kstDate.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
    return targetDate.getUTCFullYear() + '-' + String(targetDate.getUTCMonth() + 1).padStart(2, '0') + '-' + String(targetDate.getUTCDate()).padStart(2, '0');
  };

  // 공통 검색 함수
  const searchCharacter = async (characterName: string) => {
    if (loading || lastSearchedName.current === characterName) return alert("정보를 불러올 수 없습니다.");
    setLoading(true);
    const API_KEY = "test_f423d61cc0c4628d1aa3d764f91123979613bb1d1bd77ce6ff5e9cf3261893eaefe8d04e6d233bd35cf2fabdeb93fb0d";
    const targetDate = getQueryDate();
    setSelectedDate(targetDate);

    try {
      const idRes = await axios.get(`/api/maplestory/v1/id?character_name=${encodeURIComponent(characterName)}`, { headers: { 'x-nxopen-api-key': API_KEY } });
      const ocid = idRes.data.ocid;

      const [basicRes, statRes, itemRes, abilityRes] = await Promise.all([
        axios.get(`/api/maplestory/v1/character/basic?ocid=${ocid}&date=${targetDate}`, { headers: { 'x-nxopen-api-key': API_KEY } }),
        axios.get(`/api/maplestory/v1/character/stat?ocid=${ocid}&date=${targetDate}`, { headers: { 'x-nxopen-api-key': API_KEY } }),
        axios.get(`/api/maplestory/v1/character/item-equipment?ocid=${ocid}&date=${targetDate}`, { headers: { 'x-nxopen-api-key': API_KEY } }),
        axios.get(`/api/maplestory/v1/character/ability?ocid=${ocid}&date=${targetDate}`, { headers: { 'x-nxopen-api-key': API_KEY } }),
      ]);

      const resultData = {
        basic: basicRes.data,
        stats: statRes.data,
        items: itemRes.data,
        ability: abilityRes.data,
      };

      setData(resultData);

      //캐시 저장
      localStorage.setItem(
        `maple-${characterName}`,
        JSON.stringify({
          date: targetDate,
          data: resultData,
        })
      );

      lastSearchedName.current = characterName;
    } catch (e: any) {
      console.error(e);
      if (e.response?.status === 429) {
        const cached = localStorage.getItem(`maple-${characterName}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setSelectedDate(parsed.date);
          setData(parsed.data);
          alert("API 호출 제한으로 저장된 데이터를 표시합니다.");
          return;
        }
      }

      alert("데이터를 가져오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    const params = new URLSearchParams(location.search);
    const characterNameFromUrl = params.get('name');

    if(!characterNameFromUrl) return;

    //캐시 우선 조회
    const cached = localStorage.getItem(`maple-${characterNameFromUrl}`);

    if(cached){
      const parsed = JSON.parse(cached);
      setSelectedDate(parsed.date);
      setData(parsed.data);
      lastSearchedName.current = characterNameFromUrl;
      return;
    }

    searchCharacter(characterNameFromUrl);
  }, [location.search]);


  // 사이드바 토글 함수
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 사이드바 서브메뉴 핸들러
  const handleCalcMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if(window.innerWidth <= 768){
      setIsSubmenuOpen(!isSubmenuOpen);
    }
  };


  return (
      <div className={`app-layout ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
        {/* 모바일에서만 보이는 버튼 추가 */}
        <button className = "mobile-fab" onClick = {toggleSidebar}>
          {isSidebarOpen ? 'X' : '☰'}
        </button>

        <nav className="sidebar">
          <div className="sidebar-header">
            <NavLink
                to={`/${location.search}`}
                className="sidebar-logo"
                onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
              >
                {isSidebarOpen ? 'MAPLE INFO' : 'M'}
              </NavLink>
            <button className="toggle-btn" onClick={toggleSidebar}>
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          </div>
          
          <div className="sidebar-menu">
            <NavLink to={`/${location.search}`} 
            className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
            onClick = {() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
            >
              <span>{isSidebarOpen ? '캐릭터 정보' : '👤'}</span> { isSidebarOpen && data === null &&
              <span className = "search-hint">◀ 검색!</span>}
            </NavLink>
            <hr />
            <div className = {`menu-wrapper ${isSubmenuOpen ? 'open' : ''}`}>
              <NavLink 
                to="/calculator" 
                className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
                onClick={handleCalcMenuClick} // 클릭해도 페이지 이동 방지
                style={{ cursor: 'default' }}
              >
                <span>{isSidebarOpen ? '기대값 계산기' : '📟'}</span>
                {window.innerWidth <= 768 && <span>{isSubmenuOpen ? '▲' : '▼'}</span>}
              </NavLink>
              <div className = "submenu">
                <NavLink to = {`/calculator/starforce${location.search}`} className = "submenu-item" onClick = {()=>{setIsSubmenuOpen(false); window.innerWidth <= 768 && setIsSidebarOpen(false);}}>스타포스</NavLink>
                <NavLink to = {`/calculator/cube${location.search}`} className = "submenu-item" onClick = {()=>{setIsSubmenuOpen(false); window.innerWidth <= 768 && setIsSidebarOpen(false);}}>큐브</NavLink>
                <NavLink to = {`/calculator/add-option${location.search}`} className = "submenu-item" onClick = {()=>{setIsSubmenuOpen(false); window.innerWidth <= 768 && setIsSidebarOpen(false);}}>추가옵션</NavLink>
              </div>
            </div>
            <NavLink to={`/bossfettern${location.search}`} className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              {isSidebarOpen ? '보스 패턴 공략' : '🗡️'}
            </NavLink>
          </div>
        </nav>

        <div className="content-container">
          <Routes>
            <Route path="/" element={
              <CharacterSearchPage 
                data={data} 
                loading={loading} 
                selectedDate={selectedDate} 
              />
            } />
            <Route path="/calculator/starforce" element={
              <Starforce data = {data}/>
            } />
            <Route path="/bossfettern" element={
              <BossPettern />
            } />
          </Routes>
        </div>
      </div>
  );
}

export default App;