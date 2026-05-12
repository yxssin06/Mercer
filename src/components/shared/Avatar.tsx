interface Props { initials: string; tone?: number; size?: number; }

export function Avatar({ initials, tone = 175, size = 48 }: Props) {
  return (
    <div
      className="avatar"
      style={{
        width: size, height: size,
        background: `oklch(0.93 0.04 ${tone})`,
        color: `oklch(0.35 0.06 ${tone})`,
        fontSize: Math.round(size * 0.42),
      }}
    >
      {initials}
    </div>
  );
}
