import { useEffect, useRef, useState } from "react";
import "./SectionNavigation.css";
import { smoothScroll } from "../services/smoothScroll";

const sections = [
  ["job-risk", "일자리 위험 지수"],
  ["daily-summary", "오늘의 요약"],
  ["key-changes", "오늘의 핵심 변화"],
  ["occupation-risks", "직업별 AI 대체 위험 추적"],
  ["news-list", "주요 뉴스 목록 & 요약"],
  ["news-history", "지난 뉴스 히스토리"],
];

export default function SectionNavigation() {
  const [active, setActive] = useState("job-risk");
  const navigationRef = useRef(null);
  const linksRef = useRef(null);
  const cancelScrollRef = useRef(null);

  useEffect(() => {
    const updateActive = () => {
      const offset = navigationRef.current.offsetHeight + 32;
      let current = "job-risk";
      for (const [id] of sections) {
        const target = document.getElementById(id);
        if (target && target.getBoundingClientRect().top <= offset) current = id;
      }
      setActive(current);
    };
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty("--section-navigation-height", `${navigationRef.current.offsetHeight}px`);
    });
    observer.observe(navigationRef.current);
    const cancelScroll = () => cancelScrollRef.current?.();
    window.addEventListener("wheel", cancelScroll, { passive: true });
    window.addEventListener("touchstart", cancelScroll, { passive: true });
    window.addEventListener("keydown", cancelScroll);
    return () => {
      window.removeEventListener("scroll", updateActive);
      observer.disconnect();
      cancelScroll();
      window.removeEventListener("wheel", cancelScroll);
      window.removeEventListener("touchstart", cancelScroll);
      window.removeEventListener("keydown", cancelScroll);
      document.documentElement.style.removeProperty("--section-navigation-height");
    };
  }, []);

  useEffect(() => {
    const links = linksRef.current;
    const selected = links.querySelector('[aria-current="location"]');
    if (selected) return smoothScroll(links, () => ({ left: Math.max(0, Math.min(links.scrollWidth - links.clientWidth, selected.offsetLeft - links.clientWidth / 2 + selected.offsetWidth / 2)) }));
  }, [active]);

  function goToSection(event, id) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    cancelScrollRef.current?.();
    window.history.pushState(null, "", `#${id}`);
    cancelScrollRef.current = smoothScroll(window, () => ({ top: Math.max(0, Math.min(document.documentElement.scrollHeight - window.innerHeight, window.scrollY + target.getBoundingClientRect().top - navigationRef.current.offsetHeight - 28)) }));
  }

  return (
    <div className="section-navigation" ref={navigationRef}>
      <nav className="section-navigation-links" aria-label="리포트 섹션 이동" ref={linksRef}>
        {sections.map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={(event) => goToSection(event, id)} aria-current={active === id ? "location" : undefined}>{label}</a>
        ))}
      </nav>
    </div>
  );
}
