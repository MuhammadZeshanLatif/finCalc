import { useEffect, useRef } from "react";
import { ADSTERRA_NATIVE } from "../../config/ads";

export function AdNative() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const container = document.createElement("div");
    container.id = ADSTERRA_NATIVE.containerId;
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = ADSTERRA_NATIVE.script;
    host.append(container, script);
    return () => { host.replaceChildren(); };
  }, []);

  return <div ref={hostRef} className="fc-ad-native" aria-label="Advertisement" />;
}
