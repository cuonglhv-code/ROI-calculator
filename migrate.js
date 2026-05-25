const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// 1. Safe dynamic loading of environment variables from .env.local (zero-dependency)
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
    console.log("Running Neon Database Migration...");

    // 2. Base Table Creation with advanced audit metrics
    await sql`
CREATE TABLE IF NOT EXISTS roi_calculator_data (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  course_name TEXT NOT NULL,
  fee_per_student NUMERIC(10, 2) NOT NULL,
  total_students INTEGER NOT NULL,

  total_sessions INTEGER NOT NULL,
  hours_per_session NUMERIC(4, 2) NOT NULL,
  teacher_salary_per_hour NUMERIC(10, 2) NOT NULL,

  fixed_venue NUMERIC(10, 2) NOT NULL DEFAULT 0,
  fixed_materials NUMERIC(10, 2) NOT NULL DEFAULT 0,
  fixed_tech NUMERIC(10, 2) NOT NULL DEFAULT 0,
  fixed_admin NUMERIC(10, 2) NOT NULL DEFAULT 0,
  fixed_marketing NUMERIC(10, 2) NOT NULL DEFAULT 0,

  var_materials_per_student NUMERIC(10, 2) NOT NULL DEFAULT 0,
  var_tech_per_student NUMERIC(10, 2) NOT NULL DEFAULT 0,
  var_refreshments_per_student NUMERIC(10, 2) NOT NULL DEFAULT 0,
  var_transaction_per_student NUMERIC(10, 2) NOT NULL DEFAULT 0,
  var_recruitment_per_student NUMERIC(10, 2) NOT NULL DEFAULT 0,
  var_other_per_student NUMERIC(10, 2) NOT NULL DEFAULT 0,

  total_fixed_cost NUMERIC(12, 2) NOT NULL,
  total_variable_cost NUMERIC(12, 2) NOT NULL,
  total_cost NUMERIC(12, 2) NOT NULL,
  total_revenue NUMERIC(12, 2) NOT NULL,
  profit NUMERIC(12, 2) NOT NULL,
  roi_percent NUMERIC(12, 2) NOT NULL,

  break_even_students NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cost_per_student NUMERIC(12, 2) NOT NULL DEFAULT 0,
  margin_per_student NUMERIC(12, 2) NOT NULL DEFAULT 0,
  instructor_cost_per_student NUMERIC(12, 2) NOT NULL DEFAULT 0,
  revenue_per_instructor_hour NUMERIC(12, 2) NOT NULL DEFAULT 0,

  contribution_margin_ratio NUMERIC(5, 2) NOT NULL DEFAULT 0,
  break_even_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  safety_margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  operating_leverage NUMERIC(5, 2) NOT NULL DEFAULT 0,
  teaching_cost_ratio NUMERIC(5, 2) NOT NULL DEFAULT 0,
  acquisition_cost_ratio NUMERIC(5, 2) NOT NULL DEFAULT 0,
  health_score INTEGER NOT NULL DEFAULT 0
);
    `;
    console.log("Table structure verified.");

    // 3. Incremental updates for existing tables (ALTER TABLE IF EXISTS)
    console.log("Applying incremental schema updates...");
    await sql`ALTER TABLE roi_calculator_data ADD COLUMN IF NOT EXISTS contribution_margin_ratio NUMERIC(5, 2) NOT NULL DEFAULT 0;`;
    await sql`ALTER TABLE roi_calculator_data ADD COLUMN IF NOT EXISTS break_even_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0;`;
    await sql`ALTER TABLE roi_calculator_data ADD COLUMN IF NOT EXISTS safety_margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 0;`;
    await sql`ALTER TABLE roi_calculator_data ADD COLUMN IF NOT EXISTS operating_leverage NUMERIC(5, 2) NOT NULL DEFAULT 0;`;
    await sql`ALTER TABLE roi_calculator_data ADD COLUMN IF NOT EXISTS teaching_cost_ratio NUMERIC(5, 2) NOT NULL DEFAULT 0;`;
    await sql`ALTER TABLE roi_calculator_data ADD COLUMN IF NOT EXISTS acquisition_cost_ratio NUMERIC(5, 2) NOT NULL DEFAULT 0;`;
    await sql`ALTER TABLE roi_calculator_data ADD COLUMN IF NOT EXISTS health_score INTEGER NOT NULL DEFAULT 0;`;

    console.log("Migration successful! roi_calculator_data is fully aligned with advanced financial audit schema.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
