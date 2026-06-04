const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load env vars dynamically from .env.local
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
      if (match) {
        process.env.DATABASE_URL = match[1];
        console.log("Loaded DATABASE_URL successfully from .env.local");
      }
    }
  } catch (err) {
    console.error("Warning: Could not read .env.local file:", err.message);
  }
}

if (!process.env.DATABASE_URL) {
  console.error("CRITICAL ERROR: DATABASE_URL is missing! Please configure it in your environment or .env.local.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    console.log("Running Neon Database Migration - B2B Proposal Evaluator...");

    await sql`
CREATE TABLE IF NOT EXISTS b2b_proposal_data (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Client & Deal metadata
  client_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  total_classes INTEGER NOT NULL,
  total_students INTEGER NOT NULL,
  
  -- Course logistics
  hours_per_class INTEGER NOT NULL,
  sessions_per_class INTEGER NOT NULL,
  teacher_type TEXT NOT NULL,
  teacher_salary_per_hour NUMERIC(10, 2) NOT NULL,
  assistants_per_session INTEGER NOT NULL DEFAULT 0,
  assistant_salary_per_hour NUMERIC(10, 2) NOT NULL DEFAULT 0,
  
  -- Fees & Pricing
  pricing_model TEXT NOT NULL,
  pricing_value NUMERIC(12, 2) NOT NULL,
  partner_discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  
  -- Custom costs
  syllabus_customization_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  materials_cost_per_student NUMERIC(10, 2) NOT NULL DEFAULT 0,
  placement_test_cost_per_student NUMERIC(10, 2) NOT NULL DEFAULT 0,
  travel_allowance_per_session NUMERIC(10, 2) NOT NULL DEFAULT 0,
  account_manager_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  
  -- Client ROI Simulation Inputs
  avg_employee_salary_monthly NUMERIC(12, 2) NOT NULL DEFAULT 0,
  est_productivity_gain_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  
  -- Computed Outputs (Provider-side)
  total_teaching_cost NUMERIC(12, 2) NOT NULL,
  total_custom_and_logistics_cost NUMERIC(12, 2) NOT NULL,
  total_cost_of_delivery NUMERIC(12, 2) NOT NULL,
  gross_revenue NUMERIC(12, 2) NOT NULL,
  net_revenue NUMERIC(12, 2) NOT NULL,
  net_profit NUMERIC(12, 2) NOT NULL,
  profit_margin_percent NUMERIC(5, 2) NOT NULL,
  break_even_value NUMERIC(12, 2) NOT NULL,
  
  -- Computed Outputs (Client-side)
  client_yearly_productivity_savings NUMERIC(12, 2) NOT NULL,
  client_roi_percent NUMERIC(12, 2) NOT NULL,
  
  -- Health & Evaluation
  health_score INTEGER NOT NULL DEFAULT 0
);
    `;
    console.log("Table b2b_proposal_data verified/created successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
