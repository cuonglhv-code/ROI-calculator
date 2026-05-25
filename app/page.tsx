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
  DollarSign,
  Layers,
  ArrowUpRight,
  XCircle
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

// 2026 Sleek High-Fidelity Course Presets
const COURSE_PRESETS = {
  ielts: {
    courseName: "IELTS Mastery Advanced",
    courseFeePerStudent: "8500000",
    totalStudents: "18",
    totalSessions: "24",
    hoursPerSession: "2",
    teacherSalaryPerHour: "450000",
    assistantsPerSession: "1",
    assistantSalaryPerHour: "80000",
    fixedVenueCost: "3500000",
    fixedMaterialsCost: "1200000",
    fixedTechnologyCost: "800000",
    fixedAdminCost: "2000000",
    fixedMarketingCost: "4500000",
    varMaterialsPerStudent: "250000",
    varTechnologyPerStudent: "15000",
    varRecruitmentPerStudent: "850000",
    varOtherPerStudent: "100000",
    averageDiscountPercent: "10",
    expectedRetentionRate: "65",
    utilitiesPerHour: "25000",
    depreciationPerSession: "50000"
  },
  kids: {
    courseName: "English for Kids (Starter)",
    courseFeePerStudent: "4200000",
    totalStudents: "15",
    totalSessions: "36",
    hoursPerSession: "1.5",
    teacherSalaryPerHour: "320000",
    assistantsPerSession: "2",
    assistantSalaryPerHour: "60000",
    fixedVenueCost: "3000000",
    fixedMaterialsCost: "1800000",
    fixedTechnologyCost: "500000",
    fixedAdminCost: "1500000",
    fixedMarketingCost: "3000000",
    varMaterialsPerStudent: "300000",
    varTechnologyPerStudent: "120000",
    varRecruitmentPerStudent: "500000",
    varOtherPerStudent: "50000",
    averageDiscountPercent: "15",
    expectedRetentionRate: "78",
    utilitiesPerHour: "20000",
    depreciationPerSession: "40000"
  },
  general: {
    courseName: "Communicative English Basic",
    courseFeePerStudent: "3500000",
    totalStudents: "12",
    totalSessions: "20",
    hoursPerSession: "2",
    teacherSalaryPerHour: "260000",
    assistantsPerSession: "0",
    assistantSalaryPerHour: "0",
    fixedVenueCost: "2500000",
    fixedMaterialsCost: "800000",
    fixedTechnologyCost: "400000",
    fixedAdminCost: "1000000",
    fixedMarketingCost: "2500000",
    varMaterialsPerStudent: "150000",
    varTechnologyPerStudent: "80000",
    varRecruitmentPerStudent: "600000",
    varOtherPerStudent: "40000",
    averageDiscountPercent: "5",
    expectedRetentionRate: "50",
    utilitiesPerHour: "15000",
    depreciationPerSession: "30000"
  }
};

export default function ROICalculator() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Dynamic state for controlled visual preset switching
  const applyPreset = (key: keyof typeof COURSE_PRESETS) => {
    setActivePreset(key);
    const data = COURSE_PRESETS[key];
    setFormData(data);
    
    // Explicitly update individual inputs inside the DOM
    if (formRef.current) {
      Object.entries(data).forEach(([name, value]) => {
        const input = formRef.current?.querySelector(`[name="${name}"]`) as HTMLInputElement;
        if (input) {
          input.value = value;
        }
      });
    }
    setError(null);
  };

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
      ["BÁO CÁO PHÂN TÍCH TÀI CHÍNH & KIỂM TOÁN LỢI NHUẬN KHÓA HỌC / FINANCIAL AUDIT & ROI REPORT", ""],
      ["Tên khóa học / Course Name", formData.courseName || ""],
      ["Ngày xuất báo cáo / Audit Date", new Date().toLocaleDateString("vi-VN")],
      ["", ""],
      ["1. THÔNG SỐ KHÓA HỌC & ĐỊNH LƯỢNG / COURSE PARAMETERS & QUANTITIES", ""],
      ["Học phí danh nghĩa (Gốc) / Nominal Tuition", formData.courseFeePerStudent || "0"],
      ["Tỷ lệ chiết khấu bình quan (%) / Average Discount %", `${formData.averageDiscountPercent || "0"}%`],
      ["Học phí thực thu ròng (Net Tuition) / Net Tuition", results.netFeePerStudent],
      ["Tổng số học viên tuyển sinh / Target Enrollment", formData.totalStudents || "0"],
      ["Tổng số buổi học / Sessions Count", formData.totalSessions || "0"],
      ["Số giờ dạy/buổi học / Hours per Session", formData.hoursPerSession || "0"],
      ["Lương giáo viên chính/giờ / Main Teacher Rate (Hourly)", formData.teacherSalaryPerHour || "0"],
      ["Số lượng trợ giảng (TA)/buổi / TAs per Class", formData.assistantsPerSession || "0"],
      ["Lương trợ giảng/giờ / TA Rate (Hourly)", formData.assistantSalaryPerHour || "0"],
      ["", ""],
      ["2. TỔNG KẾT BÁO CÁO KIỂM TOÁN (VNĐ) / FINANCIAL BALANCE AUDIT (VND)", ""],
      ["Chi phí giảng dạy chính (GV) / Main Instructor Cost", results.totalFixedCost - results.classroomOverhead - results.assistantCost - Number(formData.fixedVenueCost || 0) - Number(formData.fixedMaterialsCost || 0) - Number(formData.fixedTechnologyCost || 0) - Number(formData.fixedAdminCost || 0) - Number(formData.fixedMarketingCost || 0)],
      ["Chi phí trợ giảng (TA) / Teaching Assistant Cost", results.assistantCost],
      ["Chi phí tiện ích & hao mòn lớp học / Classroom Utilities & Wear", results.classroomOverhead],
      ["Tổng chi phí cố định (Định phí) / Total Fixed Cost", results.totalFixedCost],
      ["Tổng chi phí biến đổi (Biến phí) / Total Variable Cost", results.totalVariableCost],
      ["Tổng chi phí đầu tư khóa học / Total Invested Cost", results.totalCost],
      ["Tổng doanh thu ròng dự kiến / Net Tuition Revenue", results.totalRevenue],
      ["Lợi nhuận ròng thực tế / Net Profit", results.profit],
      ["Tỷ suất ROI (%) / Return on Investment (ROI %)", `${results.roiPercent.toFixed(1)}%`],
      ["Điểm sức khỏe tài chính / Financial Health Score", results.healthScore],
      ["Nhận định chung / Audit Interpretation", results.interpretation],
      ["", ""],
      ["3. CHỈ SỐ TÀI CHÍNH CHUYÊN SÂU & LTV FORECAST / SYSTEM KPIs & LTV PREDICTIONS", ""],
      ["Học viên hòa vốn / Break-even Enrollment", results.breakEvenStudents.toFixed(1)],
      ["Doanh thu hòa vốn (VNĐ) / Break-even Revenue", results.breakEvenRevenue],
      ["Biên an toàn (%) / Financial Safety Margin %", `${results.safetyMarginPercent.toFixed(1)}%`],
      ["Tỷ suất lợi nhuận đóng góp (CMR %) / Contribution Margin Ratio", `${results.contributionMarginRatio.toFixed(1)}%`],
      ["Đòn bẩy vận hành / Degree of Operating Leverage (DOL)", results.operatingLeverage.toFixed(2)],
      ["Tỷ lệ chi phí giảng dạy (%) / Teaching Cost Ratio", `${results.teachingCostRatio.toFixed(1)}%`],
      ["Tỷ lệ chi phí Marketing/Tuyển sinh (%) / Acquisition Cost Ratio", `${results.acquisitionCostRatio.toFixed(1)}%`],
      ["Tỷ lệ học viên tái đăng ký (%) / Expected Retention Rate %", `${formData.expectedRetentionRate || "0"}%`],
      ["Giá trị vòng đời học viên (LTV) / Customer Lifetime Value", results.customerLifetimeValue],
      ["Chỉ số LTV/CAC / LTV to CAC Ratio", Number(formData.varRecruitmentPerStudent || 0) > 0 ? results.ltvCacRatio.toFixed(2) : "N/A"],
      ["Doanh thu bình quan/Giờ GV dạy / Revenue per Class-Hour (RevPCH)", results.revenuePerInstructorHour],
      ["", ""],
      ["4. KHUYẾN NGHỊ CHIẾN LƯỢC TỪ HỆ THỐNG / SYSTEM STRATEGIC RECOMMENDATIONS", ""],
      ...results.recommendations.map((rec, i) => [`Khuyến nghị ${i + 1} / Advisory ${i + 1}`, rec.text])
    ];

    const csvContent = "\uFEFF" + rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `BaoCao_KiemToan_Bilingual_${formData.courseName || 'Calculator'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen py-20 px-4 sm:px-8 selection:bg-indigo-500/30 selection:text-white relative overflow-hidden">
      
      {/* 1. Futuristic Ambient Glowing Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#03050c]">
        <div className="absolute top-[-15%] left-[-10%] w-[650px] h-[650px] rounded-full bg-indigo-600/10 blur-[130px] opacity-75 animate-orb-slow-1" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full bg-emerald-500/8 blur-[110px] opacity-70 animate-orb-slow-2" />
        <div className="absolute top-[40%] right-[15%] w-[480px] h-[480px] rounded-full bg-violet-500/6 blur-[120px] opacity-60 animate-orb-slow-3" />
      </div>

      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header Section */}
        <header className="text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4"
          >
            {/* Bilingual Sub-Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-indigo-950/50 border border-indigo-500/25 rounded-full text-indigo-300 font-extrabold text-[10px] tracking-wider uppercase shadow-lg shadow-indigo-950/20 backdrop-blur-md">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Bilingual Financial Auditor / Hệ thống kiểm toán tài chính & LTV</span>
            </div>
            
            {/* Shimmer Neon Title */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl pt-2 pb-1 bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent leading-none">
              English Course <br className="sm:hidden" /> Cost & LTV Auditor
            </h1>
            
            <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
              Giải pháp kiểm toán giáo dịch đa chiều. Tích hợp định phí trợ giảng, hao mòn utilities lớp học, chiết khấu và giá trị vòng đời LTV.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 gap-12">
          
          {/* Main Input Form Glass Panel */}
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-panel rounded-[2.25rem] shadow-2xl overflow-hidden border border-white/5 relative"
          >
            {/* Satin Finish Card Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-white/5 py-6 px-8 sm:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-inner">
                  <Calculator className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-white text-base tracking-tight uppercase">Mẫu thông số chi phí mở rộng</span>
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Bilingual Cost Parameters Matrix</span>
                </div>
              </div>
              
              {/* Quick Course Presets HUD */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline-block">Chọn nhanh hồ sơ / Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset("ielts")}
                  className={cn(
                    "text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-300 border cursor-pointer",
                    activePreset === "ielts" 
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 scale-105" 
                      : "bg-slate-950/60 text-slate-300 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/60"
                  )}
                >
                  IELTS Mastery
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("kids")}
                  className={cn(
                    "text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-300 border cursor-pointer",
                    activePreset === "kids" 
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 scale-105" 
                      : "bg-slate-950/60 text-slate-300 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/60"
                  )}
                >
                  Kids Starter
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("general")}
                  className={cn(
                    "text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-300 border cursor-pointer",
                    activePreset === "general" 
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 scale-105" 
                      : "bg-slate-950/60 text-slate-300 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/60"
                  )}
                >
                  Communication
                </button>
              </div>
            </div>

            {/* Form body */}
            <form ref={formRef} onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-12">
              
              {/* Form Section 1: Course Details */}
              <div className="space-y-6 bg-white/[0.01] p-6 sm:p-8 rounded-[1.75rem] border border-white/5 hover:border-white/10 transition-all duration-300 shadow-inner">
                <div className="flex items-center gap-3 text-slate-200 border-l-4 border-indigo-500 pl-4">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h2 className="text-base font-extrabold uppercase tracking-wider leading-tight text-white">Chi tiết khóa học & Học phí</h2>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Course Details & Tuition Pricing</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <Field label="Tên khóa học" subLabel="Course Name" name="courseName" required placeholder="VD: IELTS Premium" defaultValue={formData.courseName} />
                  <Field label="Học phí gốc danh nghĩa (VNĐ)" subLabel="Nominal Tuition (VND)" name="courseFeePerStudent" required type="number" placeholder="0" defaultValue={formData.courseFeePerStudent} />
                  <Field label="Sĩ số học viên tuyển sinh" subLabel="Target Enrollment" name="totalStudents" required type="number" placeholder="0" defaultValue={formData.totalStudents} />
                </div>
              </div>

              {/* Form Section 2: Staffing (Teacher & TA) */}
              <div className="space-y-6 bg-white/[0.01] p-6 sm:p-8 rounded-[1.75rem] border border-white/5 hover:border-white/10 transition-all duration-300 shadow-inner">
                <div className="flex items-center gap-3 text-slate-200 border-l-4 border-emerald-500 pl-4">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h2 className="text-base font-extrabold uppercase tracking-wider leading-tight text-white">Đội ngũ giảng dạy</h2>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Academic Staffing (Teachers & TAs)</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 pt-2">
                  <Field label="Số buổi học" subLabel="Sessions" name="totalSessions" required type="number" placeholder="0" defaultValue={formData.totalSessions} />
                  <Field label="Giờ / buổi" subLabel="Hours/Session" name="hoursPerSession" required type="number" step="0.5" placeholder="0.0" defaultValue={formData.hoursPerSession} />
                  <Field label="Lương GV chính / giờ (VNĐ)" subLabel="Main Teacher Wage" name="teacherSalaryPerHour" required type="number" placeholder="0" defaultValue={formData.teacherSalaryPerHour} />
                  <Field label="Số trợ giảng/lớp" subLabel="TAs per Class" name="assistantsPerSession" type="number" placeholder="0" defaultValue={formData.assistantsPerSession} />
                  <Field label="Lương trợ giảng/giờ (VNĐ)" subLabel="TA Wage (Hourly)" name="assistantSalaryPerHour" type="number" placeholder="0" defaultValue={formData.assistantSalaryPerHour} />
                </div>
              </div>

              {/* Form Section 3 & 4 Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Form: Overhead */}
                <div className="space-y-6 bg-white/[0.01] p-6 sm:p-8 rounded-[1.75rem] border border-white/5 hover:border-white/10 transition-all duration-300">
                  <div className="flex items-center gap-3 text-slate-200 border-l-4 border-violet-500 pl-4">
                    <LayoutDashboard className="w-5 h-5 text-violet-400" />
                    <div>
                      <h2 className="text-base font-extrabold uppercase tracking-wider text-white leading-tight">Định phí cố định & Vận hành phòng</h2>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Fixed Overhead & Classroom Utilities</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 pt-2">
                    <Field compact label="Mặt bằng / Phòng học thuê" subLabel="Facility Rental" name="fixedVenueCost" type="number" defaultValue={formData.fixedVenueCost} />
                    <Field compact label="Thiết kế & in ấn học liệu cố định" subLabel="Fixed Materials" name="fixedMaterialsCost" type="number" defaultValue={formData.fixedMaterialsCost} />
                    <Field compact label="Phí nền tảng & công nghệ cố định" subLabel="Fixed Tech Software" name="fixedTechnologyCost" type="number" defaultValue={formData.fixedTechnologyCost} />
                    <Field compact label="Hành chính & Quản lý cơ sở" subLabel="Admin Staff Overhead" name="fixedAdminCost" type="number" defaultValue={formData.fixedAdminCost} />
                    <div className="grid grid-cols-2 gap-4">
                      <Field compact label="Điện nước mạng / giờ dạy" subLabel="Utilities / Hour" name="utilitiesPerHour" type="number" defaultValue={formData.utilitiesPerHour} />
                      <Field compact label="Khấu hao thiết bị / buổi học" subLabel="Depreciation / Session" name="depreciationPerSession" type="number" defaultValue={formData.depreciationPerSession} />
                    </div>
                  </div>
                </div>

                {/* Right Form: Variable costs & CAC */}
                <div className="space-y-6 bg-indigo-950/10 p-6 sm:p-8 rounded-[1.75rem] border border-white/5 hover:border-white/10 transition-all duration-300">
                  <div className="flex items-center gap-3 text-slate-200 border-l-4 border-indigo-400 pl-4">
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h2 className="text-base font-extrabold uppercase tracking-wider text-white leading-tight">Biến phí học viên & Ưu đãi chiết khấu</h2>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Variable Costs & Promotional Discounts</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 pt-2">
                    <Field compact label="Chi phí Marketing trên mỗi học viên" subLabel="Marketing per Student (CAC)" name="varRecruitmentPerStudent" type="number" defaultValue={formData.varRecruitmentPerStudent} />
                    <Field compact label="Đầu tư cho Quản lý / Định phí Marketing" subLabel="Fixed Marketing Budget" name="fixedMarketingCost" type="number" defaultValue={formData.fixedMarketingCost} />
                    <div className="grid grid-cols-2 gap-4">
                      <Field compact label="Giáo trình & Quà tặng / học viên" subLabel="Student Books & Gifts" name="varMaterialsPerStudent" type="number" defaultValue={formData.varMaterialsPerStudent} />
                      <Field compact label="LMS / học viên" subLabel="LMS / Student" name="varTechnologyPerStudent" type="number" defaultValue={formData.varTechnologyPerStudent} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field compact label="Biến phí khác / học viên" subLabel="Other Variable / Student" name="varOtherPerStudent" type="number" defaultValue={formData.varOtherPerStudent} />
                      <div className="hidden"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <Field compact label="Chiết khấu giảm giá bình quân %" subLabel="Avg Promo Discount %" name="averageDiscountPercent" type="number" placeholder="0" defaultValue={formData.averageDiscountPercent} />
                      <Field compact label="Tỷ lệ học viên tái đăng ký %" subLabel="Expected Retention %" name="expectedRetentionRate" type="number" placeholder="0" defaultValue={formData.expectedRetentionRate} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Server Error Alert Box */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-rose-950/30 border border-rose-500/20 text-rose-200 px-6 py-4 rounded-2xl flex items-center gap-3.5 shadow-lg"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  <span className="font-semibold text-sm leading-relaxed">{error}</span>
                </motion.div>
              )}

              {/* Footer Form Button Row */}
              <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-xs text-slate-400 max-w-sm flex items-start gap-2.5 italic">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400 animate-pulse" />
                  <span>Báo cáo kiểm toán hiển thị trực quan đồng thời cả thuật ngữ kinh tế Việt - Anh.</span>
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 py-4 px-10 border border-indigo-400/20 rounded-2xl shadow-xl text-lg font-black text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 transform active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Tính toán & Kiểm toán</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Bento Results Dashboard */}
        <AnimatePresence>
          {results && (
            <motion.div 
              ref={resultsRef}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="space-y-12 pb-24"
            >
              
              {/* Results Bento Row 1: Circular Health Score HUD & LTV renewal metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. Health Score Circular Dashboard HUD (4 Cols) */}
                <div className="lg:col-span-4 glass-panel rounded-[2.25rem] p-8 flex flex-col items-center justify-between text-center relative overflow-hidden border border-white/5 group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Activity className="w-28 h-28 text-white" />
                  </div>
                  
                  {/* Panel Title */}
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 font-extrabold text-[9px] tracking-wider uppercase shadow-inner">
                      <Activity className="w-3 h-3 text-indigo-400" />
                      Hệ thống kiểm toán sức khỏe / Health Score
                    </span>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Financial Audit health</h4>
                  </div>

                  {/* Breathtaking double-ring Circular HUD Gauge */}
                  <div className="relative my-8 flex items-center justify-center">
                    {/* Ring Glow Pulse */}
                    <div className={cn(
                      "absolute inset-0 rounded-full blur-2xl opacity-10 transition-colors duration-1000",
                      results.healthScore >= 80 ? "bg-emerald-500" :
                      results.healthScore >= 50 ? "bg-amber-500" : "bg-rose-500"
                    )} />
                    
                    <svg className="w-40 h-40 transform -rotate-90 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.15)]">
                      {/* Outer track line */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        className="stroke-slate-800/40"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      {/* Inner precision dotted line track */}
                      <circle
                        cx="80"
                        cy="80"
                        r="52"
                        className="stroke-slate-900/50"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        fill="transparent"
                      />
                      {/* Active glowing indicator ring */}
                      <motion.circle
                        cx="80"
                        cy="80"
                        r="60"
                        className={cn(
                          "transition-all duration-1000",
                          results.healthScore >= 80 ? "stroke-emerald-400" :
                          results.healthScore >= 50 ? "stroke-amber-400" : "stroke-rose-400"
                        )}
                        strokeWidth="6"
                        strokeLinecap="round"
                        fill="transparent"
                        strokeDasharray="377" // 2 * PI * r (r=60) = 376.99
                        initial={{ strokeDashoffset: 377 }}
                        animate={{ strokeDashoffset: 377 - (377 * results.healthScore) / 100 }}
                        transition={{ duration: 1.8, ease: "circOut" }}
                      />
                    </svg>
                    
                    {/* Center HUD Core */}
                    <div className="absolute flex flex-col items-center justify-center w-28 h-28 bg-[#090e24]/90 rounded-full border border-white/5 shadow-2xl hud-pulse">
                      <span className="text-4xl font-extrabold tracking-tighter text-white leading-none font-mono">
                        {results.healthScore}
                      </span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">ĐIỂM / SCORE</span>
                    </div>
                  </div>

                  {/* Status pills */}
                  <div className="pt-2">
                    <span className={cn(
                      "font-extrabold text-[10px] uppercase tracking-wider py-2 px-6 rounded-full border shadow-lg backdrop-blur-md transition-all duration-500",
                      results.healthScore >= 80 ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                      results.healthScore >= 50 ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
                      "bg-rose-500/10 text-rose-300 border-rose-500/20"
                    )}>
                      {results.healthScore >= 80 ? "VẬN HÀNH TỐI ƯU / OPTIMAL" :
                       results.healthScore >= 50 ? "RỦI RO TRUNG BÌNH / WARNING" : "BÁO ĐỘNG RỦI RO / CRITICAL"}
                    </span>
                  </div>
                </div>

                {/* 2. Customer Lifetime Value & Marketing Efficiency Bento (8 Cols) */}
                <div className="lg:col-span-8 glass-panel rounded-[2.25rem] p-8 sm:p-10 shadow-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between group">
                  <div className="absolute -top-12 -right-12 p-6 opacity-[0.02] pointer-events-none select-none">
                    <Award className="w-72 h-72 text-white" />
                  </div>

                  {/* Upper Row: Total Net LTV and Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 font-extrabold text-[9px] tracking-wider uppercase shadow-inner">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        Giá trị vòng đời trọn đời / Course Renewal LTV
                      </span>
                      <h3 className="text-xl font-extrabold text-white tracking-tight">Dự phóng học viên tái đăng ký khóa học</h3>
                    </div>
                    <div className="text-left md:text-right flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">DỰ BÁO CHỈ SỐ LTV / CLV FORECAST</span>
                      <span className="text-3xl sm:text-4xl font-extrabold text-indigo-400 tracking-tighter pt-1 font-mono">
                        {formatCurrency(results.customerLifetimeValue)}
                      </span>
                    </div>
                  </div>

                  {/* Lower Row: Metric Breakdown Grid + Glowing Dial */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                    {/* Net Student tuition */}
                    <div className="bg-[#04060e]/60 rounded-2xl p-4 border border-white/5 shadow-inner">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">HỌC PHÍ THỰC THU / NET TUITION</span>
                      <span className="text-lg font-bold text-slate-100 font-mono">{formatCurrency(results.netFeePerStudent)}</span>
                      <span className="text-[8px] font-medium text-slate-400 block mt-1.5 leading-relaxed">
                        Đã áp dụng giảm giá {formData.averageDiscountPercent || "0"}%
                      </span>
                    </div>
                    {/* Renewal percentage */}
                    <div className="bg-[#04060e]/60 rounded-2xl p-4 border border-white/5 shadow-inner">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">TỶ LỆ TÁI KÝ / RENEWAL RATE</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">{formData.expectedRetentionRate || "0"}%</span>
                      <span className="text-[8px] font-medium text-slate-400 block mt-1.5 leading-relaxed">
                        Tái ký kỳ vọng ở học kỳ tiếp theo
                      </span>
                    </div>
                    {/* CAC Efficiency Neon speedometer Slider Dial */}
                    <div className="bg-[#04060e]/60 rounded-2xl p-4 border border-white/5 shadow-inner flex flex-col justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">HIỆU QUẢ MARKETING / LTV to CAC Ratio</span>
                        <span className={cn(
                          "text-lg font-bold tracking-tighter block font-mono",
                          Number(formData.varRecruitmentPerStudent || 0) === 0 ? "text-slate-400" :
                          results.ltvCacRatio >= 5 ? "text-indigo-400" :
                          results.ltvCacRatio >= 3 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {Number(formData.varRecruitmentPerStudent || 0) > 0 ? `${results.ltvCacRatio.toFixed(2)}x` : "N/A"}
                        </span>
                      </div>
                      
                      {/* Interactive visual Dial Dial Speedometer */}
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden relative border border-white/5">
                          {/* Colored multi-stop indicator track backplane */}
                          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/80 via-amber-500/80 to-emerald-500/80" />
                          {/* Translucent overlay */}
                          <div className="absolute inset-0 bg-slate-950/20" />
                          
                          {Number(formData.varRecruitmentPerStudent || 0) > 0 ? (
                            <motion.div 
                              initial={{ left: 0 }}
                              animate={{ left: `${Math.min(Math.max((results.ltvCacRatio / 8) * 100, 0), 96)}%` }}
                              transition={{ duration: 1.8, ease: "circOut" }}
                              className="absolute top-0 w-2.5 h-full bg-white rounded-full -translate-x-1 border border-black shadow-[0_0_8px_rgba(255,255,255,1)]"
                            />
                          ) : null}
                        </div>
                        <div className="flex justify-between text-[6px] font-black text-slate-500 uppercase tracking-widest pt-0.5">
                          <span>Risk (&lt;3)</span>
                          <span>Good (3-5)</span>
                          <span>Max (&gt;5)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Results Bento Row 2: Advisory Strategic Ledger & Cost Distribution Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. Advisory Strategy Recommendations Panel (7 Cols) */}
                <div className="lg:col-span-7 bg-[#0b0f24]/85 rounded-[2.25rem] p-6 sm:p-9 shadow-xl border border-white/5 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                  
                  {/* Section Title */}
                  <div className="flex items-center gap-3.5 pb-4 border-b border-white/5">
                    <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 shrink-0 border border-indigo-500/20 shadow-inner">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold uppercase tracking-wider text-white">Ý kiến kiểm toán & Đề xuất hành động</h3>
                      <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Strategic Audit & Financial Advisory Matrix</p>
                    </div>
                  </div>

                  {/* Scrollable list */}
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-3 scrollbar-thin">
                    {results.recommendations.map((rec, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.015]",
                          rec.type === "warning" ? "bg-rose-950/20 border-rose-500/10 hover:bg-rose-950/30 hover:border-rose-500/25" :
                          rec.type === "success" ? "bg-emerald-950/20 border-emerald-500/10 hover:bg-emerald-950/30 hover:border-emerald-500/25" :
                          "bg-indigo-950/25 border-indigo-500/10 hover:bg-indigo-950/35 hover:border-indigo-500/25"
                        )}
                      >
                        <div className={cn(
                          "p-2.5 rounded-xl shrink-0 mt-0.5 shadow-lg",
                          rec.type === "warning" ? "bg-rose-500 text-white" :
                          rec.type === "success" ? "bg-emerald-500 text-white" :
                          "bg-indigo-600 text-white"
                        )}>
                          {rec.type === "warning" ? <AlertTriangle className="w-4 h-4 animate-bounce" /> :
                           rec.type === "success" ? <ShieldCheck className="w-4 h-4" /> :
                           <Info className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest block",
                            rec.type === "warning" ? "text-rose-400" :
                            rec.type === "success" ? "text-emerald-400" :
                            "text-indigo-300"
                          )}>
                            {rec.type === "warning" ? "Hạn chế & Rủi ro tài chính / Critical Risk" :
                             rec.type === "success" ? "Điểm mạnh tối ưu / Profit Strategy" :
                             "Khuyến nghị đề xuất / Advisory Details"}
                          </span>
                          <p className="text-slate-200 text-sm font-semibold leading-relaxed">
                            {rec.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Interactive Segmented Cost Structure Chart (5 Cols) */}
                <div className="lg:col-span-5 bg-[#0b0f24]/85 rounded-[2.25rem] p-6 sm:p-9 shadow-xl border border-white/5 flex flex-col justify-between space-y-6">
                  
                  {/* Title Section */}
                  <div className="flex items-center gap-3.5 pb-4 border-b border-white/5">
                    <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-400 shrink-0 border border-emerald-500/20 shadow-inner">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold uppercase tracking-wider text-white">Cơ cấu phân bổ chi phí thực tế</h3>
                      <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Invested Capital Distribution Breakdown</p>
                    </div>
                  </div>

                  {/* Graphical Stacked Segmented Bar */}
                  <div className="space-y-8 flex-grow flex flex-col justify-center py-4">
                    <div className="w-full h-8 bg-slate-950/70 rounded-2xl p-1 border border-white/5 overflow-hidden flex shadow-inner relative">
                      {/* Teaching Cost Segment */}
                      {results.teachingCostRatio > 0 && (
                        <motion.div 
                          title="Chi phí giảng dạy"
                          initial={{ width: 0 }}
                          animate={{ width: `${results.teachingCostRatio}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="bg-indigo-600 h-full text-white text-[10px] font-black flex items-center justify-center cursor-default rounded-l-xl hover:opacity-90 transition-opacity border-r border-slate-950 shadow-lg relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                          {results.teachingCostRatio > 18 && `${results.teachingCostRatio.toFixed(0)}%`}
                        </motion.div>
                      )}
                      
                      {/* Marketing CAC Segment */}
                      {results.acquisitionCostRatio > 0 && (
                        <motion.div 
                          title="Chi phí Marketing"
                          initial={{ width: 0 }}
                          animate={{ width: `${results.acquisitionCostRatio}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="bg-emerald-500 h-full text-white text-[10px] font-black flex items-center justify-center cursor-default hover:opacity-90 transition-opacity border-r border-slate-950 shadow-lg relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                          {results.acquisitionCostRatio > 18 && `${results.acquisitionCostRatio.toFixed(0)}%`}
                        </motion.div>
                      )}
                      
                      {/* Facility Utilities & Depreciation Segment */}
                      {100 - results.teachingCostRatio - results.acquisitionCostRatio > 0 && (
                        <motion.div 
                          title="Vận hành & Phòng học"
                          initial={{ width: 0 }}
                          animate={{ width: `${100 - results.teachingCostRatio - results.acquisitionCostRatio}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="bg-slate-500 h-full text-white text-[10px] font-black flex items-center justify-center cursor-default rounded-r-xl hover:opacity-90 transition-opacity shadow-lg relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                          {100 - results.teachingCostRatio - results.acquisitionCostRatio > 18 && 
                            `${(100 - results.teachingCostRatio - results.acquisitionCostRatio).toFixed(0)}%`}
                        </motion.div>
                      )}
                    </div>

                    {/* Detailed Stats Legend with custom accents */}
                    <div className="grid grid-cols-1 gap-4 pt-2">
                      <div className="flex items-center justify-between text-sm py-1 border-b border-white/[0.03] px-1">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 bg-indigo-600 rounded-md shadow-lg shadow-indigo-600/40 shrink-0" />
                          <span className="text-slate-350 font-bold text-xs">Học thuật / Teaching Cost (GV + TA)</span>
                        </div>
                        <span className="font-extrabold text-slate-100 font-mono">{results.teachingCostRatio.toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm py-1 border-b border-white/[0.03] px-1">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 bg-emerald-500 rounded-md shadow-lg shadow-emerald-500/40 shrink-0" />
                          <span className="text-slate-350 font-bold text-xs">Chiêu sinh / Marketing & CAC Expenses</span>
                        </div>
                        <span className="font-extrabold text-slate-100 font-mono">{results.acquisitionCostRatio.toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm py-1 px-1">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 bg-slate-500 rounded-md shadow-lg shrink-0" />
                          <span className="text-slate-350 font-bold text-xs">Vận hành phòng / Utilities & Classroom Overhead</span>
                        </div>
                        <span className="font-extrabold text-slate-100 font-mono">
                          {(100 - results.teachingCostRatio - results.acquisitionCostRatio).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Results Bento Row 3: Corporate Cash Ledger & Advanced KPIs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* 1. Cash Balance Sheet Ledger (Bilingual) */}
                <div className="glass-panel rounded-[2.25rem] shadow-2xl border border-white/5 overflow-hidden">
                  <div className="py-6 px-8 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <BarChart3 className="w-5 h-5 text-indigo-400 animate-pulse" />
                      <div className="flex flex-col">
                        <h3 className="text-base font-extrabold uppercase tracking-tight text-white">Cân đối dòng tiền & Chi phí ròng</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Financial Cash Flow Ledger</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 sm:p-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                     <StatItem label="Chi phí trợ giảng" subLabel="Assistant Cost (TA)" value={formatCurrency(results.assistantCost)} />
                     <StatItem label="Hao mòn tiện ích phòng" subLabel="Classroom Wear & Utilities" value={formatCurrency(results.classroomOverhead)} />
                     <StatItem label="Định phí cố định tổng" subLabel="Total Fixed Cost" value={formatCurrency(results.totalFixedCost)} />
                     <StatItem label="Biến phí biến đổi tổng" subLabel="Total Variable Cost" value={formatCurrency(results.totalVariableCost)} />
                     <StatItem label="Tổng chi phí tích lũy" subLabel="Total Invested Cost" value={formatCurrency(results.totalCost)} highlighted />
                     <StatItem label="Doanh thu thực thu ròng" subLabel="Net Tuition Revenue" value={formatCurrency(results.totalRevenue)} highlighted />
                  </div>
                </div>

                {/* 2. Corporate KPIs & Ratios Indicators */}
                <div className="glass-panel rounded-[2.25rem] shadow-2xl border border-white/5 overflow-hidden">
                  <div className="py-6 px-8 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <Percent className="w-5 h-5 text-emerald-400" />
                      <div className="flex flex-col">
                        <h3 className="text-base font-extrabold uppercase tracking-tight text-white">Chỉ số đo lường hiệu suất (KPIs)</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Financial Indicators & Ratios</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailed Indicator rows */}
                  <div className="p-6 sm:p-8 space-y-2">
                    <MetricRow label="Ngưỡng học viên hòa vốn" subLabel="Break-even Enrollment" value={results.breakEvenStudents.toFixed(1)} suffix="Học viên" suffixEn="Students" />
                    <MetricRow label="Doanh thu hòa vốn thực tế" subLabel="Break-even Revenue Threshold" value={formatCurrency(results.breakEvenRevenue)} />
                    
                    {/* Margin of Safety Row with pulsing color status */}
                    <div className="flex items-center justify-between py-3 border-b border-white/[0.03] px-2 -mx-2 hover:bg-white/[0.02] transition-colors rounded-lg">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-slate-300 text-xs font-bold tracking-tight leading-tight">Biên an toàn tài chính</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Financial Safety Margin</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn(
                          "text-2xl font-black tracking-tighter font-mono",
                          results.safetyMarginPercent >= 20 ? "text-emerald-400" :
                          results.safetyMarginPercent >= 0 ? "text-amber-400" : "text-rose-400"
                        )}>
                          {results.safetyMarginPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <MetricRow label="Tỷ suất lợi nhuận đóng góp (CMR)" subLabel="Contribution Margin Ratio (CMR)" value={`${results.contributionMarginRatio.toFixed(1)}%`} />
                    <MetricRow label="Độ lớn đòn bẩy vận hành" subLabel="Degree of Operating Leverage (DOL)" value={results.operatingLeverage.toFixed(2)} />
                    <MetricRow label="Tổng chi phí phân bổ / Học viên" subLabel="Invested Cost per Student" value={formatCurrency(results.costPerStudent)} />
                    <MetricRow label="Lợi nhuận đóng góp / Học viên" subLabel="Contribution Margin per Student" value={formatCurrency(results.marginPerStudent)} />
                    <MetricRow label="Doanh thu / Giờ GV đứng lớp" subLabel="Revenue per Class-Hour (RevPCH)" value={formatCurrency(results.revenuePerInstructorHour)} />
                  </div>
                </div>

              </div>

              {/* Action buttons footer */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                 <button
                   onClick={downloadCSV}
                   className="w-full sm:w-auto group flex items-center justify-center gap-3.5 py-5 px-10 bg-white text-slate-950 border border-slate-200 rounded-2xl shadow-[0_15px_30px_rgba(255,255,255,0.05)] text-base font-black hover:bg-slate-100 transition-all duration-300 transform active:scale-95 cursor-pointer"
                 >
                   <Download className="w-5 h-5 text-indigo-600 transition-colors" />
                   <span>Xuất báo cáo kiểm toán song ngữ (CSV)</span>
                 </button>
                 <button
                   onClick={() => { 
                     setResults(null); 
                     formRef.current?.reset();
                     setFormData({});
                     setActivePreset("");
                     window.scrollTo({ top: 0, behavior: 'smooth' }); 
                   }}
                   className="w-full sm:w-auto flex items-center justify-center gap-3.5 py-5 px-10 bg-slate-950/60 border border-white/10 rounded-2xl shadow-lg text-base font-extrabold text-slate-350 hover:bg-slate-900/60 hover:text-white transition-all duration-300 transform active:scale-95 cursor-pointer"
                 >
                   <RefreshCcw className="w-4 h-4 transition-transform hover:rotate-180 duration-500 text-slate-400" />
                   <span>Lập hồ sơ kiểm toán mới</span>
                 </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}

// Sub-components designed to maintain high readability, accessibility, and zero text overlaps

interface FieldProps {
  label: string;
  subLabel?: string;
  name: string;
  id?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
  compact?: boolean;
  defaultValue?: string;
}

function Field({ label, subLabel, name, id, type = "text", required, placeholder, step, compact, defaultValue }: FieldProps) {
  const inputId = id || name;
  return (
    <div className="flex flex-col gap-1.5 group min-w-0">
      <label 
        htmlFor={inputId}
        className="font-extrabold tracking-tight transition-colors group-focus-within:text-indigo-400 flex flex-col"
      >
        <span className={cn(compact ? "text-xs" : "text-sm", "leading-normal text-slate-200")}>
          {label} {required && <span className="text-rose-400">*</span>}
        </span>
        {subLabel && (
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-normal mt-0.5 block">
            {subLabel}
          </span>
        )}
      </label>
      <input
        id={inputId}
        type={type}
        name={name}
        required={required}
        step={step}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={cn(
          "w-full bg-[#030611]/80 hover:bg-slate-950 border border-white/5 hover:border-white/15 focus:bg-[#030611] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all rounded-2xl px-4 text-white font-semibold outline-none",
          compact ? "py-2.5 text-xs shadow-inner" : "py-3.5 text-sm shadow-md"
        )}
      />
    </div>
  );
}

interface StatItemProps {
  label: string;
  subLabel?: string;
  value: string;
  highlighted?: boolean;
}

function StatItem({ label, subLabel, value, highlighted }: StatItemProps) {
  return (
    <div className="space-y-1.5 min-w-0 flex flex-col">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate leading-tight block">
        {label}
      </span>
      {subLabel && (
        <span className="text-[8px] font-black text-indigo-400/80 uppercase tracking-wider leading-none truncate block">
          {subLabel}
        </span>
      )}
      <span className={cn(
        "font-extrabold tracking-tighter leading-normal pt-0.5 truncate block font-mono hover:text-clip hover:whitespace-normal",
        highlighted 
          ? "text-indigo-400 text-xl xs:text-2xl sm:text-3xl" 
          : "text-slate-100 text-base xs:text-lg sm:text-xl md:text-2xl"
      )}>
        {value}
      </span>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  subLabel?: string;
  value: string;
  suffix?: string;
  suffixEn?: string;
}

// Advanced flexible Row to adapt fully to multiple layouts, preventing clipping of text tags
function MetricRow({ label, subLabel, value, suffix, suffixEn }: MetricRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg px-2 -mx-2 min-w-0">
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-slate-200 text-xs font-semibold tracking-tight leading-normal truncate hover:text-clip hover:whitespace-normal">
          {label}
        </span>
        {subLabel && (
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 leading-normal truncate hover:text-clip hover:whitespace-normal">
            {subLabel}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 self-stretch sm:self-auto text-right">
        <span className="text-base sm:text-lg font-bold text-slate-100 tracking-tighter font-mono">
          {value}
        </span>
        {suffix && (
          <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest leading-none flex flex-col items-end shrink-0 pl-1">
            <span>{suffix}</span>
            {suffixEn && <span className="text-[6px] opacity-60 mt-0.5">{suffixEn}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
