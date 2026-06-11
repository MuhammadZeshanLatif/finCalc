import { useEffect } from "react";
import { loadAdsterraSync } from "../../config/ads";

/** Zero-size anchor — injects one JS Sync tag, no layout space. */
export function AdScriptAnchor({ url }: { url: string }) {
  useEffect(() => {
    loadAdsterraSync(url);
  }, [url]);

  return <span className="fc-ad-script-anchor" aria-hidden="true" />;
}
