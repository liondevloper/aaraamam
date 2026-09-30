import * as React from 'react';
import { cn } from '@/lib/utils.ts';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Empty({ className, ...props }: DivProps) {
  return <div className={cn('flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center', className)} {...props} />;
}
export function EmptyHeader({ className, ...props }: DivProps) {
  return <div className={cn('flex max-w-sm flex-col items-center gap-2', className)} {...props} />;
}
export function EmptyMedia({ className, variant, ...props }: DivProps & { variant?: 'default' | 'icon' }) {
  return <div className={cn('mb-2 flex items-center justify-center', variant === 'icon' && 'size-12 rounded-full bg-muted text-foreground [&_svg]:size-6', className)} {...props} />;
}
export function EmptyTitle({ className, ...props }: DivProps) {
  return <div className={cn('text-lg font-semibold', className)} {...props} />;
}
export function EmptyDescription({ className, ...props }: DivProps) {
  return <div className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
export function EmptyContent({ className, ...props }: DivProps) {
  return <div className={cn('flex flex-col items-center gap-2', className)} {...props} />;
}
