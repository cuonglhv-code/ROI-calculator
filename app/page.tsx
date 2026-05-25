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
  Activity,
  Award,
  DollarSign
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
  
  // Advanced cost output metrics
  assistantCost: number;
  classroomOverhead: number;
  customerLifetimeValue: number;
  ltvCacRatio: number;
  netFeePerStudent: number;
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
      ["Học phí danh nghĩa (Gốc)", formData.courseFeePerStudent || "0"],
      ["Tỷ lệ chiết khấu bình quân (%)", `${formData.averageDiscountPercent || "0"}%`],
      ["Học phí thực thu ròng (Net Tuition)", results.netFeePerStudent],
      ["Tổng số học viên tuyển sinh", formData.totalStudents || "0"],
      ["Tổng số buổi học", formData.totalSessions || "0"],
      ["Số giờ dạy/buổi học", formData.hoursPerSession || "0"],
      ["Lương giáo viên chính/giờ", formData.teacherSalaryPerHour || "0"],
      ["Số lượng trợ giảng (TA)/buổi", formData.assistantsPerSession || "0"],
      ["Lương trợ giảng/giờ", formData.assistantSalaryPerHour || "0"],
      ["", ""],
      ["2. TỔNG KẾT BÁO CÁO KIỂM TOÁN (VNĐ)", ""],
      ["Tổng chi phí nhân sự giảng dạy (GV + TA)", results.totalFixedCost - results.classroomOverhead - Number(formData.fixedVenueCost || 0) - Number(formData.fixedMaterialsCost || 0) - Number(formData.fixedTechnologyCost || 0) - Number(formData.fixedAdminCost || 0) - Number(formData.fixedMarketingCost || 0)],
      ["Chi phí tiện ích & hao mòn lớp học", results.classroomOverhead],
      ["Tổng chi phí cố định (Định phí)", results.totalFixedCost],
      ["Tổng chi phí biến đổi (Biến phí)", results.totalVariableCost],
      ["Tổng chi phí đầu tư khóa học", results.totalCost],
      ["Tổng doanh thu ròng dự kiến", results.totalRevenue],
      ["Lợi nhuận ròng thực tế", results.profit],
      ["Tỷ suất ROI (%)", `${results.roiPercent.toFixed(1)}%`],
      ["Điểm sức khỏe tài chính (/100)", results.healthScore],
      ["Nhận định chung", results.interpretation],
      ["", ""],
      ["3. CHỈ SỐ TÀI CHÍNH CHUYÊN SÂU & LTV FORECAST", ""],
      ["Học viên hòa vốn", results.breakEvenStudents.toFixed(1)],
      ["Doanh thu hòa vốn (VNĐ)", results.breakEvenRevenue],
      ["Biên an toàn (%)", `${results.safetyMarginPercent.toFixed(1)}%`],
      ["Tỷ suất lợi nhuận đóng góp (CMR %)", `${results.contributionMarginRatio.toFixed(1)}%`],
      ["Đòn bẩy vận hành", results.operatingLeverage.toFixed(2)],
      ["Tỷ lệ chi phí giảng dạy (%)", `${results.teachingCostRatio.toFixed(1)}%`],
      ["Tỷ lệ chi phí Marketing/Tuyển sinh (%)", `${results.acquisitionCostRatio.toFixed(1)}%`],
      ["Tỷ lệ học viên tái đăng ký (%)", `${formData.expectedRetentionRate || "0"}%`],
      ["Giá trị vòng đời học viên (LTV)", results.customerLifetimeValue],
      ["Chỉ số LTV/CAC", Number(formData.varRecruitmentPerStudent || 0) > 0 ? results.ltvCacRatio.toFixed(2) : "N/A"],
      ["Doanh thu bình quân/Giờ GV dạy", results.revenuePerInstructorHour],
      ["", ""],
      ["4. KHUYẾN NGHỊ CHIẾN LƯỢC TỪ HỆ THỐNG", ""],
      ...results.recommendations.map((rec, i) => [`Khuyến nghị ${i + 1}`, rec.text])
    ];

    const csvContent = "\uFEFF" + rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `KiemToan_ROI_LTV_${formData.courseName || 'Calculator'}_${new Date().toISOString().split('T')[0]}.csv`);
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 font-bold text-xs mb-6 uppercase tracking-wider shadow-sm animate-pulse">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Hệ thống kiểm toán chi phí & Tái tuyển sinh (LTV) chuyên sâu</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-br from-indigo-950 via-slate-800 to-slate-700 leading-tight">
              English Course <br className="sm:hidden" /> Cost & LTV Auditor
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-500 font-medium leading-relaxed">
              Giải pháp kiểm toán đa chiều tích hợp trợ giảng, hao mòn tiện ích lớp học, chiết khấu ưu đãi học phí và giá trị vòng đời (LTV) trọn gói.
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
                  <span className="font-bold text-lg tracking-tight uppercase">Mẫu thông số chi phí mở rộng</span>
                </div>
                {!results && <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-full text-slate-400 font-mono">Chuẩn LTV 2026</span>}
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="p-10 space-y-12">
                
                {/* Section 1: Course & Pricing */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-800 border-l-4 border-indigo-500 pl-4">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-xl font-extrabold uppercase tracking-wide">Chi tiết khóa học & Học phí</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Field label="Tên khóa học" name="courseName" required placeholder="VD: IELTS Premium" />
                    <Field label="Học phí gốc danh nghĩa (VNĐ)" name="courseFeePerStudent" required type="number" placeholder="0" />
                    <Field label="Sĩ số học viên tuyển sinh" name="totalStudents" required type="number" placeholder="0" />
                  </div>
                </div>

                {/* Section 2: Staffing (Teacher & TA) */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-800 border-l-4 border-emerald-500 pl-4">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-xl font-extrabold uppercase tracking-wide">Đội ngũ giảng dạy (Giáo viên chính & Trợ giảng)</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="md:col-span-1">
                      <Field label="Số buổi học" name="totalSessions" required type="number" placeholder="0" />
                    </div>
                    <div className="md:col-span-1">
                      <Field label="Giờ / buổi" name="hoursPerSession" required type="number" step="0.5" placeholder="0.0" />
                    </div>
                    <div className="md:col-span-1.5">
                      <Field label="Lương GV chính / giờ (VNĐ)" name="teacherSalaryPerHour" required type="number" placeholder="0" />
                    </div>
                    <div className="md:col-span-0.7">
                      <Field label="Số trợ giảng/lớp" name="assistantsPerSession" type="number" placeholder="0" />
                    </div>
                    <div className="md:col-span-1">
                      <Field label="Lương trợ giảng/giờ (VNĐ)" name="assistantSalaryPerHour" type="number" placeholder="0" />
                    </div>
                  </div>
                </div>

                {/* Section 3: Overhead Costs & Classroom Utilities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 text-slate-800">
                      <LayoutDashboard className="w-5 h-5 text-slate-600" />
                      <h2 className="text-lg font-bold uppercase tracking-tight">Định phí cố định & Vận hành phòng</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-5">
                      <Field compact label="Mặt bằng / Phòng học thuê" name="fixedVenueCost" type="number" />
                      <Field compact label="Thiết kế & in ấn học liệu cố định" name="fixedMaterialsCost" type="number" />
                      <Field compact label="Phí nền tảng & công nghệ cố định" name="fixedTechnologyCost" type="number" />
                      <Field compact label="Hành chính & Quản lý cơ sở" name="fixedAdminCost" type="number" />
                      <div className="grid grid-cols-2 gap-4">
                        <Field compact label="Điện nước mạng / giờ dạy" name="utilitiesPerHour" type="number" />
                        <Field compact label="Khấu hao thiết bị / buổi học" name="depreciationPerSession" type="number" />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Variable costs, CAC, Promotions and Retention */}
                  <div className="space-y-6 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                    <div className="flex items-center gap-3 text-indigo-900">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-lg font-bold uppercase tracking-tight">Biến phí học viên & Ưu đãi chiết khấu</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-5">
                      <div className="grid grid-cols-2 gap-4">
                        <Field compact label="Marketing chiêu sinh (CAC)/HV" name="varRecruitmentPerStudent" type="number" />
                        <Field compact label="Giáo trình & Quà tặng / học viên" name="varMaterialsPerStudent" type="number" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <Field compact label="LMS / học viên" name="varTechnologyPerStudent" type="number" />
                        <Field compact label="Teabreak / học viên" name="varRefreshmentsPerStudent" type="number" />
                        <Field compact label="Thu hộ GD / học viên" name="varTransactionFeePerStudent" type="number" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-indigo-100">
                        <Field compact label="Chiết khấu giảm giá bình quân %" name="averageDiscountPercent" type="number" placeholder="0" />
                        <Field compact label="Tỷ lệ học viên tái đăng ký %" name="expectedRetentionRate" type="number" placeholder="0" />
                      </div>
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
                    Thuật toán sẽ tự động khấu trừ giảm giá để tính toán giá trị thực thu ròng và dự phóng LTV/CAC trọn đời học viên.
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
                        <span>Tính toán & Lập báo cáo kiểm toán</span>
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
                {/* Bento Row 1: Health Score Circular progress & LTV Forecast Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Health Score Bento Panel (4 cols) */}
                  <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-200 flex flex-col items-center justify-between text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Activity className="w-24 h-24" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full text-indigo-700 font-extrabold text-[10px] tracking-wider uppercase mb-3 shadow-sm">
                        <Activity className="w-3 h-3 text-indigo-500" />
                        Điểm kiểm toán tài chính
                      </span>
                      <h4 className="text-base font-extrabold text-slate-500 uppercase tracking-wider">Health Rating</h4>
                    </div>

                    <div className="relative my-6 flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="46"
                          className="stroke-slate-100"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="46"
                          className={cn(
                            "transition-all duration-1000",
                            results.healthScore >= 80 ? "stroke-emerald-500" :
                            results.healthScore >= 50 ? "stroke-amber-500" : "stroke-rose-500"
                          )}
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray="289" // 2 * PI * r (r=46) = 289
                          initial={{ strokeDashoffset: 289 }}
                          animate={{ strokeDashoffset: 289 - (289 * results.healthScore) / 100 }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-3xl font-black tracking-tight text-slate-900">{results.healthScore}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Điểm / 100</span>
                      </div>
                    </div>

                    <p className={cn(
                      "font-black text-xs uppercase tracking-wider py-1.5 px-6 rounded-full",
                      results.healthScore >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      results.healthScore >= 50 ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      "bg-rose-50 text-rose-700 border border-rose-100"
                    )}>
                      {results.healthScore >= 80 ? "Hoạt động tối ưu" :
                       results.healthScore >= 50 ? "Rủi ro trung bình" : "Báo động rủi ro cao"}
                    </p>
                  </div>

                  {/* LTV & CAC Forecast Bento Panel (8 cols) */}
                  <div className="lg:col-span-8 bg-slate-900 text-white rounded-[2.5rem] p-9 shadow-2xl relative overflow-hidden flex flex-col justify-between border-4 border-slate-800">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                      <Award className="w-56 h-56 -mr-8 -mt-8" />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-slate-800">
                      <div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full text-indigo-400 font-extrabold text-[10px] tracking-wider uppercase mb-2">
                          <DollarSign className="w-3 h-3" />
                          Học thuật & Tái đăng ký
                        </span>
                        <h3 className="text-lg font-bold text-slate-300">Giá trị vòng đời trọn đời (LTV)</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dự phóng LTV học viên</p>
                        <p className="text-4xl font-black text-indigo-400 tracking-tight">{formatCurrency(results.customerLifetimeValue)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                      <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Học phí thu ròng</span>
                        <span className="text-lg font-black text-slate-200">{formatCurrency(results.netFeePerStudent)}</span>
                        <span className="text-[9px] font-bold text-slate-400 block mt-0.5">Khấu trừ {formData.averageDiscountPercent || "0"}% ưu đãi</span>
                      </div>
                      <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Tỷ lệ tái ký mong đợi</span>
                        <span className="text-lg font-black text-emerald-400">{formData.expectedRetentionRate || "0"}%</span>
                        <span className="text-[9px] font-bold text-slate-400 block mt-0.5">Học tiếp cấp độ sau</span>
                      </div>
                      <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Tỷ suất LTV / CAC</span>
                          <span className={cn(
                            "text-xl font-black tracking-tight block",
                            Number(formData.varRecruitmentPerStudent || 0) === 0 ? "text-slate-400" :
                            results.ltvCacRatio >= 5 ? "text-indigo-400" :
                            results.ltvCacRatio >= 3 ? "text-emerald-400" : "text-rose-400"
                          )}>
                            {Number(formData.varRecruitmentPerStudent || 0) > 0 ? `${results.ltvCacRatio.toFixed(2)}x` : "N/A"}
                          </span>
                        </div>
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">
                          {Number(formData.varRecruitmentPerStudent || 0) > 0 
                            ? (results.ltvCacRatio >= 5 ? "Tối ưu xuất sắc" : results.ltvCacRatio >= 3 ? "Đạt chuẩn tốt" : "Tuyển sinh đắt đỏ")
                            : "Bổ sung CAC đầu người"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bento Row 2: Cost Structure Distribution & Strategic Advisory Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Recommendations Panel (7 cols) */}
                  <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200 space-y-6 relative">
                    <div className="flex items-center gap-3 text-slate-800 pb-2 border-b border-slate-100">
                      <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Ý kiến kiểm toán & Đề xuất hành động</h3>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">Strategic Audit Recommendations</p>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
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
                              "text-[10px] font-black uppercase tracking-wider",
                              rec.type === "warning" ? "text-rose-700" :
                              rec.type === "success" ? "text-emerald-700" :
                              "text-indigo-800"
                            )}>
                              {rec.type === "warning" ? "Điểm cần khắc phục" :
                               rec.type === "success" ? "Lợi thế cạnh tranh" :
                               "Ý kiến đóng góp"}
                            </span>
                            <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                              {rec.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost Distribution Bento Panel (5 cols) */}
                  <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200 flex flex-col justify-between space-y-6">
                    <div className="flex items-center gap-3 text-slate-800 pb-2 border-b border-slate-100">
                      <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Cơ cấu phân bổ chi phí thực tế</h3>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">Cost Structure Distribution</p>
                      </div>
                    </div>

                    <div className="space-y-6 flex-grow flex flex-col justify-center">
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
                          title="Vận hành & Phòng học"
                          initial={{ width: 0 }}
                          animate={{ width: `${100 - results.teachingCostRatio - results.acquisitionCostRatio}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="bg-slate-500 h-full text-white text-[10px] font-black flex items-center justify-center cursor-default hover:opacity-90 transition-opacity"
                        >
                          {100 - results.teachingCostRatio - results.acquisitionCostRatio > 12 && 
                            `${(100 - results.teachingCostRatio - results.acquisitionCostRatio).toFixed(0)}%`}
                        </motion.div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2.5">
                            <span className="w-4 h-4 bg-indigo-600 rounded-md shadow-sm shrink-0" />
                            <span className="text-slate-600 font-bold">Chi phí giảng dạy (GV chính + TA)</span>
                          </div>
                          <span className="font-extrabold text-slate-800 font-mono text-base">{results.teachingCostRatio.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2.5">
                            <span className="w-4 h-4 bg-emerald-500 rounded-md shadow-sm shrink-0" />
                            <span className="text-slate-600 font-bold">Marketing tuyển sinh (MKT + CAC)</span>
                          </div>
                          <span className="font-extrabold text-slate-800 font-mono text-base">{results.acquisitionCostRatio.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2.5">
                            <span className="w-4 h-4 bg-slate-500 rounded-md shadow-sm shrink-0" />
                            <span className="text-slate-600 font-bold">Vận hành phòng học & khấu hao</span>
                          </div>
                          <span className="font-extrabold text-slate-800 font-mono text-base">
                            {(100 - results.teachingCostRatio - results.acquisitionCostRatio).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bento Row 3: Ledgers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Column: Financial Balance Sheet Ledger */}
                  <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Cân đối dòng tiền & Chi phí ròng</h3>
                      </div>
                    </div>
                    <div className="p-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                       <StatItem label="Chi phí trợ giảng (TA)" value={formatCurrency(results.assistantCost)} />
                       <StatItem label="Hao mòn tiện ích lớp học" value={formatCurrency(results.classroomOverhead)} />
                       <StatItem label="Định phí cố định tổng" value={formatCurrency(results.totalFixedCost)} />
                       <StatItem label="Biến phí biến đổi tổng" value={formatCurrency(results.totalVariableCost)} />
                       <StatItem label="Tổng chi phí tích lũy" value={formatCurrency(results.totalCost)} highlighted />
                       <StatItem label="Doanh thu thực thu ròng" value={formatCurrency(results.totalRevenue)} highlighted />
                    </div>
                  </div>

                  {/* Right Column: Advanced Corporate Audit Indicators */}
                  <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Percent className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Chỉ số đo lường hiệu suất (KPIs)</h3>
                      </div>
                    </div>
                    <div className="p-10 space-y-6">
                      <MetricRow label="Ngưỡng học viên hòa vốn" value={results.breakEvenStudents.toFixed(1)} suffix="Học viên" />
                      <MetricRow label="Doanh thu hòa vốn thực tế" value={formatCurrency(results.breakEvenRevenue)} />
                      
                      <div className="flex items-center justify-between py-2.5 border-b border-slate-100 px-2 -mx-2 hover:bg-slate-50 rounded-lg">
                        <span className="text-slate-500 font-bold tracking-tight">Biên an toàn tài chính (Safety Margin)</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-2xl font-black tracking-tighter animate-pulse",
                            results.safetyMarginPercent >= 20 ? "text-emerald-600" :
                            results.safetyMarginPercent >= 0 ? "text-amber-500" : "text-rose-500"
                          )}>
                            {results.safetyMarginPercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <MetricRow label="Tỷ suất lợi nhuận đóng góp (CMR)" value={`${results.contributionMarginRatio.toFixed(1)}%`} />
                      <MetricRow label="Độ lớn đòn bẩy vận hành (DOL)" value={results.operatingLeverage.toFixed(2)} />
                      <MetricRow label="Tổng chi phí phân bổ / Học viên" value={formatCurrency(results.costPerStudent)} />
                      <MetricRow label="Lợi nhuận đóng góp / Học viên" value={formatCurrency(results.marginPerStudent)} />
                      <MetricRow label="Doanh thu / Giờ GV đứng lớp" value={formatCurrency(results.revenuePerInstructorHour)} />
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                   <button
                    onClick={downloadCSV}
                    className="w-full sm:w-auto group flex items-center justify-center gap-4 py-6 px-12 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-xl font-black text-white hover:bg-indigo-600 transition-all duration-300 transform active:scale-95"
                   >
                     <Download className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" />
                     Tải báo cáo kiểm toán nâng cao (CSV)
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
    <div className="flex flex-col gap-2 group">
      <label 
        htmlFor={inputId}
        className={cn(
          "font-extrabold text-slate-700 tracking-tight transition-colors group-focus-within:text-indigo-600",
          compact ? "text-xs" : "text-sm"
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
          "w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 text-slate-900 font-semibold placeholder:text-slate-400 transition-all ring-0 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none",
          compact ? "py-2 text-xs" : "py-3 text-sm"
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
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={cn(
        "font-black tracking-tight leading-none",
        highlighted ? "text-slate-900 text-2xl sm:text-3xl" : "text-slate-600 text-xl sm:text-2xl"
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
    <div className="flex items-center justify-between group py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-lg px-2 -mx-2">
      <span className="text-slate-500 text-xs font-bold tracking-tight">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">
          {value}
        </span>
        {suffix && <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{suffix}</span>}
      </div>
    </div>
  );
}
