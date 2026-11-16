// 브라우저 기본 스크롤 설정과 무관하게 프레임별 위치 보간
export function smoothScroll(target, getDestination) {
  const isWindow = target === window;
  const startLeft = isWindow ? window.scrollX : target.scrollLeft;
  const startTop = isWindow ? window.scrollY : target.scrollTop;
  const startedAt = performance.now();
  const duration = 500;
  let frame;

  function step(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const destination = getDestination();
    target.scrollTo({
      left: startLeft + ((destination.left ?? startLeft) - startLeft) * eased,
      top: startTop + ((destination.top ?? startTop) - startTop) * eased,
      behavior: "instant",
    });
    if (progress < 1) frame = requestAnimationFrame(step);
  }

  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}
