const { neon } = require('@neondatabase/serverless');

const databaseUrl = 'postgresql://neondb_owner:npg_Lx1wuF8ygrEt@ep-rapid-bread-abhxeihu-pooler.eu-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
const sql = neon(databaseUrl);

async function run() {
  try {
    console.log("Running migration...");
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
  revenue_per_instructor_hour NUMERIC(12, 2) NOT NULL DEFAULT 0
);
    `;
    console.log("Migration successful! TABLE 'roi_calculator_data' is ready.");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

run();
