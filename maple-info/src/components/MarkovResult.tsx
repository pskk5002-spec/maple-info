
const formatMeso = (meso: number) => {
  if (meso === 0) return '0';
  const trillion = Math.floor(meso / 1000000000000);
  const billion = Math.floor((meso % 1000000000000) / 100000000);
  const tenThousand = Math.floor((meso % 100000000) / 10000);
  
  let result = '';
  if (trillion > 0) result += `${trillion}조 `;
  if (billion > 0) result += `${billion}억 `;
  if (tenThousand > 0) result += `${tenThousand}만 `;
  
  return result.trim();
};


const MarkovResult = ({result}: any) =>{
    return(
        <div className="result-wrapper">
          <h2 className="input-header">
            평균 값 계산 결과(이론)
          </h2>
          <div className="summary-set">
            <div className="summary-card">
              평균 소모 비용
              </div>
              <span className="summary-value highlight">{formatMeso(result.averageCost)}</span>
            </div>
            <div className='summary-set'>
            <div className="summary-card">
              평균 파괴 횟수
              </div>
              <span className="summary-value">{result.averageDestruction.toFixed(2)}회</span>
            </div>
          <hr className = "hr-yellow" />
        </div>
    );
};

export default MarkovResult;