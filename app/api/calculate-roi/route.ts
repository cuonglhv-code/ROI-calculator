import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

function parseNum(val: unknown): number {
  const n = typeof val === "string" ? parseFloat(val) : Number(val);
  return isNaN(n) ? 0 : n;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const courseName = body.courseName || "Unnamed Course";
    const feePerStudent = parseNum(body.courseFeePerStudent);
    const totalStudents = parseNum(body.totalStudents);

    const totalSessions = parseNum(body.totalSessions);
    const hoursPerSession = parseNum(body.hoursPerSession);
    const teacherSalaryPerHour = parseNum(body.teacherSalaryPerHour);

    const fixedVenue = parseNum(body.fixedVenueCost);
    const fixedMaterials = parseNum(body.fixedMaterialsCost);
    const fixedTech = parseNum(body.fixedTechnologyCost);
    const fixedAdmin = parseNum(body.fixedAdminCost);
    const fixedMarketing = parseNum(body.fixedMarketingCost);

    const varMaterials = parseNum(body.varMaterialsPerStudent);
    const varTech = parseNum(body.varTechnologyPerStudent);
    const varRefreshments = parseNum(body.varRefreshmentsPerStudent);
    const varTransaction = parseNum(body.varTransactionFeePerStudent);
    const varRecruitment = parseNum(body.varRecruitmentPerStudent);
    const varOther = parseNum(body.varOtherPerStudent);

    // CALCULATIONS (refined formulas)
    const instructorCost = totalSessions * hoursPerSession * teacherSalaryPerHour;
    const totalFixedCost = instructorCost + fixedVenue + fixedMaterials + fixedTech + fixedAdmin + fixedMarketing;
    const totalVarPerStudent = varMaterials + varTech + varRefreshments + varTransaction + varRecruitment + varOther;
    const totalVariableCost = totalVarPerStudent * totalStudents;
    const totalCost = totalFixedCost + totalVariableCost;
    const totalRevenue = feePerStudent * totalStudents;
    const profit = totalRevenue - totalCost;

    let roiPercent = 0;
    if (totalCost > 0) {
      roiPercent = (profit / totalCost) * 100;
    }

    // Extended metrics
    const breakEvenStudents = totalCost > 0 && feePerStudent > totalVarPerStudent 
      ? totalFixedCost / (feePerStudent - totalVarPerStudent) 
      : 0;
    const costPerStudent = totalStudents > 0 ? totalCost / totalStudents : 0;
    const marginPerStudent = feePerStudent - totalVarPerStudent;
    const instructorCostPerStudent = totalStudents > 0 ? instructorCost / totalStudents : 0;
    const totalInstructorHours = totalSessions * hoursPerSession;
    const revenuePerInstructorHour = totalInstructorHours > 0 ? totalRevenue / totalInstructorHours : 0;

    // Interpretation (Vietnamese)
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

    // SAVE TO NEON
    await sql`
      INSERT INTO roi_calculator_data (
        course_name, fee_per_student, total_students, total_sessions, hours_per_session,
        teacher_salary_per_hour, fixed_venue, fixed_materials, fixed_tech, fixed_admin,
        fixed_marketing, var_materials_per_student, var_tech_per_student,
        var_refreshments_per_student, var_transaction_per_student, var_recruitment_per_student,
        var_other_per_student, total_fixed_cost, total_variable_cost, total_cost,
        total_revenue, profit, roi_percent, break_even_students, cost_per_student,
        margin_per_student, instructor_cost_per_student, revenue_per_instructor_hour
      ) VALUES (
        ${courseName}, ${feePerStudent}, ${totalStudents}, ${totalSessions}, ${hoursPerSession},
        ${teacherSalaryPerHour}, ${fixedVenue}, ${fixedMaterials}, ${fixedTech}, ${fixedAdmin},
        ${fixedMarketing}, ${varMaterials}, ${varTech}, ${varRefreshments}, ${varTransaction},
        ${varRecruitment}, ${varOther}, ${totalFixedCost}, ${totalVariableCost}, ${totalCost},
        ${totalRevenue}, ${profit}, ${roiPercent}, ${breakEvenStudents}, ${costPerStudent},
        ${marginPerStudent}, ${instructorCostPerStudent}, ${revenuePerInstructorHour}
      )
    `;

    return NextResponse.json({
      totalFixedCost, totalVariableCost, totalCost, totalRevenue, profit, roiPercent, interpretation,
      breakEvenStudents, costPerStudent, marginPerStudent, instructorCostPerStudent, revenuePerInstructorHour
    });
  } catch (error) {
    console.error("ROI calc error:", error);
    return NextResponse.json({ error: "Failed to calculate ROI" }, { status: 500 });
  }
}
