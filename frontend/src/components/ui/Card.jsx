// Two modes, one component:
// 1. Plain card 
//    <Card className="p-6">{children}</Card>
//
// 2. Stat card (AdminAnalytics StatCard, Dashbaord StatCard)
//    <Card title="Total Collected" value="₹12,000" icon="↓" color="red" hint="This month" />

const colors = {
  green:  '#22c55e',
  yellow: '#f59e0b',
  blue:   '#3b82f6',
  red:    '#ef4444',
  indigo: '#6366f1',
}

export default function Card({ children, className = '', title, value, icon, color, hint }) {
  if (title && value !== undefined) {
    const hex = colors[color] || colors.blue

    return (
      <div className={`panel p-4 relative overflow-hidden flex flex-col gap-[6px] ${className}`}>

        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]"
          style={{ background: hex }}
        />

        <div className="flex items-center gap-2">
          {icon && (
            <span
              className="text-[18px] w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${hex}25`, color: hex }}
            >
              {icon}
            </span>
          )}
          <span className="text-xs text-gray-400 font-medium">{title}</span>
        </div>

        <div className="text-3xl font-bold mt-1">{value}</div>

        {hint && <div className="text-xs text-slate-500">{hint}</div>}

      </div>
    )
  }

  return (
    <div className={`panel p-4 ${className}`}>
      {children}
    </div>
  )
}