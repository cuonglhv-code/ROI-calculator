import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sql = neon(process.env.DATABASE_URL!);

// 1. Zod validation schema for rigorous boundary checks and automatic type coercion
const ROICalculatorSchema = z.object({
  courseName: z.string().min(1, "Tên khóa học không được để trống").default("Unnamed Course"),
  courseFeePerStudent: z.coerce.number().nonnegative("Học phí phải là số dương").default(0),
  totalStudents: z.coerce.number().int("Số lượng học viên phải là số nguyên").nonnegative("Số lượng học viên phải là số dương").default(0),
  
  totalSessions: z.coerce.number().int("Số buổi học phải là số nguyên").nonnegative("Số buổi học phải là số dương").default(0),
  hoursPerSession: z.coerce.number().nonnegative("Số giờ dạy mỗi buổi phải là số dương").default(0),
  teacherSalaryPerHour: z.coerce.number().nonnegative("Lương giáo viên phải là số dương").default(0),
  
  fixedVenueCost: z.coerce.number().nonnegative().default(0),
  fixedMaterialsCost: z.coerce.number().nonnegative().default(0),
  fixedTechnologyCost: z.coerce.number().nonnegative().default(0),
  fixedAdminCost: z.coerce.number().nonnegative().default(0),
  fixedMarketingCost: z.coerce.number().nonnegative().default(0),
  
  varMaterialsPerStudent: z.coerce.number().nonnegative().default(0),
  varTechnologyPerStudent: z.coerce.number().nonnegative().default(0),
  varRecruitmentPerStudent: z.coerce.number().nonnegative().default(0),
  varOtherPerStudent: z.coerce.number().nonnegative().default(0),

  // New Advanced inputs
  assistantsPerSession: z.coerce.number().int().nonnegative().default(0),
  assistantSalaryPerHour: z.coerce.number().nonnegative().default(0),
  averageDiscountPercent: z.coerce.number().nonnegative().max(100, "Giảm giá tối đa 100%").default(0),
  utilitiesPerHour: z.coerce.number().nonnegative().default(0),
  depreciationPerSession: z.coerce.number().nonnegative().default(0),
  expectedRetentionRate: z.coerce.number().nonnegative().max(100, "Tái tuyển sinh tối đa 100%").default(0)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 2. Safe Parsing of form payload
    const parseResult = ROICalculatorSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: "Dữ liệu nhập vào không hợp lệ",
        details: parseResult.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const data = parseResult.data;

    // 3. Core ROI Calculations - Teaching and Direct Overhead
    const instructorCost = data.totalSessions * data.hoursPerSession * data.teacherSalaryPerHour;
    const assistantCost = data.totalSessions * data.hoursPerSession * data.assistantsPerSession * data.assistantSalaryPerHour;
    const totalTeachingCost = instructorCost + assistantCost;

    const classroomOverhead = (data.utilitiesPerHour * data.hoursPerSession + data.depreciationPerSession) * data.totalSessions;

    // Adjusted fixed cost and variable cost structures
    const totalFixedCost = totalTeachingCost + data.fixedVenueCost + data.fixedMaterialsCost + data.fixedTechnologyCost + data.fixedAdminCost + data.fixedMarketingCost + classroomOverhead;
    const totalVarPerStudent = data.varMaterialsPerStudent + data.varTechnologyPerStudent + data.varRecruitmentPerStudent + data.varOtherPerStudent;
    const totalVariableCost = totalVarPerStudent * data.totalStudents;
    const totalCost = totalFixedCost + totalVariableCost;

    // Tuition Net Revenue Calculations after Discount deductions
    const netFeePerStudent = data.courseFeePerStudent * (1 - data.averageDiscountPercent / 100);
    const totalRevenue = netFeePerStudent * data.totalStudents;
    const profit = totalRevenue - totalCost;
    const roiPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    
    // 4. Unit Indicators
    const breakEvenStudents = netFeePerStudent > totalVarPerStudent 
      ? totalFixedCost / (netFeePerStudent - totalVarPerStudent) 
      : 0;
    const costPerStudent = data.totalStudents > 0 ? totalCost / data.totalStudents : 0;
    const marginPerStudent = netFeePerStudent - totalVarPerStudent;
    const instructorCostPerStudent = data.totalStudents > 0 ? totalTeachingCost / data.totalStudents : 0;
    const totalInstructorHours = data.totalSessions * data.hoursPerSession;
    const revenuePerInstructorHour = totalInstructorHours > 0 ? totalRevenue / totalInstructorHours : 0;

    // 5. Comprehensive Financial Audit Calculations
    const contributionMarginRatio = netFeePerStudent > 0 
      ? (marginPerStudent / netFeePerStudent) * 100 
      : 0;
    const breakEvenRevenue = contributionMarginRatio > 0 
      ? totalFixedCost / (contributionMarginRatio / 100) 
      : 0;
    const safetyMarginPercent = data.totalStudents > 0 
      ? ((data.totalStudents - breakEvenStudents) / data.totalStudents) * 100 
      : 0;
    const operatingLeverage = totalCost > 0 
      ? totalFixedCost / totalCost 
      : 0;
    const teachingCostRatio = totalCost > 0 
      ? (totalTeachingCost / totalCost) * 100 
      : 0;
    const acquisitionCostRatio = totalCost > 0 
      ? ((data.fixedMarketingCost + data.varRecruitmentPerStudent * data.totalStudents) / totalCost) * 100 
      : 0;

    // 6. Student Lifetime Value (LTV) and CAC Forecast
    const customerLifetimeValue = data.expectedRetentionRate < 100
      ? netFeePerStudent / (1 - data.expectedRetentionRate / 100)
      : netFeePerStudent * 5; // clamp infinite LTV to 5x net fee

    const ltvCacRatio = data.varRecruitmentPerStudent > 0
      ? customerLifetimeValue / data.varRecruitmentPerStudent
      : 0;

    // 7. Dynamic Financial Health Score (0 - 100)
    let scoreROI = 0;
    if (roiPercent >= 25) scoreROI = 30;
    else if (roiPercent >= 10) scoreROI = 20;
    else if (roiPercent >= 0) scoreROI = 10;
    else scoreROI = Math.max(0, 10 + roiPercent * 0.3);

    let scoreSafety = 0;
    if (safetyMarginPercent >= 30) scoreSafety = 25;
    else if (safetyMarginPercent >= 15) scoreSafety = 15;
    else if (safetyMarginPercent >= 0) scoreSafety = 5;

    let scoreLTV = 15; // default to neutral if CAC is 0
    if (data.varRecruitmentPerStudent > 0) {
      if (ltvCacRatio >= 5) scoreLTV = 25;
      else if (ltvCacRatio >= 3) scoreLTV = 15;
      else scoreLTV = 5;
    }

    let scoreCMR = 0;
    if (contributionMarginRatio >= 60) scoreCMR = 15;
    else if (contributionMarginRatio >= 40) scoreCMR = 10;
    else scoreCMR = 5;

    let scoreStaff = 2;
    if (teachingCostRatio >= 20 && teachingCostRatio <= 40) scoreStaff = 5;

    const healthScore = Math.min(100, Math.max(0, Math.round(scoreROI + scoreSafety + scoreLTV + scoreCMR + scoreStaff)));

    // 8. Dynamic Strategic Advisory Engine
    const recommendations: { type: "warning" | "info" | "success"; text: string }[] = [];

    // LTV/CAC Advisor
    if (data.varRecruitmentPerStudent > 0) {
      if (ltvCacRatio < 3) {
        recommendations.push({
          type: "warning",
          text: `Chỉ số LTV/CAC thấp (${ltvCacRatio.toFixed(1)} < 3.0). Chi phí chiêu sinh học viên (CAC: ${data.varRecruitmentPerStudent.toLocaleString("vi-VN")}đ) quá đắt so với Giá trị trọn đời (LTV: ${customerLifetimeValue.toLocaleString("vi-VN")}đ). Cần nâng cao tỷ lệ tái đăng ký hoặc tối ưu hóa kênh tiếp thị.`
        });
      } else if (ltvCacRatio >= 5) {
        recommendations.push({
          type: "success",
          text: `Tỷ lệ LTV/CAC lý tưởng (${ltvCacRatio.toFixed(1)} > 5.0). Giá trị trọn đời học viên mang lại gấp ${ltvCacRatio.toFixed(0)} lần chi phí tuyển sinh ban đầu. Đề xuất tăng cường ngân sách Marketing để đẩy nhanh tiến độ thu hút.`
        });
      } else {
        recommendations.push({
          type: "success",
          text: `Tỷ lệ LTV/CAC khỏe mạnh (${ltvCacRatio.toFixed(1)}). Hoạt động tuyển sinh và chăm sóc khách hàng đang giữ nhịp độ cân bằng, đạt chuẩn doanh nghiệp giáo dục hiệu quả.`
        });
      }
    } else {
      recommendations.push({
        type: "info",
        text: "Hệ thống chưa ghi nhận biến phí tuyển sinh (CAC). Hãy bổ sung phí chiêu sinh lẻ trên mỗi học viên để kích hoạt bộ đo lường sức khỏe LTV/CAC trọn đời."
      });
    }

    // Discounts & Net pricing Advisor
    if (data.averageDiscountPercent > 15) {
      recommendations.push({
        type: "warning",
        text: `Tỷ lệ chiết khấu giảm giá đang ở mức cao (${data.averageDiscountPercent.toFixed(0)}%). Điều này kéo học phí thực thu ròng xuống còn ${netFeePerStudent.toLocaleString("vi-VN")}đ. Hãy hạn chế giảm giá trực tiếp, đổi sang tặng thêm tài liệu độc quyền.`
      });
    }

    // Staffing / TA Advisor
    if (data.assistantsPerSession > 0 && assistantCost > instructorCost * 0.4) {
      recommendations.push({
        type: "warning",
        text: `Chi phí trợ giảng (${assistantCost.toLocaleString("vi-VN")}đ) đang chiếm tỷ trọng lớn so với giáo viên chính. Khuyến nghị điều chỉnh lại cơ cấu nhiệm vụ trợ giảng hoặc tăng sỉ số lớp.`
      });
    }

    // Profitability Advisor
    if (profit < 0) {
      recommendations.push({
        type: "warning",
        text: `Khóa học đang lỗ ròng ${Math.abs(profit).toLocaleString("vi-VN")}đ. Cần cắt giảm hao mòn vận hành phòng học (${classroomOverhead.toLocaleString("vi-VN")}đ) hoặc nâng học phí lên tối thiểu ${breakEvenRevenue.toLocaleString("vi-VN")}đ để đạt điểm hòa vốn.`
      });
    } else if (roiPercent >= 30) {
      recommendations.push({
        type: "success",
        text: `ROI tuyệt vời (${roiPercent.toFixed(1)}%). Mô hình đào tạo '${data.courseName}' đang vận hành với biên lợi nhuận ròng rất tốt, khuyến nghị nhân rộng sang các cơ sở.`
      });
    }

    // General interpretation
    let interpretation = "";
    if (totalCost === 0 && totalRevenue > 0) {
      interpretation = `Không có chi phí; ${totalRevenue.toLocaleString("vi-VN")} VNĐ lợi nhuận ròng.`;
    } else if (roiPercent >= 20) {
      interpretation = `LỢI NHUẬN CAO: ${roiPercent.toFixed(1)}% ROI`;
    } else if (roiPercent >= 10) {
      interpretation = `LỢI NHUẬN TỐT: ${roiPercent.toFixed(1)}% ROI`;
    } else if (roiPercent >= 0) {
      interpretation = `BIÊN THẤP: ${roiPercent.toFixed(1)}% ROI`;
    } else {
      interpretation = `ĐANG LỖ: ${roiPercent.toFixed(1)}% ROI`;
    }

    // 9. Decoupled Neon Database Logging for High Resilience
    try {
      await sql`
        INSERT INTO roi_calculator_data (
          course_name, fee_per_student, total_students, total_sessions, hours_per_session,
          teacher_salary_per_hour, fixed_venue, fixed_materials, fixed_tech, fixed_admin,
          fixed_marketing, var_materials_per_student, var_tech_per_student,
          var_refreshments_per_student, var_transaction_per_student, var_recruitment_per_student,
          var_other_per_student, total_fixed_cost, total_variable_cost, total_cost,
          total_revenue, profit, roi_percent, break_even_students, cost_per_student,
          margin_per_student, instructor_cost_per_student, revenue_per_instructor_hour,
          contribution_margin_ratio, break_even_revenue, safety_margin_percent,
          operating_leverage, teaching_cost_ratio, acquisition_cost_ratio, health_score,
          
          -- New advanced values
          assistants_per_session, assistant_salary_per_hour, average_discount_percent,
          utilities_per_hour, depreciation_per_session, expected_retention_rate,
          assistant_cost, classroom_overhead, customer_lifetime_value, ltv_cac_ratio
        ) VALUES (
          ${data.courseName}, ${data.courseFeePerStudent}, ${data.totalStudents}, ${data.totalSessions}, ${data.hoursPerSession},
          ${data.teacherSalaryPerHour}, ${data.fixedVenueCost}, ${data.fixedMaterialsCost}, ${data.fixedTechnologyCost}, ${data.fixedAdminCost},
          ${data.fixedMarketingCost}, ${data.varMaterialsPerStudent}, ${data.varTechnologyPerStudent}, 0, 0,
          ${data.varRecruitmentPerStudent}, ${data.varOtherPerStudent}, ${totalFixedCost}, ${totalVariableCost}, ${totalCost},
          ${totalRevenue}, ${profit}, ${roiPercent}, ${breakEvenStudents}, ${costPerStudent},
          ${marginPerStudent}, ${instructorCostPerStudent}, ${revenuePerInstructorHour},
          ${contributionMarginRatio}, ${breakEvenRevenue}, ${safetyMarginPercent},
          ${operatingLeverage}, ${teachingCostRatio}, ${acquisitionCostRatio}, ${healthScore},
          
          -- Advanced entries
          ${data.assistantsPerSession}, ${data.assistantSalaryPerHour}, ${data.averageDiscountPercent},
          ${data.utilitiesPerHour}, ${data.depreciationPerSession}, ${data.expectedRetentionRate},
          ${assistantCost}, ${classroomOverhead}, ${customerLifetimeValue}, ${ltvCacRatio}
        )
      `;
      console.log("ROI calculation successfully logged to Neon database.");
    } catch (dbError: any) {
      console.error("Database persistence warning (Calculations survived):", dbError.message);
    }

    return NextResponse.json({
      totalFixedCost, totalVariableCost, totalCost, totalRevenue, profit, roiPercent, interpretation,
      breakEvenStudents, costPerStudent, marginPerStudent, instructorCostPerStudent, revenuePerInstructorHour,
      contributionMarginRatio, breakEvenRevenue, safetyMarginPercent,
      operatingLeverage, teachingCostRatio, acquisitionCostRatio, healthScore,
      
      // Advanced audit output metrics
      assistantCost, classroomOverhead, customerLifetimeValue, ltvCacRatio, netFeePerStudent, recommendations
    });
  } catch (error) {
    console.error("ROI calculation runtime failure:", error);
    return NextResponse.json({ error: "Thất bại khi thực hiện tính toán ROI" }, { status: 500 });
  }
}
