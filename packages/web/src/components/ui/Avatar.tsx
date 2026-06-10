import * as React from 'react';
import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 28,
  xl: 40,
};

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const [error, setError] = React.useState(false);

  if (!src || error) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-full bg-pink-100 flex items-center justify-center',
          className
        )}
      >
        <User className="text-pink-400" size={iconSizes[size]} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'avatar'}
      className={cn(sizeClasses[size], 'rounded-full object-cover', className)}
      onError={() => setError(true)}
    />
  );
}
