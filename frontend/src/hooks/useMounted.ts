import { useEffect, useState } from "react";

/** Returns false during SSR and the first client render to avoid hydration mismatches. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
