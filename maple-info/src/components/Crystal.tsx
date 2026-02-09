import '../styles/Crystal.css';
import CrystalList from './CrystalList';


const Crystal = () => {


    return(
        <div className='main-container'>
            <div className = 'main-title'>오프라인 보스 결정 정산</div>
            <div className='result-wrapper'>
                <div className='section-card crystal'>
                    <CrystalList />
                </div>
            </div>
        </div>
    );
}

export default Crystal;