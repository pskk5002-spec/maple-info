import React from 'react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { ReferenceLine } from 'recharts';

interface StarforceResultProps {
  result: {
    averageCost: number;
    averageDestruction: number;
    percentiles: {
      p30: number;
      p50: number;
      p80: number;
      p99: number;
    };
    graphData: number[];
  } | null;
  
  mode: string;
}

// 메소 단위를 한국어 읽기 방식으로 변환 (조, 억, 만)
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

const StarforceResult: React.FC<StarforceResultProps> = ({ result, mode }) => {

  if (!result) {
    return (
      <div className="result-placeholder">
        <p>
          시뮬레이션 결과가 여기에 표시됩니다.<br />
          설정을 완료하고 '기대값 계산 시작' 버튼을 눌러주세요.
        </p>
      </div>
    );
  }

  // 그래프 데이터 가공 (억 단위로 변환하여 시각화 용이하게 함)
  const chartData = result.graphData.map((cost, index) => ({
  percentile: (index / (result.graphData.length - 1)) * 100,
  cost: cost / 100_000_000, // 억 단위
}));


  return (
    <div className="result-wrapper">
      <h2 className="input-header">
        시뮬레이션 결과 ({result.graphData.length.toLocaleString()}회)
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

      <div className="percentile-section">
        <h3>운 순위별 소모 비용</h3>
        <table className="percentile-table">
          <thead>
            <tr>
              <th>상위 %</th>
              <th>상태</th>
              <th>소모 비용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>30%</td>
              <td style={{ color: '#4db8ff' }}>😀</td>
              <td>{formatMeso(result.percentiles.p30)}</td>
            </tr>
            <tr>
              <td>50%</td>
              <td>😊</td>
              <td>{formatMeso(result.percentiles.p50)}</td>
            </tr>
            <tr>
              <td>80%</td>
              <td style={{ color: '#ff9900' }}>😱</td>
              <td>{formatMeso(result.percentiles.p80)}</td>
            </tr>
            <tr>
              <td>99%</td>
              <td style={{ color: '#ff4d4d' }}>💀</td>
              <td className="danger-text">{formatMeso(result.percentiles.p99)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="chart-section">
        <h3>누적 비용 분포 그래프 (단위: 억)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff9100" stopOpacity={0.9} />
                <stop offset="70%" stopColor="#ffb347" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#ffb347" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="5 5" stroke="#444" />
            <XAxis
              dataKey="percentile"
              type="number"
              domain={[0, 100]}
              stroke="#ccc"
              axisLine={{ stroke: '#000000', strokeWidth: 2 }}
              tickLine={{ stroke: '#000000' }}
              tickFormatter={(tick) => `${Math.round(tick)}%`}
            />
            <YAxis 
              stroke="#ccc"
              axisLine={{ stroke: '#000000', strokeWidth: 2 }}
              tickLine={{ stroke: '#000000' }}
               />
            <Tooltip 
              contentStyle={{ backgroundColor: '#222', border: '1px solid #444444', color: '#fff' }}
              formatter={(value) => [`약 ${Number(value).toFixed(1)}억 메소`, '누적 비용']}
              labelFormatter={(label) => `운 상위 ${Number(label).toFixed(1)}%`}
            />
            <ReferenceLine
                x={50}
                stroke="#2d16ff"
                strokeDasharray="0"
                strokeWidth = '2'
              />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#ff9100"
              strokeWidth={2}
              fill="url(#colorCost)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StarforceResult;