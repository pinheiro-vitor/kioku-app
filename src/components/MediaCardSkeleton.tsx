import { Skeleton } from "@/components/ui/skeleton"

export function MediaCardSkeleton() {
    return (
        <div className="flex flex-col space-y-3 w-full max-w-[200px]">
            <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    )
}
