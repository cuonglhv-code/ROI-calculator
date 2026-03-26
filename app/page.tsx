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
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
}

export default function ROICalculator() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
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

      if (!res.ok) throw new Error("Tính toán thất bại");
      const resultData = await res.json();
      setResults(resultData);
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng kiểm tra lại thông tin nhập vào.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num: number) => 
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);

  const downloadCSV = () => {
    if (!results) return;

    const rows = [
      ["Hạng mục", "Giá trị"],
      ["", ""],
      ["THÔNG TIN KHÓA HỌC", ""],
      ["Tên khóa học", formData.courseName || ""],
      ["Học phí/học viên", formData.courseFeePerStudent || "0"],
      ["Tổng số học viên", formData.totalStudents || "0"],
      ["", ""],
      ["CHI PHÍ GIÁO VIÊN", ""],
      ["Tổng số buổi học", formData.totalSessions || "0"],
      ["Số giờ/buổi", formData.hoursPerSession || "0"],
      ["Lương GV/giờ", formData.teacherSalaryPerHour || "0"],
      ["", ""],
      ["TỔNG KẾT TÀI CHÍNH (VNĐ)", ""],
      ["Tổng chi phí cố định", results.totalFixedCost],
      ["Tổng chi phí biến đổi", results.totalVariableCost],
      ["Tổng chi phí", results.totalCost],
      ["Tổng doanh thu", results.totalRevenue],
      ["Lợi nhuận ròng", results.profit],
      ["ROI (%)", `${results.roiPercent.toFixed(1)}%`],
      ["Nhận xét", results.interpretation],
      ["", ""],
      ["CHỈ SỐ ĐƠN VỊ", ""],
      ["Số HV hòa vốn", results.breakEvenStudents.toFixed(1)],
      ["Tổng chi phí/học viên", results.costPerStudent],
      ["Biên lợi nhuận/học viên", results.marginPerStudent],
      ["Chi phí GV/học viên", results.instructorCostPerStudent],
      ["Doanh thu/Giờ GV", results.revenuePerInstructorHour]
    ];

    const csvContent = "\uFEFF" + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ROI_${formData.courseName || 'Calculator'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4 sm:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <header className="text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 font-bold text-xs mb-6 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Phân tích tài chính chuyên sâu</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-br from-slate-950 via-slate-800 to-slate-700 leading-tight">
              English Course <br className="sm:hidden" /> ROI Calculator
            </h1>
            <p className="max-w-xl mx-auto text-lg text-slate-500 font-medium leading-relaxed">
              Kiểm tra tỉ lệ lợi nhuận của khóa học. <br className="hidden md:inline" /> 
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
                  <span className="font-bold text-lg tracking-tight uppercase">Thông số hồ sơ</span>
                </div>
                {!results && <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-full text-slate-400 font-mono">Bản mới 2026</span>}
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-12">
                
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-800 border-l-4 border-indigo-500 pl-4">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-xl font-extrabold uppercase tracking-wide">Chi tiết khóa học</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Field label="Tên khóa học" name="courseName" required placeholder="VD: IELTS Intensive" />
                    <Field label="Học phí mỗi HV (VNĐ)" name="courseFeePerStudent" required type="number" placeholder="0" />
                    <Field label="Tổng số học viên" name="totalStudents" required type="number" placeholder="0" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-800 border-l-4 border-emerald-500 pl-4">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-xl font-extrabold uppercase tracking-wide">Thông tin Giáo viên</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Field label="Tổng số buổi học" name="totalSessions" required type="number" placeholder="0" />
                    <Field label="Số giờ / buổi" name="hoursPerSession" required type="number" step="0.5" placeholder="0.0" />
                    <Field label="Lương GV / giờ (VNĐ)" name="teacherSalaryPerHour" required type="number" placeholder="0" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 text-slate-800">
                      <LayoutDashboard className="w-5 h-5 text-slate-600" />
                      <h2 className="text-lg font-bold uppercase tracking-tight">Chi phí cố định (VNĐ)</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <Field compact label="Thuê mặt bằng/phòng học" name="fixedVenueCost" type="number" />
                      <Field compact label="Học liệu cố định" name="fixedMaterialsCost" type="number" />
                      <Field compact label="Phí công nghệ/Nền tảng" name="fixedTechnologyCost" type="number" />
                      <Field compact label="Quản lý & Vận hành" name="fixedAdminCost" type="number" />
                      <Field compact label="Marketing & Truyền thông" name="fixedMarketingCost" type="number" />
                    </div>
                  </div>

                  <div className="space-y-6 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                    <div className="flex items-center gap-3 text-slate-800">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-lg font-bold uppercase tracking-tight">Biến phí / Học viên (VNĐ)</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <Field compact label="Chi phí tuyển sinh" name="varRecruitmentPerStudent" type="number" />
                      <Field compact label="Học liệu / học viên" name="varMaterialsPerStudent" type="number" />
                      <Field compact label="Phí hệ thống / học viên" name="varTechnologyPerStudent" type="number" />
                      <Field compact label="Cơ sở vật chất / HV" name="varRefreshmentsPerStudent" type="number" />
                      <Field compact label="Phí thanh toán / GD" name="varTransactionFeePerStudent" type="number" />
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

                <div className="pt-8 border-t border-slate-100 flex items-center justify-between gap-6">
                  <p className="text-sm text-slate-500 max-w-sm flex items-start gap-2 italic">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    Mọi dữ liệu tính toán đều được bảo mật tuyệt đối trên hệ thống.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative inline-flex items-center gap-3 py-4 px-10 border border-transparent rounded-2xl shadow-xl text-xl font-black text-white bg-indigo-600 hover:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCcw className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <span>Tính toán & Lưu trữ</span>
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
                <div className={cn(
                  "relative overflow-hidden rounded-[2.5rem] shadow-2xl p-12 border-4 transition-colors duration-500",
                  results.profit >= 0 ? "bg-emerald-600 border-emerald-400" : "bg-rose-600 border-rose-400"
                )}>
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <TrendingUp className="w-64 h-64 -mr-12 -mt-12" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-white space-y-5 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white font-bold text-sm tracking-widest uppercase">
                        {results.profit >= 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>Kết quả phân tích ròng</span>
                      </div>
                      <h3 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight drop-shadow-lg">
                        {formatCurrency(results.profit)}
                      </h3>
                      <p className="text-2xl text-white/90 font-bold italic tracking-wide">
                        &ldquo;{results.interpretation}&rdquo;
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-12 border border-white/20 text-center min-w-[300px] shadow-inner">
                      <p className="text-white/70 font-bold uppercase tracking-widest text-sm mb-3">Tỷ suất ROI (%)</p>
                      <p className="text-7xl font-black text-white italic drop-shadow-md">{results.roiPercent.toFixed(1)}%</p>
                      <div className="mt-8 w-full bg-white/20 h-5 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(Math.max(results.roiPercent, 0), 100)}%` }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-xl font-extrabold uppercase tracking-tight text-slate-800">Cân đối tài chính</h3>
                      </div>
                    </div>
                    <div className="p-10 grid grid-cols-1 sm:grid-cols-2 gap-10">
                       <StatItem label="Tổng chi phí cố định" value={formatCurrency(results.totalFixedCost)} />
                       <StatItem label="Tổng chi phí biến đổi" value={formatCurrency(results.totalVariableCost)} />
                       <StatItem label="Tổng chi phí" value={formatCurrency(results.totalCost)} highlighted />
                       <StatItem label="Tổng doanh thu" value={formatCurrency(results.totalRevenue)} highlighted />
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-xl font-extrabold uppercase tracking-tight text-slate-800">Chỉ số vận hành</h3>
                      </div>
                    </div>
                    <div className="p-10 space-y-8">
                      <MetricRow label="Điểm hòa vốn" value={results.breakEvenStudents.toFixed(1)} suffix="Học viên" />
                      <MetricRow label="Tổng chi phí / Học viên" value={formatCurrency(results.costPerStudent)} />
                      <MetricRow label="Lãi gộp / Học viên" value={formatCurrency(results.marginPerStudent)} />
                      <MetricRow label="Chi phí GV / Học viên" value={formatCurrency(results.instructorCostPerStudent)} />
                      <MetricRow label="Doanh thu / Giờ dạy" value={formatCurrency(results.revenuePerInstructorHour)} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                   <button
                    onClick={downloadCSV}
                    className="group flex items-center gap-4 py-6 px-12 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-xl font-black text-white hover:bg-indigo-600 transition-all duration-300 transform active:scale-95"
                   >
                     <Download className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" />
                     Xuất báo cáo (CSV)
                   </button>
                   <button
                    onClick={() => { setResults(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="flex items-center gap-4 py-6 px-12 bg-white border-2 border-slate-200 rounded-2xl shadow-xl text-xl font-extrabold text-slate-600 hover:bg-slate-50 transition-all duration-300 transform active:scale-95"
                   >
                     <RefreshCcw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
                     Lập hồ sơ mới
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

// UI Components with Types

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
  compact?: boolean;
}

function Field({ label, name, type = "text", required, placeholder, step, compact }: FieldProps) {
  return (
    <div className="flex flex-col gap-2.5 group">
      <label className={cn(
        "font-extrabold text-slate-700 tracking-tight transition-colors group-focus-within:text-indigo-600",
        compact ? "text-sm" : "text-base"
      )}>
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
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
