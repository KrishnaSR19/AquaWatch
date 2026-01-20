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
    <div
      className={`relative rounded-2xl p-5 flex justify-between items-center ${bg}
        transition-transform duration-200 hover:-translate-y-1 hover:shadow-md`}
    >
      {/* Left Content */}
      <div className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
          {title}
        </p>

        <h2 className="text-3xl font-semibold text-gray-900 leading-tight">
          {value}
        </h2>

        {trend && (
          <div
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              trendColor === "green"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            <span className="text-sm">
              {trendColor === "green" ? "↑" : "↓"}
            </span>
            {trend}
          </div>
        )}

        <p className="text-xs text-gray-500">
          {subtitle}
        </p>
      </div>

      {/* Icon */}
      <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/80 shadow-sm">
        {icon}
      </div>

      {/* Accent Bar */}
      <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-b-2xl bg-black/10" />
    </div>
  );
}
