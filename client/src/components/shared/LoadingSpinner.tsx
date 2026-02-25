interface Props {
  size?: number;
  color?: string;
}

export function LoadingSpinner({ size = 24, color = '#6366f1' }: Props) {
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`,
      borderRadius: '50%',
      border: `2px solid ${color}20`,
      borderTopColor: color,
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  );
}
