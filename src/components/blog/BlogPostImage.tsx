import type { SyntheticEvent } from "react";
import { SITE_PREVIEW_IMAGE_PATH } from "../../config/site";

type Props = {
  src: string;
  /** Prefer WebP in supporting browsers; `src` remains SVG/other fallback */
  srcWebp?: string;
  alt: string;
  className?: string;
  loading: "eager" | "lazy";
};

/** True when `url` is an http(s) asset (e.g. Wikimedia); omit `referrerPolicy="no-referrer"` so it can load. */
export function isAbsoluteHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function BlogPostImage({
  src,
  srcWebp,
  alt,
  className = "img-fluid rounded border w-100",
  loading,
}: Props) {
  const onError = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    img.onerror = null;
    img.src = SITE_PREVIEW_IMAGE_PATH;
  };
  /** Wikimedia and many CDNs reject or throttle `no-referrer` hotlinks; then onError shows generic preview. */
  const externalAsset = isAbsoluteHttpUrl(src) || (srcWebp != null && isAbsoluteHttpUrl(srcWebp));
  const imgProps = {
    alt,
    className,
    loading,
    decoding: "async" as const,
    width: 960,
    height: 540,
    ...(externalAsset ? {} : { referrerPolicy: "no-referrer" as const }),
    onError,
  };
  if (srcWebp) {
    return (
      <picture>
        <source srcSet={srcWebp} type="image/webp" />
        <img src={src} {...imgProps} />
      </picture>
    );
  }
  return <img src={src} {...imgProps} />;
}
