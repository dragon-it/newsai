import { buildOccupationTracking } from "../../../shared/occupationTracking.js";

const localReportModules = import.meta.glob("../../../data/reports/*.json");

async function loadStaticIndex() {
  if (import.meta.env.DEV) {
    const module = await import("../../../data/index.json");
    return module.default;
  }

  const response = await fetch(`${import.meta.env.BASE_URL}data/index.json`);
  if (!response.ok) throw new Error("리포트 인덱스를 불러오지 못했습니다.");
  return response.json();
}

async function loadStaticReport(fileName) {
  if (import.meta.env.DEV) {
    const loader = localReportModules[`../../../data/reports/${fileName}`];
    if (!loader)
      throw new Error(`로컬 리포트 파일을 찾을 수 없습니다: ${fileName}`);
    const module = await loader();
    return module.default;
  }

  const response = await fetch(
    `${import.meta.env.BASE_URL}data/reports/${fileName}`,
  );
  if (!response.ok)
    throw new Error(`리포트를 불러오지 못했습니다: ${fileName}`);
  return response.json();
}

// UI는 이 인터페이스만 사용. DB 도입 시 동일한 메서드를 제공하는 API 어댑터로 교체.
export const reportRepository = {
  async list() {
    const index = await loadStaticIndex();
    return index.reports ?? [];
  },

  async getById(id, metadata) {
    const fileName = metadata?.fileName ?? `${id}.json`;
    return loadStaticReport(fileName);
  },

  async listOccupations() {
    const index = await loadStaticIndex();
    return index.occupationTracking ?? buildOccupationTracking(index.reports ?? []);
  },
};
