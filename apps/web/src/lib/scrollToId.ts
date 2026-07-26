/** Scroll to an element by id, retrying until it exists (async content). */
export function scrollToId(id: string, opts?: { behavior?: ScrollBehavior; attempts?: number }) {
  const behavior = opts?.behavior ?? "smooth";
  const max = opts?.attempts ?? 60;
  let n = 0;

  const tick = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior, block: "start" });
      return;
    }
    n += 1;
    if (n < max) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}
