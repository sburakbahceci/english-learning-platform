interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  bgColor?: string;
  textColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  bgColor = 'bg-blue-50',
  textColor = 'text-blue-600',
}: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-xl p-6 border border-gray-100`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}
