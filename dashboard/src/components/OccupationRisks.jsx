import PropTypes from "prop-types";
import { hasRecentOccupationEvidence } from "../../../shared/occupationTracking.js";

export default function OccupationRisks({ risks, analysis }) {
  const referenceDate = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
  return (
    <section className="dashboard-card occupation-section">
      <h2 className="section-title-sub-large">직업별 AI 대체 위험 추적</h2>
      {analysis && (
        <p className="occupation-period">
          최근 분석: {analysis.endDate} · 이번 참고 기사 {analysis.articleCount}개
        </p>
      )}
      <p className="occupation-note">직업별 관측 기록을 누적합니다. 기사 수는 위험 점수가 아니며, 직업 전체의 소멸을 뜻하지 않습니다.</p>
      {!analysis && !risks.length ? (
        <p className="no-changes-text">이 날짜에는 직업별 분석이 제공되지 않았습니다.</p>
      ) : !risks.length ? (
        <p className="no-changes-text">아직 누적된 직업별 관측 기록이 없습니다.</p>
      ) : (
        <div className="occupation-grid">
          {risks.map((item) => (
            <article className="occupation-card" key={item.id}>
              <div className="occupation-heading">
                <h3>{item.occupation}</h3>
                <span className="occupation-stage">{item.stage}</span>
              </div>
              <p className="occupation-period">최초 관측 {item.firstObserved} · 최근 관측 {item.lastObserved}</p>
              <p className="occupation-period">
                근거 기사 {item.evidence.length}개 · {hasRecentOccupationEvidence(item, referenceDate)
                  ? `최근 근거 ${item.lastEvidenceDate}` : "최근 30일 새 근거 없음"}
              </p>
              <p><strong>영향받는 업무:</strong> {item.tasks.join(", ")}</p>
              <p><strong>선정 이유:</strong> {item.reason}</p>
              <details>
                <summary>누적 근거 기사 {item.evidence.length}개</summary>
                <ul className="occupation-sources" aria-label="근거 기사">
                {item.evidence.map((source) => (
                  <li key={source.link}>
                    <a href={source.link} target="_blank" rel="noopener noreferrer">{source.title}</a>
                    <span> · {source.reportDate}</span>
                  </li>
                ))}
              </ul>
              </details>
              <details>
                <summary>관측 이력 {item.observations.length}건</summary>
                <ul className="occupation-sources">
                  {[...item.observations].reverse().map((observation) => (
                    <li key={observation.date}>
                      <strong>{observation.date} · {observation.stage}</strong>
                      <p>{observation.reason}</p>
                    </li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

OccupationRisks.propTypes = {
  analysis: PropTypes.shape({
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    articleCount: PropTypes.number.isRequired,
  }),
  risks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstObserved: PropTypes.string.isRequired,
    lastObserved: PropTypes.string.isRequired,
    lastEvidenceDate: PropTypes.string.isRequired,
    observations: PropTypes.arrayOf(PropTypes.shape({
      date: PropTypes.string.isRequired,
      stage: PropTypes.string.isRequired,
      reason: PropTypes.string.isRequired,
    })).isRequired,
    occupation: PropTypes.string.isRequired,
    tasks: PropTypes.arrayOf(PropTypes.string).isRequired,
    reason: PropTypes.string.isRequired,
    stage: PropTypes.string.isRequired,
    evidence: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      reportDate: PropTypes.string.isRequired,
    })).isRequired,
  })).isRequired,
};
