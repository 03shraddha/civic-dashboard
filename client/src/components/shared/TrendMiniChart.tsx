interface Props {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function TrendMiniChart({ data, color = '#6366f1', height = 30, width = 80 }: Props) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const lastIdx = data.length - 1;
  const lastX = lastIdx * stepX;
  const lastY = height - ((data[lastIdx] - min) / range) * (height - 4) - 2;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity="0.8"
      />
      <circle cx={lastX} cy={lastY} r="2" fill={color} />
    </svg>
  );
}
