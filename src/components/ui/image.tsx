'use client';
import * as React from "react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop";

export interface ImageProps extends Omit<React.ComponentPropsWithoutRef<typeof NextImage>, 'src' | 'alt'> {
  src?: string | null;
  alt: string;
  fittingType?: 'fill' | 'fit';
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  [key: string]: any;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src: source,
      alt,
      fittingType = "fill",
      className,
      priority = false,
      sizes,
      quality = 85,
      onError,
      style,
      ...props
    },
    ref
  ) => {
    const [imgSrc, setImgSrc] = React.useState(source || FALLBACK_IMAGE);
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
      setImgSrc(source || FALLBACK_IMAGE);
      setHasError(false);
    }, [source]);

    const handleError = (e: any) => {
      if (!hasError) {
        setHasError(true);
        setImgSrc(FALLBACK_IMAGE);
      }
      onError?.(e);
    };

    const isFill = fittingType === 'fill' || props.fill !== undefined ? (props.fill ?? true) : true;
    const defaultSizes = sizes || (priority ? '100vw' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');

    return (
      <NextImage
        ref={ref}
        src={imgSrc}
        alt={alt || "Apex Fitness Gym"}
        fill={isFill}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={defaultSizes}
        quality={quality}
        onError={handleError}
        className={cn(
          isFill ? (fittingType === 'fit' ? 'object-contain' : 'object-cover') : undefined,
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);
Image.displayName = "Image";
export default Image;
