import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sql = neon(process.env.DATABASE_URL!);

// 1. Zod Validation Schema for B2B payload
const B2BProposalSchema = z.object({
  clientName: z.string().min(1, "Tên doanh nghiệp không được để trống").default("Unnamed Client"),
  industry: z.string().min(1, "Ngành nghề không được để trống").default("General"),
  totalClasses: z.coerce.number().int().positive("Số lượng lớp phải lớn hơn 0").default(1),
  totalStudents: z.coerce.number().int().positive("Tổng số học viên phải lớn hơn 0").default(1),
  
  hoursPerClass: z.coerce.number().positive("Tổng số giờ học mỗi lớp phải lớn hơn 0").default(60),
  sessionsPerClass: z.coerce.number().int().positive("Số buổi học mỗi lớp phải lớn hơn 0").default(30),
  teacherType: z.enum(["local", "expat", "native"]).default("local"),
  teacherSalaryPerHour: z.coerce.number().nonnegative().default(0),
  assistantsPerSession: z.coerce.number().int().nonnegative().default(0),
  assistantSalaryPerHour: z.coerce.number().nonnegative().default(0),
  
  pricingModel: z.enum(["hourly", "package", "per_student"]).default("hourly"),
  pricingValue: z.coerce.number().positive("Giá trị báo giá phải lớn hơn 0").default(0),
  partnerDiscountPercent: z.coerce.number().nonnegative().max(100).default(0),
  
  syllabusCustomizationCost: z.coerce.number().nonnegative().default(0),
  materialsCostPerStudent: z.coerce.number().nonnegative().default(0),
  placementTestCostPerStudent: z.coerce.number().nonnegative().default(0),
  travelAllowancePerSession: z.coerce.number().nonnegative().default(0),
  accountManagerCost: z.coerce.number().nonnegative().default(0),
  
  avgEmployeeSalaryMonthly: z.coerce.number().nonnegative().default(0),
  estProductivityGainPercent: z.coerce.number().nonnegative().max(100).default(0)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = B2BProposalSchema.safeParse(body);
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

    // 2. Core calculations
    const hoursPerSession = data.hoursPerClass / data.sessionsPerClass;
    const totalHoursAllClasses = data.hoursPerClass * data.totalClasses;
    const totalSessionsAllClasses = data.sessionsPerClass * data.totalClasses;

    // Cost Breakdown: Teaching
    const mainTeacherCost = totalHoursAllClasses * data.teacherSalaryPerHour;
    const assistantCost = totalHoursAllClasses * data.assistantsPerSession * data.assistantSalaryPerHour;
    const totalTeachingCost = mainTeacherCost + assistantCost;

    // Cost Breakdown: Logistics & Admin Custom costs
    const totalTravelCost = data.travelAllowancePerSession * totalSessionsAllClasses;
    const totalPlacementTestCost = data.placementTestCostPerStudent * data.totalStudents;
    const totalCustomAndLogisticsCost = data.syllabusCustomizationCost + totalTravelCost + data.accountManagerCost + totalPlacementTestCost;

    // Cost Breakdown: Materials
    const totalMaterialsCost = data.materialsCostPerStudent * data.totalStudents;

    // Total Cost of Delivery (Provider Side)
    const totalCostOfDelivery = totalTeachingCost + totalCustomAndLogisticsCost + totalMaterialsCost;

    // Revenue Models
    let grossRevenue = 0;
    if (data.pricingModel === "hourly") {
      grossRevenue = data.pricingValue * totalHoursAllClasses;
    } else if (data.pricingModel === "package") {
      grossRevenue = data.pricingValue;
    } else if (data.pricingModel === "per_student") {
      grossRevenue = data.pricingValue * data.totalStudents;
    }

    const netRevenue = grossRevenue * (1 - data.partnerDiscountPercent / 100);
    const netProfit = netRevenue - totalCostOfDelivery;
    const profitMarginPercent = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

    // Break-Even unit price/value for provider
    let breakEvenValue = 0;
    if (netRevenue > 0 && totalCostOfDelivery > 0) {
      const discountMultiplier = 1 - data.partnerDiscountPercent / 100;
      if (data.pricingModel === "hourly") {
        breakEvenValue = discountMultiplier > 0 ? (totalCostOfDelivery / totalHoursAllClasses) / discountMultiplier : 0;
      } else if (data.pricingModel === "package") {
        breakEvenValue = discountMultiplier > 0 ? totalCostOfDelivery / discountMultiplier : 0;
      } else if (data.pricingModel === "per_student") {
        breakEvenValue = discountMultiplier > 0 ? (totalCostOfDelivery / data.totalStudents) / discountMultiplier : 0;
      }
    }

    // 3. Client ROI Projections
    // Monthly salary * 12 * totalStudents = total annual staff salary pool
    const annualStaffSalary = data.avgEmployeeSalaryMonthly * 12 * data.totalStudents;
    const clientYearlyProductivitySavings = annualStaffSalary * (data.estProductivityGainPercent / 100);
    const clientRoiPercent = netRevenue > 0 ? (clientYearlyProductivitySavings / netRevenue) * 100 : 0;

    // 4. Strategic Deal Health Score (0 - 100)
    let scoreProfitability = 0;
    if (profitMarginPercent >= 55) scoreProfitability = 40;
    else if (profitMarginPercent >= 45) scoreProfitability = 30;
    else if (profitMarginPercent >= 35) scoreProfitability = 20;
    else if (profitMarginPercent >= 20) scoreProfitability = 10;
    else scoreProfitability = Math.max(0, 10 + profitMarginPercent * 0.5);

    let scoreSourcing = 0;
    if (data.teacherType === "native") {
      if (data.teacherSalaryPerHour >= 550000) scoreSourcing = 20;
      else if (data.teacherSalaryPerHour >= 450000) scoreSourcing = 10;
    } else if (data.teacherType === "expat") {
      if (data.teacherSalaryPerHour >= 350000) scoreSourcing = 20;
      else if (data.teacherSalaryPerHour >= 280000) scoreSourcing = 10;
    } else { // local
      if (data.teacherSalaryPerHour >= 200000) scoreSourcing = 20;
      else if (data.teacherSalaryPerHour >= 150000) scoreSourcing = 10;
    }

    let scoreClientValue = 5;
    if (clientRoiPercent >= 150) scoreClientValue = 25;
    else if (clientRoiPercent >= 100) scoreClientValue = 20;
    else if (clientRoiPercent >= 50) scoreClientValue = 10;

    let scoreDealScale = 5;
    if (data.totalClasses >= 4) scoreDealScale = 15;
    else if (data.totalClasses >= 2) scoreDealScale = 10;

    const healthScore = Math.min(100, Math.max(0, Math.round(scoreProfitability + scoreSourcing + scoreClientValue + scoreDealScale)));

    // 5. Strategic Advisory Engine
    const recommendations: { type: "warning" | "info" | "success"; text: string }[] = [];

    // Profitability
    if (netProfit < 0) {
      recommendations.push({
        type: "warning",
        text: `Dự án đang lỗ ròng ${Math.abs(netProfit).toLocaleString("vi-VN")}đ. Cần đàm phán nâng mức giá bán hoặc chuyển dịch cơ cấu giáo viên từ Native sang Expat/Local để giảm giá vốn giảng dạy.`
      });
    } else if (profitMarginPercent < 45) {
      recommendations.push({
        type: "warning",
        text: `Biên lợi nhuận gộp (${profitMarginPercent.toFixed(1)}%) thấp hơn mục tiêu chuẩn của mảng B2B (45%). Hãy rà soát lại chi phí thiết kế học liệu (${data.syllabusCustomizationCost.toLocaleString("vi-VN")}đ) hoặc đàm phán phụ thu thiết kế bài giảng riêng.`
      });
    } else {
      recommendations.push({
        type: "success",
        text: `Biên lợi nhuận gộp lý tưởng (${profitMarginPercent.toFixed(1)}%). Dự án mang lại thặng dư tốt, đáp ứng các tiêu chuẩn tài chính doanh nghiệp đào tạo.`
      });
    }

    // Teacher sourcing difficulty
    let lowSalaryLimit = 0;
    if (data.teacherType === "native") lowSalaryLimit = 400000;
    else if (data.teacherType === "expat") lowSalaryLimit = 250000;
    else lowSalaryLimit = 130000;

    if (data.teacherSalaryPerHour < lowSalaryLimit) {
      recommendations.push({
        type: "warning",
        text: `Mức lương giáo viên đề xuất (${data.teacherSalaryPerHour.toLocaleString("vi-VN")}đ/h) quá thấp so với mặt bằng thị trường của phân khúc '${data.teacherType}'. Nguy cơ khó tuyển dụng nhân sự chất lượng hoặc giáo viên hủy lớp giữa chừng.`
      });
    } else {
      recommendations.push({
        type: "success",
        text: `Chi phí giáo viên (${data.teacherSalaryPerHour.toLocaleString("vi-VN")}đ/h) phù hợp với phân khúc '${data.teacherType}'. Hỗ trợ vận hành tuyển dụng ổn định.`
      });
    }

    // Custom Syllabus vs Scale
    if (data.syllabusCustomizationCost > 8000000 && data.totalClasses === 1) {
      recommendations.push({
        type: "warning",
        text: `Chi phí tùy biến giáo trình cao (${data.syllabusCustomizationCost.toLocaleString("vi-VN")}đ) trên quy mô chỉ có 1 lớp học. Hãy thương lượng phụ thu phí "Khảo sát và Thiết kế giáo trình" riêng với khách hàng thay vì tính gộp vào đơn giá.`
      });
    }

    // Client Value Prop pitch helper
    if (clientRoiPercent >= 100) {
      recommendations.push({
        type: "success",
        text: `Đóng góp giá trị của khóa học đối với doanh nghiệp cực kỳ cao (ROI doanh nghiệp đạt ${clientRoiPercent.toFixed(0)}%). Hãy đưa chỉ số tiết kiệm năng suất lao động kỳ vọng (${clientYearlyProductivitySavings.toLocaleString("vi-VN")}đ/năm) vào Slide đấu thầu để gia tăng sức thuyết phục với CEO/HR.`
      });
    } else if (data.avgEmployeeSalaryMonthly > 0 && clientRoiPercent < 40) {
      recommendations.push({
        type: "info",
        text: `Hiệu quả kinh tế doanh nghiệp chưa tối ưu (${clientRoiPercent.toFixed(1)}% ROI). Đề xuất bổ sung cam kết chuẩn đầu ra (như điểm thi, kết quả đánh giá kỹ năng làm việc thực tế) để HR có cơ sở báo cáo phê duyệt.`
      });
    }

    // 6. DB Persistence
    try {
      await sql`
        INSERT INTO b2b_proposal_data (
          client_name, industry, total_classes, total_students,
          hours_per_class, sessions_per_class, teacher_type, teacher_salary_per_hour,
          assistants_per_session, assistant_salary_per_hour, pricing_model, pricing_value,
          partner_discount_percent, syllabus_customization_cost, materials_cost_per_student,
          placement_test_cost_per_student, travel_allowance_per_session, account_manager_cost,
          avg_employee_salary_monthly, est_productivity_gain_percent,
          
          total_teaching_cost, total_custom_and_logistics_cost, total_cost_of_delivery,
          gross_revenue, net_revenue, net_profit, profit_margin_percent, break_even_value,
          client_yearly_productivity_savings, client_roi_percent, health_score
        ) VALUES (
          ${data.clientName}, ${data.industry}, ${data.totalClasses}, ${data.totalStudents},
          ${data.hoursPerClass}, ${data.sessionsPerClass}, ${data.teacherType}, ${data.teacherSalaryPerHour},
          ${data.assistantsPerSession}, ${data.assistantSalaryPerHour}, ${data.pricingModel}, ${data.pricingValue},
          ${data.partnerDiscountPercent}, ${data.syllabusCustomizationCost}, ${data.materialsCostPerStudent},
          ${data.placementTestCostPerStudent}, ${data.travelAllowancePerSession}, ${data.accountManagerCost},
          ${data.avgEmployeeSalaryMonthly}, ${data.estProductivityGainPercent},
          
          ${totalTeachingCost}, ${totalCustomAndLogisticsCost}, ${totalCostOfDelivery},
          ${grossRevenue}, ${netRevenue}, ${netProfit}, ${profitMarginPercent}, ${breakEvenValue},
          ${clientYearlyProductivitySavings}, ${clientRoiPercent}, ${healthScore}
        )
      `;
      console.log("B2B proposal audit logged successfully to Neon Postgres.");
    } catch (dbError: any) {
      console.error("Database persistence warning for B2B (Log skipped):", dbError.message);
    }

    return NextResponse.json({
      success: true,
      data: {
        totalTeachingCost,
        totalCustomAndLogisticsCost,
        totalMaterialsCost: totalMaterialsCost,
        totalCostOfDelivery,
        grossRevenue,
        netRevenue,
        netProfit,
        profitMarginPercent,
        breakEvenValue,
        clientYearlyProductivitySavings,
        clientRoiPercent,
        healthScore,
        recommendations,
        hoursPerSession
      }
    });

  } catch (error) {
    console.error("B2B calculations runtime failure:", error);
    return NextResponse.json({ error: "Thất bại khi thực hiện tính toán đề xuất B2B" }, { status: 500 });
  }
}
