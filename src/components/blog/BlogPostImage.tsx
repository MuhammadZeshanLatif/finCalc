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
  const imgProps = {
    alt,
    className,
    loading,
    decoding: "async" as const,
    width: 960,
    height: 540,
    referrerPolicy: "no-referrer" as const,
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
