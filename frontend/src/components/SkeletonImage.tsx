import { useState, type ImgHTMLAttributes } from 'react';

type SkeletonImageProps = ImgHTMLAttributes<HTMLImageElement>;

export function SkeletonImage({ className, onLoad, ...rest }: SkeletonImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      {...rest}
      className={`${className ?? ''} skeleton-img${loaded ? ' is-loaded' : ''}`}
      loading={rest.loading ?? 'lazy'}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
    />
  );
}
