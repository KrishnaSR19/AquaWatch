type KpiCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: string;
  trendColor?: "green" | "red";
  icon: React.ReactNode;
  bg?: string;
};

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendColor = "green",
  icon,
  bg = "bg-blue-50"
}: KpiCardProps) {
  return (
    <div className={`rounded-2xl p-6 flex justify-between items-center ${bg}`}>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h2 className="text-3xl font-bold mt-1">{value}</h2>

        {trend && (
          <p
            className={`text-sm mt-1 ${
              trendColor === "green" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend}
          </p>
        )}

        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>

      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow">
        {icon}
      </div>
    </div>
  );
}
