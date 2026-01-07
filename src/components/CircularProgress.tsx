import React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
    current: number;
    total: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
    color?: string;
}

export function CircularProgress({
    current,
    total,
    size = 60,
    strokeWidth = 4,
    className,
    color = 'text-primary',
}: CircularProgressProps) {
    const validCurrent = Number(current) || 0;
    const validTotal = Number(total) || 0;
    const percentage = validTotal > 0 ? Math.min(100, Math.max(0, (validCurrent / validTotal) * 100)) : 0;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div
            className={cn('relative flex items-center justify-center', className)}
            style={{ width: size, height: size }}
        >
            <svg
                className="transform -rotate-90 w-full h-full"
                width={size}
                height={size}
            >
                {/* Background circle */}
                <circle
                    className="text-secondary"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress circle */}
                <circle
                    className={cn('transition-all duration-500 ease-out', color)}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                {Math.round(percentage)}%
            </div>
        </div>
    );
}
