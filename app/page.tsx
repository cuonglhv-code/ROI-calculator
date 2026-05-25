"use client";

import { useState, useRef } from "react";
import { 
  BarChart3, 
  Download, 
  RefreshCcw, 
  Users, 
  BookOpen, 
  CreditCard, 
  TrendingUp, 
  ArrowRight,
  Calculator,
  Info,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Percent,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Recommendation {
  type: "warning" | "info" | "success";
  text: string;
}

interface Results {
  totalFixedCost: number;
  totalVariableCost: number;
  totalCost: number;
  totalRevenue: number;
  profit: number;
  roiPercent: number;
  interpretation: string;
  breakEvenStudents: number;
  costPerStudent: number;
  marginPerStudent: number;
  instructorCostPerStudent: number;
  revenuePerInstructorHour: number;
  // Advanced Financial Audit metrics
  contributionMarginRatio: number;
  breakEvenRevenue: number;
  safetyMarginPercent: number;
  operatingLeverage: number;
  teachingCostRatio: number;
  acquisitionCostRatio: number;
  healthScore: number;
  recommendations: Recommendation[];
}

export default function ROICalculator() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const rawData = new FormData(form);
    const data = Object.fromEntries(rawData.entries()) as Record<string, string>;
    setFormData(data);

    try {
      const res = await fetch("/api/calculate-roi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resJson = await res.json();
      
      if (!res.ok) {
        throw new Error(resJson.error || "Tính toán thất bại");
      }
      
      setResults(resJson);
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra. Vui lòng kiểm tra lại thông tin nhập vào.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num: number) => 
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);

  const downloadCSV = () => {
    if (!results) return;

    const rows = [
      ["BÁO CÁO PHÂN TÍCH TÀI CHÍNH & KIỂM TOÁN LỢI NHUẬN KHÓA HỌC", ""],
      ["Tên khóa học", formData.courseName || ""],
      ["Ngày xuất báo cáo", new Date().toLocaleDateString("vi-VN")],
      ["", ""],
      ["1. THÔNG SỐ KHÓA HỌC & ĐỊNH LƯỢNG", ""],
      ["Học phí/học viên", formData.courseFeePerStudent || "0"],
      ["Tổng số học viên tuyển sinh", formData.totalStudents || "0"],
      ["Tổng số buổi học", formData.totalSessions || "0"],
      ["Số giờ dạy/buổi học", formData.hoursPerSession || "0"],
      ["Mức lương GV/giờ", formData.teacherSalaryPerHour || "0"],
      ["", ""],
      ["2. TỔNG KẾT BÁO CÁO KIỂM TOÁN (VNĐ)", ""],
      ["Tổng chi phí cố định (Định phí)", results.totalFixedCost],
      ["Tổng chi phí biến đổi (Biến phí)", results.totalVariableCost],
      ["Tổng chi phí đầu tư khóa học", results.totalCost],
      ["Tổng doanh thu dự kiến", results.totalRevenue],
      ["Lợi nhuận ròng thực tế", results.profit],
      ["Tỷ suất ROI (%)", `${results.roiPercent.toFixed(1)}%`],
      ["Điểm sức khỏe tài chính (/100)", results.healthScore],
      ["Nhận định chung", results.interpretation],
      ["", ""],
      ["3. CHỈ SỐ HOẠT ĐỘNG CHUYÊN SÂU", ""],
      ["Số học viên hòa vốn", results.breakEvenStudents.toFixed(1)],
      ["Doanh thu hòa vốn (VNĐ)", results.breakEvenRevenue],
      ["Biên an toàn (%)", `${results.safetyMarginPercent.toFixed(1)}%`],
      ["Tỷ suất lợi nhuận đóng góp (CMR %)", `${results.contributionMarginRatio.toFixed(1)}%`],
      ["Đòn bẩy vận hành", results.operatingLeverage.toFixed(2)],
      ["Tỷ lệ chi phí giảng dạy (%)", `${results.teachingCostRatio.toFixed(1)}%`],
      ["Tỷ lệ chi phí Marketing/Tuyển sinh (%)", `${results.acquisitionCostRatio.toFixed(1)}%`],
      ["Tổng chi phí bình quân/học viên", results.costPerStudent],
      ["Lợi nhuận đóng góp/học viên", results.marginPerStudent],
      ["Doanh thu bình quân/Giờ GV dạy", results.revenuePerInstructorHour],
      ["", ""],
      ["4. KHUYẾN NGHỊ CHIẾN LƯỢC TỪ HỆ THỐNG", ""],
      ...results.recommendations.map((rec, i) => [`Khuyến nghị ${i + 1}`, rec.text])
    ];

    // Unicode byte order mark to ensure Excel reads Vietnamese characters correctly
    const csvContent = "\uFEFF" + rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `KiemToan_ROI_${formData.courseName || 'Calculator'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4 sm:px-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <header className="text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 font-bold text-xs mb-6 uppercase tracking-wider shadow-sm">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Hệ thống phân tích tài chính chuyên sâu & Kiểm toán</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-br from-indigo-950 via-slate-800 to-slate-700 leading-tight">
              English Course <br className="sm:hidden" /> ROI & Financial Audit
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-500 font-medium leading-relaxed">
              Giải pháp kiểm toán lợi nhuận, phân tích điểm hòa vốn, biên an toàn và lập báo cáo tài chính tự động dành riêng cho các khóa học Tiếng Anh.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 gap-12 items-start">
          
          <div className="lg:col-span-12">
            <motion.div 
              layout
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="bg-slate-900 py-6 px-10 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calculator className="w-6 h-6 text-indigo-400" />
                  <span className="font-bold text-lg tracking-tight uppercase">Thông số kiểm toán khóa học</span>
                </div>
                {!results && <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-full text-slate-400 font-mono">Phiên bản 2026</span>}
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="p-10 space-y-12">
                
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-800 border-l-4 border-indigo-500 pl-4">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-xl font-extrabold uppercase tracking-wide">Chi tiết khóa học</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Field label="Tên khóa học" name="courseName" required placeholder="VD: IELTS Intensive" />
                    <Field label="Học phí mỗi HV (VNĐ)" name="courseFeePerStudent" required type="number" placeholder="0" />
                    <Field label="Tổng số học viên mục tiêu" name="totalStudents" required type="number" placeholder="0" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-800 border-l-4 border-emerald-500 pl-4">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-xl font-extrabold uppercase tracking-wide">Chi phí giảng dạy (Giáo viên)</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Field label="Tổng số buổi học" name="totalSessions" required type="number" placeholder="0" />
                    <Field label="Số giờ / buổi học" name="hoursPerSession" required type="number" step="0.5" placeholder="0.0" />
                    <Field label="Mức lương GV / giờ (VNĐ)" name="teacherSalaryPerHour" required type="number" placeholder="0" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 text-slate-800">
                      <LayoutDashboard className="w-5 h-5 text-slate-600" />
                      <h2 className="text-lg font-bold uppercase tracking-tight">Chi phí cố định (VNĐ / Khóa)</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <Field compact label="Mặt bằng / Phòng học thuê" name="fixedVenueCost" type="number" />
                      <Field compact label="Thiết kế tài liệu & Học liệu cố định" name="fixedMaterialsCost" type="number" />
                      <Field compact label="Phí công nghệ & Phần mềm quản trị" name="fixedTechnologyCost" type="number" />
                      <Field compact label="Phí quản lý & Nhân sự vận hành" name="fixedAdminCost" type="number" />
                      <Field compact label="Ngân sách Marketing & Thương hiệu" name="fixedMarketingCost" type="number" />
                    </div>
                  </div>

                  <div className="space-y-6 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                    <div className="flex items-center gap-3 text-indigo-900">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-lg font-bold uppercase tracking-tight">Biến phí / Học viên (VNĐ / Học viên)</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <Field compact label="Chi phí quảng cáo thu hút / Học viên (CAC)" name="varRecruitmentPerStudent" type="number" />
                      <Field compact label="Sách giáo trình & In ấn / Học viên" name="varMaterialsPerStudent" type="number" />
                      <Field compact label="Tài khoản học trực tuyến / Học viên" name="varTechnologyPerStudent" type="number" />
                      <Field compact label="Nước uống & Bánh ngọt / Học viên" name="varRefreshmentsPerStudent" type="number" />
                      <Field compact label="Phí cổng giao dịch & Thu hộ / Học viên" name="varTransactionFeePerStudent" type="number" />
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-xl flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="font-semibold">{error}</span>
                  </motion.div>
                )}

                <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <p className="text-sm text-slate-500 max-w-sm flex items-start gap-2 italic">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
                    Nhập dữ liệu chính xác để thuật toán kiểm toán tài chính phân tích biên an toàn và các rủi ro vận hành.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 py-4 px-10 border border-transparent rounded-2xl shadow-xl text-xl font-black text-white bg-indigo-600 hover:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCcw className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <span>Tính toán & Kiểm toán</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          <AnimatePresence>
            {results && (
              <motion.div 
                ref={resultsRef}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="lg:col-span-12 space-y-12 pb-24"
              >
                {/* Section A: Health & Main Results Banner */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Health Score Bento Panel */}
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200 flex flex-col items-center justify-between text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Activity className="w-24 h-24" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-slate-600 font-extrabold text-xs tracking-wider uppercase mb-4">
                        <Activity className="w-3.5 h-3.5 text-slate-500" />
                        Độ lớn sức khỏe tài chính
                      </span>
                      <h4 className="text-lg font-bold text-slate-700 uppercase tracking-tight">Financial Health</h4>
                    </div>

                    <div className="relative my-8 flex items-center justify-center">
                      {/* Interactive Circular Progress SVG */}
                      <svg className="w-36 h-36 transform -rotate-90">
                        <circle
                          cx="72"
                          cy="72"
                          r="52"
                          className="stroke-slate-100"
                          strokeWidth="10"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="72"
                          cy="72"
                          r="52"
                          className={cn(
                            "transition-all duration-1000",
                            results.healthScore >= 80 ? "stroke-emerald-500" :
                            results.healthScore >= 50 ? "stroke-amber-500" : "stroke-rose-500"
                          )}
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray="326.7" // 2 * PI * r (r=52) = 326.7
                          initial={{ strokeDashoffset: 326.7 }}
                          animate={{ strokeDashoffset: 326.7 - (326.7 * results.healthScore) / 100 }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-4xl font-black tracking-tight text-slate-900">{results.healthScore}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Điểm / 100</span>
                      </div>
                    </div>

                    <p className={cn(
                      "font-black text-base uppercase tracking-wider py-1.5 px-6 rounded-full",
                      results.healthScore >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      results.healthScore >= 50 ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      "bg-rose-50 text-rose-700 border border-rose-100"
                    )}>
                      {results.healthScore >= 80 ? "Hoạt động tối ưu" :
                       results.healthScore >= 50 ? "Mức độ rủi ro trung bình" : "Báo động rủi ro cao"}
                    </p>
                  </div>

                  {/* Main Profitability Card */}
                  <div className={cn(
                    "lg:col-span-2 relative overflow-hidden rounded-[2.5rem] shadow-2xl p-10 border-4 flex flex-col justify-between transition-colors duration-500",
                    results.profit >= 0 ? "bg-emerald-600 border-emerald-400" : "bg-rose-600 border-rose-400"
                  )}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                      <TrendingUp className="w-56 h-56 -mr-12 -mt-12" />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                      <div className="text-white space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white font-bold text-xs tracking-wider uppercase">
                          {results.profit >= 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          <span>Lợi nhuận ròng thực tế</span>
                        </div>
                        <h3 className="text-5xl sm:text-6xl font-black tracking-tighter leading-tight drop-shadow-md">
                          {formatCurrency(results.profit)}
                        </h3>
                        <p className="text-xl text-white/90 font-extrabold italic tracking-wide">
                          &ldquo;{results.interpretation}&rdquo;
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center min-w-[160px] self-stretch sm:self-auto flex flex-col justify-center shadow-inner">
                        <p className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-1">Tỷ suất ROI</p>
                        <p className="text-4xl font-black text-white italic">{results.roiPercent.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Progress indicator representing enrollment safety against total fixed costs */}
                    <div className="w-full bg-white/20 h-4 rounded-full overflow-hidden shadow-inner relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(Math.max(results.roiPercent, 0), 100)}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Cost Distribution & Custom Strategic Advisory Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Strategic Advisor Bento (7 cols) */}
                  <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200 space-y-6 relative">
                    <div className="flex items-center gap-3 text-slate-800 pb-2 border-b border-slate-100">
                      <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold uppercase tracking-tight">Khuyến nghị chiến lược</h3>
                        <p className="text-xs text-slate-400 font-bold tracking-tight uppercase">Strategic Audit Recommendations</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {results.recommendations.map((rec, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300",
                            rec.type === "warning" ? "bg-rose-50/50 border-rose-100 hover:bg-rose-50" :
                            rec.type === "success" ? "bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50" :
                            "bg-slate-50 border-slate-200 hover:bg-slate-100"
                          )}
                        >
                          <div className={cn(
                            "p-2.5 rounded-xl shrink-0 mt-0.5 shadow-sm",
                            rec.type === "warning" ? "bg-rose-500 text-white" :
                            rec.type === "success" ? "bg-emerald-500 text-white" :
                            "bg-indigo-600 text-white"
                          )}>
                            {rec.type === "warning" ? <AlertTriangle className="w-4 h-4" /> :
                             rec.type === "success" ? <ShieldCheck className="w-4 h-4" /> :
                             <Info className="w-4 h-4" />}
                          </div>
                          <div className="space-y-1">
                            <span className={cn(
                              "text-xs font-black uppercase tracking-wider",
                              rec.type === "warning" ? "text-rose-700" :
                              rec.type === "success" ? "text-emerald-700" :
                              "text-indigo-800"
                            )}>
                              {rec.type === "warning" ? "Cảnh báo rủi ro" :
                               rec.type === "success" ? "Điểm sáng tối ưu" :
                               "Ý kiến kiểm toán"}
                            </span>
                            <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                              {rec.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost Distribution Bento (5 cols) */}
                  <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200 flex flex-col justify-between space-y-6">
                    <div className="flex items-center gap-3 text-slate-800 pb-2 border-b border-slate-100">
                      <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold uppercase tracking-tight">Cơ cấu phân bổ chi phí</h3>
                        <p className="text-xs text-slate-400 font-bold tracking-tight uppercase">Cost Structure Distribution</p>
                      </div>
                    </div>

                    <div className="space-y-6 flex-grow flex flex-col justify-center">
                      {/* Percent visual stacked chart */}
                      <div className="w-full h-8 bg-slate-100 rounded-2xl overflow-hidden flex shadow-inner">
                        <motion.div 
                          title="Chi phí giảng dạy"
                          initial={{ width: 0 }}
                          animate={{ width: `${results.teachingCostRatio}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="bg-indigo-600 h-full text-white text-[10px] font-black flex items-center justify-center cursor-default hover:opacity-90 transition-opacity"
                        >
                          {results.teachingCostRatio > 12 && `${results.teachingCostRatio.toFixed(0)}%`}
                        </motion.div>
                        <motion.div 
                          title="Chi phí tuyển sinh & Marketing"
                          initial={{ width: 0 }}
                          animate={{ width: `${results.acquisitionCostRatio}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="bg-emerald-500 h-full text-white text-[10px] font-black flex items-center justify-center cursor-default hover:opacity-90 transition-opacity"
                        >
                          {results.acquisitionCostRatio > 12 && `${results.acquisitionCostRatio.toFixed(0)}%`}
                        </motion.div>
                        <motion.div 
                          title="Vận hành & Mặt bằng"
                          initial={{ width: 0 }}
                          animate={{ width: `${100 - results.teachingCostRatio - results.acquisitionCostRatio}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="bg-slate-500 h-full text-white text-[10px] font-black flex items-center justify-center cursor-default hover:opacity-90 transition-opacity"
                        >
                          {100 - results.teachingCostRatio - results.acquisitionCostRatio > 12 && 
                            `${(100 - results.teachingCostRatio - results.acquisitionCostRatio).toFixed(0)}%`}
                        </motion.div>
                      </div>

                      {/* Legend */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2.5">
                            <span className="w-4 h-4 bg-indigo-600 rounded-md shadow-sm shrink-0" />
                            <span className="text-slate-600 font-bold">Chi phí giảng dạy (Giáo viên)</span>
                          </div>
                          <span className="font-extrabold text-slate-800 font-mono text-base">{results.teachingCostRatio.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2.5">
                            <span className="w-4 h-4 bg-emerald-500 rounded-md shadow-sm shrink-0" />
                            <span className="text-slate-600 font-bold">Marketing & Tuyển sinh (CAC)</span>
                          </div>
                          <span className="font-extrabold text-slate-800 font-mono text-base">{results.acquisitionCostRatio.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2.5">
                            <span className="w-4 h-4 bg-slate-500 rounded-md shadow-sm shrink-0" />
                            <span className="text-slate-600 font-bold">Vận hành, Phòng học & Khác</span>
                          </div>
                          <span className="font-extrabold text-slate-800 font-mono text-base">
                            {(100 - results.teachingCostRatio - results.acquisitionCostRatio).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section C: Detailed Financial Ledger */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Column Ledger: Balance & Ratios */}
                  <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-xl font-extrabold uppercase tracking-tight text-slate-800">Cân đối tài chính khóa học</h3>
                      </div>
                    </div>
                    <div className="p-10 grid grid-cols-1 sm:grid-cols-2 gap-10">
                       <StatItem label="Định phí cố định" value={formatCurrency(results.totalFixedCost)} />
                       <StatItem label="Biến phí biến đổi" value={formatCurrency(results.totalVariableCost)} />
                       <StatItem label="Tổng chi phí tích lũy" value={formatCurrency(results.totalCost)} highlighted />
                       <StatItem label="Tổng doanh thu dự kiến" value={formatCurrency(results.totalRevenue)} highlighted />
                    </div>
                  </div>

                  {/* Right Column Ledger: Advanced Audit Indicators */}
                  <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Percent className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-xl font-extrabold uppercase tracking-tight text-slate-800">Chỉ số tài chính chuyên sâu</h3>
                      </div>
                    </div>
                    <div className="p-10 space-y-6">
                      <MetricRow label="Điểm hòa vốn học viên" value={results.breakEvenStudents.toFixed(1)} suffix="Học viên" />
                      <MetricRow label="Doanh thu hòa vốn tối thiểu" value={formatCurrency(results.breakEvenRevenue)} />
                      
                      <div className="flex items-center justify-between py-2.5 border-b border-slate-100 px-2 -mx-2 hover:bg-slate-50 rounded-lg">
                        <span className="text-slate-500 font-bold tracking-tight">Biên an toàn tài chính (Safety Margin)</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-2xl font-black tracking-tighter",
                            results.safetyMarginPercent >= 20 ? "text-emerald-600" :
                            results.safetyMarginPercent >= 0 ? "text-amber-500" : "text-rose-500"
                          )}>
                            {results.safetyMarginPercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <MetricRow label="Tỷ suất lợi nhuận đóng góp (CMR)" value={`${results.contributionMarginRatio.toFixed(1)}%`} />
                      <MetricRow label="Đòn bẩy vận hành (Operating Leverage)" value={results.operatingLeverage.toFixed(2)} />
                      <MetricRow label="Tổng chi phí phân bổ / Học viên" value={formatCurrency(results.costPerStudent)} />
                      <MetricRow label="Lợi nhuận đóng góp / Học viên" value={formatCurrency(results.marginPerStudent)} />
                      <MetricRow label="Doanh thu bình quân / Giờ GV dạy" value={formatCurrency(results.revenuePerInstructorHour)} />
                    </div>
                  </div>
                </div>

                {/* Section D: Export & Lập hồ sơ mới buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                   <button
                    onClick={downloadCSV}
                    className="w-full sm:w-auto group flex items-center justify-center gap-4 py-6 px-12 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-xl font-black text-white hover:bg-indigo-600 transition-all duration-300 transform active:scale-95"
                   >
                     <Download className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" />
                     Xuất báo cáo kiểm toán (CSV)
                   </button>
                   <button
                    onClick={() => { 
                      setResults(null); 
                      formRef.current?.reset();
                      setFormData({});
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-4 py-6 px-12 bg-white border-2 border-slate-200 rounded-2xl shadow-xl text-xl font-extrabold text-slate-600 hover:bg-slate-50 transition-all duration-300 transform active:scale-95"
                   >
                     <RefreshCcw className="w-5 h-5 transition-transform hover:rotate-180 duration-500 text-slate-400" />
                     Lập hồ sơ kiểm toán mới
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

// UI Components with proper HTML htmlFor bindings for Premium Accessibility (a11y)

interface FieldProps {
  label: string;
  name: string;
  id?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
  compact?: boolean;
}

function Field({ label, name, id, type = "text", required, placeholder, step, compact }: FieldProps) {
  const inputId = id || name;
  return (
    <div className="flex flex-col gap-2.5 group">
      <label 
        htmlFor={inputId}
        className={cn(
          "font-extrabold text-slate-700 tracking-tight transition-colors group-focus-within:text-indigo-600",
          compact ? "text-sm" : "text-base"
        )}
      >
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        name={name}
        required={required}
        step={step}
        placeholder={placeholder}
        className={cn(
          "w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-5 text-slate-900 font-medium placeholder:text-slate-400 transition-all ring-0 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none",
          compact ? "py-2.5 text-sm" : "py-4 text-lg"
        )}
      />
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  highlighted?: boolean;
}

function StatItem({ label, value, highlighted }: StatItemProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">{label}</p>
      <p className={cn(
        "font-black tracking-tight leading-none",
        highlighted ? "text-slate-900 text-3xl sm:text-4xl" : "text-slate-600 text-2xl sm:text-3xl"
      )}>
        {value}
      </p>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: string;
  suffix?: string;
}

function MetricRow({ label, value, suffix }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between group py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-lg px-2 -mx-2">
      <span className="text-slate-500 font-bold tracking-tight">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">
          {value}
        </span>
        {suffix && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{suffix}</span>}
      </div>
    </div>
  );
}
