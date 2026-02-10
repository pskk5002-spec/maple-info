import { useEffect, useState, useRef } from 'react';
import { Routes, Route, NavLink, useLocation} from 'react-router-dom';
import axios from 'axios';
import CharacterSearchPage from './components/CharacterSearchPage';
import './App.css';
import Starforce from './components/Starforce';
import Cube from './components/Cube';
import BossPettern from './components/BossPettern';
import PartyList from './components/PartyList'
import Crystal from './components/Crystal';

function App() {
  // 전역 데이터 상태
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  // 테마 (다크 OR 라이트 모드)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('color-theme') || 'light';
  });


  // URL
  const location = useLocation();

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 공통 검색 함수
  const searchCharacter = async (characterName: string) => {
    setLoading(true);

    try {
      const res = await axios.get('/api/character', {
        params: {characterName}
      });

      const { data, date } = res.data;

      setData(data);

      //캐시 저장
      localStorage.setItem(
        `maple-${characterName}`,
        JSON.stringify({
          date,
          data
        })
      );

    } catch (e: any) {
      console.error(e);
      if (e.response?.status === 429) {
        const cached = localStorage.getItem(`maple-${characterName}`);
        if (cached) {
          const parsed = JSON.parse(cached);
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

  useEffect(() => {
    // <html> 태그에 color-theme 속성을 설정합니다.
    document.documentElement.setAttribute('color-theme', theme);
    // 다음 접속을 위해 로컬스토리지에도 저장합니다.
    localStorage.setItem('color-theme', theme);
  }, [theme]); // theme 상태가 바뀔 때마다 실행됨

  useEffect(()=>{
    const params = new URLSearchParams(location.search);
    const characterNameFromUrl = params.get('name');

    if(!characterNameFromUrl) return;

    //캐시 우선 조회
    const cached = localStorage.getItem(`maple-${characterNameFromUrl}`);

    if(cached){
      const parsed = JSON.parse(cached);
      setData(parsed.data);
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
                to={`/`}
                className="sidebar-logo"
                onClick={() => {
                  window.innerWidth <= 768 && setIsSidebarOpen(false)
                  /* 로고 클릭시 데이터 날리고 데이터기준일 숨김 */
                  setData(null);

                  //테마는 그대로 유지하고 검색 기록 캐시만 전부 초기화
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('maple-')) {
                      localStorage.removeItem(key);
                    }
                  });
                }}
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
                <span>{isSidebarOpen ? '계산기' : '📟'}</span>
                {window.innerWidth <= 768 && <span>{isSubmenuOpen ? '▲' : '▼'}</span>}
              </NavLink>
              <div className = "submenu">
                <NavLink to = {`/calculator/starforce${location.search}`} className = "submenu-item" onClick = {()=>{setIsSubmenuOpen(false); window.innerWidth <= 768 && setIsSidebarOpen(false);}}>스타포스</NavLink>
                <NavLink to = {`/calculator/cube${location.search}`} className = "submenu-item" onClick = {()=>{setIsSubmenuOpen(false); window.innerWidth <= 768 && setIsSidebarOpen(false);}}>큐브</NavLink>
                <NavLink to = {`/calculator/crystal${location.search}`} className = "submenu-item" onClick = {()=>{setIsSubmenuOpen(false); window.innerWidth <= 768 && setIsSidebarOpen(false);}}>보스 결정 정산</NavLink>
              </div>
            </div>
            <NavLink to={`/bossfettern${location.search}`} className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              {isSidebarOpen ? '' : '🗡️'}
            </NavLink>
            <hr />
            <NavLink to={`/partylist${location.search}`} className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              {isSidebarOpen ? '파티 모집 게시판' : '📝'}
            </NavLink>
          </div>

          
          <div className="sidebar-footer">
              <button className="theme-toggle-btn" onClick={toggleTheme}>
                <span className="icon">{theme === 'light' ? '🌙' : '☀️'}</span>
                {/* 사이드바가 열려있을 때만 글자 표시 */}
                {isSidebarOpen && <span>{theme === 'light' ? '다크모드' : '라이트모드'}</span>}
              </button>
            </div>
        </nav>

        <div className="content-container">
          <Routes>
            <Route path="/" element={
              <CharacterSearchPage 
                data={data} 
                loading={loading} 
              />
            } />
            <Route path="/calculator/starforce" element={
              <Starforce data = {data}/>
            } />
            <Route path='/calculator/cube' element = {
              <Cube />
            }/>
            <Route path='/calculator/crystal' element = {
              <Crystal key={data?.basic?.character_name} />
            }/>
            <Route path="/bossfettern" element={
              <BossPettern />
            } />
            <Route path="/partylist" element={
              <PartyList data = {data}/>
            } />
          </Routes>
        </div>
      </div>
  );
}

export default App;