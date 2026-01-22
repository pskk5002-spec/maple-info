interface CubeResultProps {
    result : {
        count: number;
        cost: number;
    } | null
}

const CubeResult = ({ result } :CubeResultProps) => {
    
    if(!result){
        return(
            <div className="result-placeholder">
                <p style={{marginBottom: '300px'}}>계산하기 버튼을 눌러주세요.</p>
            </div>
        )
    }

    return (
        <div className = 'result-wrapper'>
            <div className="input-header" style={{textAlign: 'center', fontSize: '30px'}}>RESULT</div>
            <div className="summary-set">
            <div className="summary-card">
              평균 시도 횟수
              </div>
              <span className="summary-value">약 {result.count.toFixed(2)}회</span>
            </div>
            <div className="summary-set">
            <div className="summary-card">
              평균 소모 비용
              </div>
              <span className="summary-value highlight">{result.cost.toLocaleString()}메소</span>
            </div>
        </div>
    )
}


export default CubeResult;