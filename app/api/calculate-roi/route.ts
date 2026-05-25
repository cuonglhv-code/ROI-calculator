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
  varRefreshmentsPerStudent: z.coerce.number().nonnegative().default(0),
  varTransactionFeePerStudent: z.coerce.number().nonnegative().default(0),
  varRecruitmentPerStudent: z.coerce.number().nonnegative().default(0),
  varOtherPerStudent: z.coerce.number().nonnegative().default(0),
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

    // 3. Core ROI Calculations
    const instructorCost = data.totalSessions * data.hoursPerSession * data.teacherSalaryPerHour;
    const totalFixedCost = instructorCost + data.fixedVenueCost + data.fixedMaterialsCost + data.fixedTechnologyCost + data.fixedAdminCost + data.fixedMarketingCost;
    const totalVarPerStudent = data.varMaterialsPerStudent + data.varTechnologyPerStudent + data.varRefreshmentsPerStudent + data.varTransactionFeePerStudent + data.varRecruitmentPerStudent + data.varOtherPerStudent;
    const totalVariableCost = totalVarPerStudent * data.totalStudents;
    const totalCost = totalFixedCost + totalVariableCost;
    const totalRevenue = data.courseFeePerStudent * data.totalStudents;
    const profit = totalRevenue - totalCost;

    const roiPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    
    // 4. Unit Indicators
    const breakEvenStudents = data.courseFeePerStudent > totalVarPerStudent 
      ? totalFixedCost / (data.courseFeePerStudent - totalVarPerStudent) 
      : 0;
    const costPerStudent = data.totalStudents > 0 ? totalCost / data.totalStudents : 0;
    const marginPerStudent = data.courseFeePerStudent - totalVarPerStudent;
    const instructorCostPerStudent = data.totalStudents > 0 ? instructorCost / data.totalStudents : 0;
    const totalInstructorHours = data.totalSessions * data.hoursPerSession;
    const revenuePerInstructorHour = totalInstructorHours > 0 ? totalRevenue / totalInstructorHours : 0;

    // 5. Comprehensive Financial Audit Calculations
    const contributionMarginRatio = data.courseFeePerStudent > 0 
      ? (marginPerStudent / data.courseFeePerStudent) * 100 
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
      ? (instructorCost / totalCost) * 100 
      : 0;
    const acquisitionCostRatio = totalCost > 0 
      ? ((data.fixedMarketingCost + data.varRecruitmentPerStudent * data.totalStudents) / totalCost) * 100 
      : 0;

    // 6. Financial Health Score (0 - 100)
    let scoreROI = 0;
    if (roiPercent >= 25) scoreROI = 40;
    else if (roiPercent >= 10) scoreROI = 30;
    else if (roiPercent >= 0) scoreROI = 20;
    else scoreROI = Math.max(0, 20 + roiPercent * 0.5); // reduce penalty for mild deficits

    let scoreSafety = 0;
    if (safetyMarginPercent >= 30) scoreSafety = 30;
    else if (safetyMarginPercent >= 15) scoreSafety = 20;
    else if (safetyMarginPercent >= 0) scoreSafety = 10;

    let scoreCMR = 0;
    if (contributionMarginRatio >= 60) scoreCMR = 20;
    else if (contributionMarginRatio >= 40) scoreCMR = 15;
    else if (contributionMarginRatio >= 20) scoreCMR = 10;
    else scoreCMR = 5;

    let scoreTeaching = 0;
    if (teachingCostRatio >= 20 && teachingCostRatio <= 40) scoreTeaching = 10;
    else if (teachingCostRatio > 0) scoreTeaching = 5;

    const healthScore = Math.min(100, Math.max(0, Math.round(scoreROI + scoreSafety + scoreCMR + scoreTeaching)));

    // 7. Dynamic Strategic Advisory Engine (Generates custom business tips based on metrics)
    const recommendations: { type: "warning" | "info" | "success"; text: string }[] = [];

    // Financial Viability Advice
    if (profit < 0) {
      recommendations.push({
        type: "warning",
        text: `Khóa học đang hoạt động dưới điểm hòa vốn và lỗ ${Math.abs(profit).toLocaleString("vi-VN")} VNĐ. Cần lập tức nâng học phí hoặc tối ưu hóa cơ cấu định phí cố định.`
      });
    } else if (roiPercent >= 30) {
      recommendations.push({
        type: "success",
        text: `Tỷ suất ROI vượt trội (${roiPercent.toFixed(1)}%). Đây là một mô hình khóa học tối ưu và có khả năng sinh lời cực lớn, khuyến nghị nhân rộng sang các cơ sở khác.`
      });
    } else {
      recommendations.push({
        type: "info",
        text: `Khóa học có biên lợi nhuận ổn định. Tiếp tục duy trì hiệu suất vận hành hiện tại và tập trung gia tăng sỉ số học viên.`
      });
    }

    // Safety & Enrollment Advice
    if (safetyMarginPercent < 0) {
      const missingStuds = Math.ceil(breakEvenStudents - data.totalStudents);
      recommendations.push({
        type: "warning",
        text: `Lớp học chưa đạt ngưỡng hòa vốn. Cần tuyển thêm ít nhất ${missingStuds} học viên nữa để bắt đầu có lãi, hoặc cân nhắc sáp nhập với các lớp học khác.`
      });
    } else if (safetyMarginPercent < 20) {
      recommendations.push({
        type: "warning",
        text: `Biên an toàn rất mỏng (${safetyMarginPercent.toFixed(1)}%). Chỉ cần sụt giảm từ 1 - 2 học viên là lớp học sẽ bắt đầu lỗ. Hãy tập trung tăng tỷ lệ giữ chân học viên.`
      });
    } else {
      recommendations.push({
        type: "success",
        text: `Biên an toàn ở mức lý tưởng (${safetyMarginPercent.toFixed(1)}%). Lớp học có khả năng chống chịu cao trước biến động nghỉ học hoặc hoãn lớp của học viên.`
      });
    }

    // Cost Efficiency & Leverage Advice
    if (teachingCostRatio > 45) {
      recommendations.push({
        type: "info",
        text: `Chi phí giảng dạy giáo viên chiếm đến ${teachingCostRatio.toFixed(0)}% tổng ngân sách (ngưỡng lý tưởng: 25-35%). Nên thương lượng lương khoán theo lớp học hoặc tăng nhẹ sỉ số học viên mỗi lớp.`
      });
    } else if (acquisitionCostRatio > 35) {
      recommendations.push({
        type: "warning",
        text: `Chi phí tuyển sinh & Marketing chiếm tỷ trọng lớn (${acquisitionCostRatio.toFixed(0)}% chi phí). Cần rà soát các kênh truyền thông và cải thiện tỷ lệ chuyển đổi bán hàng.`
      });
    } else if (operatingLeverage > 0.7) {
      recommendations.push({
        type: "info",
        text: `Đòn bẩy vận hành ở mức cao (${(operatingLeverage * 100).toFixed(0)}% chi phí là cố định). Mô hình này sẽ sinh lời bùng nổ khi gia tăng học viên mà không tăng thêm nhiều chi phí.`
      });
    } else {
      recommendations.push({
        type: "info",
        text: `Cơ cấu chi phí cân bằng. Lợi nhuận đóng góp của mỗi học viên đạt ${(contributionMarginRatio).toFixed(0)}% học phí, cho phép linh hoạt triển khai các chương trình học bổng.`
      });
    }

    // Standard single-line interpretation
    let interpretation = "";
    if (totalCost === 0 && totalRevenue > 0) {
      interpretation = `Không có chi phí; ${totalRevenue.toLocaleString("vi-VN")} VNĐ lợi nhuận thuần.`;
    } else if (roiPercent >= 20) {
      interpretation = `LỢI NHUẬN CAO: ${roiPercent.toFixed(1)}% ROI`;
    } else if (roiPercent >= 10) {
      interpretation = `LỢI NHUẬN TỐT: ${roiPercent.toFixed(1)}% ROI`;
    } else if (roiPercent >= 0) {
      interpretation = `BIÊN THẤP: ${roiPercent.toFixed(1)}% ROI`;
    } else {
      interpretation = `ĐANG LỖ: ${roiPercent.toFixed(1)}% ROI`;
    }

    // 8. Decoupled Neon Database Logging for High Resilience
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
          operating_leverage, teaching_cost_ratio, acquisition_cost_ratio, health_score
        ) VALUES (
          ${data.courseName}, ${data.courseFeePerStudent}, ${data.totalStudents}, ${data.totalSessions}, ${data.hoursPerSession},
          ${data.teacherSalaryPerHour}, ${data.fixedVenueCost}, ${data.fixedMaterialsCost}, ${data.fixedTechnologyCost}, ${data.fixedAdminCost},
          ${data.fixedMarketingCost}, ${data.varMaterialsPerStudent}, ${data.varTechnologyPerStudent}, ${data.varRefreshmentsPerStudent}, ${data.varTransactionFeePerStudent},
          ${data.varRecruitmentPerStudent}, ${data.varOtherPerStudent}, ${totalFixedCost}, ${totalVariableCost}, ${totalCost},
          ${totalRevenue}, ${profit}, ${roiPercent}, ${breakEvenStudents}, ${costPerStudent},
          ${marginPerStudent}, ${instructorCostPerStudent}, ${revenuePerInstructorHour},
          ${contributionMarginRatio}, ${breakEvenRevenue}, ${safetyMarginPercent},
          ${operatingLeverage}, ${teachingCostRatio}, ${acquisitionCostRatio}, ${healthScore}
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
      operatingLeverage, teachingCostRatio, acquisitionCostRatio, healthScore, recommendations
    });
  } catch (error) {
    console.error("ROI calculation runtime failure:", error);
    return NextResponse.json({ error: "Thất bại khi thực hiện tính toán ROI" }, { status: 500 });
  }
}
