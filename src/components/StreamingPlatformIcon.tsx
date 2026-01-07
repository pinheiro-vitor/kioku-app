import { cn } from "@/lib/utils";

interface StreamingPlatformIconProps {
    platform: string;
    className?: string;
    size?: number;
}

export const StreamingPlatformIcon = ({ platform, className, size = 24 }: StreamingPlatformIconProps) => {
    const p = platform.toLowerCase();

    // URL Mapping based on User Request (Alternatives)
    let src = "";
    let alt = platform;
    let customSize = size;

    if (p.includes("crunchyroll")) {
        src = "https://img.icons8.com/fluency/48/crunchyroll.png";
        alt = "Crunchyroll";
    } else if (p.includes("disney")) {
        src = "https://img.icons8.com/fluency/48/disney-plus.png";
        alt = "Disney+";
    } else if (p.includes("netflix")) {
        src = "https://img.icons8.com/color/48/netflix-desktop-app--v1.png";
        alt = "Netflix";
    } else if (p.includes("prime") || p.includes("amazon")) {
        src = "https://img.icons8.com/fluency/48/amazon-prime-video.png";
        alt = "Prime Video";
    } else if (p.includes("hbo") || p.includes("max")) {
        src = "https://img.icons8.com/ios-filled/50/hbo-max.png";
        alt = "HBO Max";
    } else if (p.includes("pirata") || p.includes("corsario") || p.includes("alternativo")) {
        // Skull icon for "Pirate"
        src = "https://img.icons8.com/3d-fluency/94/skull.png";
        alt = "Alternativo (Pirata)";
    } else {
        return null; // Don't render unknown/removed platforms
    }

    return (
        <img
            src={src}
            alt={alt}
            title={alt}
            className={cn("object-contain", className)}
            style={{ width: customSize, height: customSize }}
        />
    );
}
