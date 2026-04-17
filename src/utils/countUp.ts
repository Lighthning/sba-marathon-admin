export const animateValue = (
  start: number,
  end: number,
  duration: number,
  callback: (value: number) => void
) => {
  const startTime = Date.now();
  const difference = end - start;

  const step = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (difference * eased);
    
    callback(Math.round(current));

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};
