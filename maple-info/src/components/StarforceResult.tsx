import StarforceSimulation from './StarforceSimulation';
import MarkovResult from './MarkovResult';

const StarforceResult = ({ result }: any ) => {
  if (!result) {
    return (
      <div className="result-placeholder">
        <p>
          시뮬레이션 결과가 여기에 표시됩니다.<br />
          설정을 완료하고 '기댓값 계산 시작' 버튼을 눌러주세요.
        </p>
      </div>
    );
  }

  return (
    <div>
      {result.mode === 'simulation' ? (
        <StarforceSimulation result = {result}/>
      ) : (
        <MarkovResult result = {result} />
      )}
    </div>
  );
};


export default StarforceResult;