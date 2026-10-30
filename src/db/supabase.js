import { createClient } from "@supabase/supabase-js";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function client() {
  return createClient(required("SUPABASE_URL"), required("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function dateKey(reportDate) {
  const numbers = reportDate.match(/\d+/g);
  if (!numbers || numbers.length < 3) throw new Error(`Invalid report date: ${reportDate}`);
  return `${numbers[0]}-${numbers[1].padStart(2, "0")}-${numbers[2].padStart(2, "0")}`;
}

function displayDate(value) {
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  return `${year}. ${month}. ${day}.`;
}

export async function saveReport(report, markdownContent) {
  const supabase = client();
  const { error } = await supabase.rpc("save_daily_report", {
    report: { ...report, reportDate: dateKey(report.reportDate) },
    markdown: markdownContent,
  });
  if (error) throw new Error(`Supabase save failed: ${error.message}`);
}

export async function getRecentReports(limit = 10) {
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
  const supabase = client();
  const { data, error } = await supabase
    .from("reports")
    .select("*, articles(*)")
    .order("report_date", { ascending: false })
    .limit(safeLimit);

  if (error) throw new Error(`Supabase read failed: ${error.message}`);

  return data.map((report) => ({
    lastUpdated: report.last_updated,
    reportDate: displayDate(report.report_date),
    summary: report.summary,
    summaryScore: Number(report.summary_score),
    dailyVelocity: Number(report.daily_velocity),
    velocityReason: report.velocity_reason,
    cumulativeRiskScore: Number(report.cumulative_risk_score),
    jobRiskScore: Number(report.job_risk_score),
    riskScoreBreakdown: report.risk_score_breakdown ?? [],
    news: report.articles.sort((a, b) => a.sort_order - b.sort_order).map((article) => ({
      title: article.title,
      link: article.link,
      pubDate: article.published_at,
      summary: article.summary,
      importance: article.importance,
      aiImpact: article.ai_impact,
      automationPotential: article.automation_potential,
      investmentImpact: article.investment_impact,
    })),
  }));
}
