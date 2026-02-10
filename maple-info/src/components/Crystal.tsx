import '../styles/Crystal.css';
import CrystalList from './CrystalList';


const Crystal = () => {


    return(
        <div className='main-container'>
            <div className = 'main-title'>오프라인 보스 결정 정산</div>
            <div className='result-container'>
                <div className='section-card'>
                    <div className='result-wrapper crystal'>
                        오른쪽 입력창에서 캐릭터를 추가해보세요!<br />
                        해당 캐릭터의 [보스] 버튼을 클릭해서 보스 이름을 클릭하고,
                        결정을 팔아봅시다! <br />최대 8개의 캐릭터를 추가할 수 있으며,
                        한 캐릭터당 12개의 결정을 팔 수 있습니다! 주간 보스만 표시됩니다.
                        <br /> 페이지를 이동하면 정보가 초기화되니 주의해주세요.
                    </div>
                </div>
                <div className='section-card crystal'>
                    <CrystalList />
                </div>
            </div>
        </div>
    );
}

export default Crystal;