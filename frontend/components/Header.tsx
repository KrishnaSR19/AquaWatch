export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">

        {/* Left Section */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            💧 DWLR Groundwater Dashboard
          </h1>
          <p className="text-sm text-slate-200 mt-1">
            AI-powered real-time groundwater monitoring, alerts & forecasting
          </p>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-end gap-1">
          <span className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Live Monitoring
          </span>
          <span className="text-xs text-slate-300">
            Updated just now
          </span>
        </div>

      </div>
    </header>
  );
}