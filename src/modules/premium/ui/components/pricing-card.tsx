
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";


const pricingCardVariants = cva("rounded-lg p-4 py-6 w-full", {
    variants: {
        variant: {
            default: "bg-white text-black",
            highlighted: "bg-gradient-to-br from-[#093C23] to-[#051816] text-white",
        }
    },
    defaultVariants: {
        variant: "default",
    },
});

const pricingCardIconVariants = cva("", {
    variants: {
        variant: {
           default: "text-green-500 w-5 h-5",
            highlighted: "fill-white text-black",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

const pricingCardSecondaryTextVariants = cva("", {
    variants: {
        variant: {
            default: "text-neutral-700",
            highlighted: "text-neutral-300",
        },
    },
});

const pricingCardBadgeVariants = cva("", {
    variants: {
        variant: {
            default: "bg-primary/20",
            highlighted: "bg-[#F5B797]",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

interface Props extends VariantProps<typeof pricingCardVariants> {
    badge?: string | null;
    price: number;
    features: string[];
    title: string;
    description?: string | null;
    priceSuffix: string;
    className?: string;
    buttonText: string;
    onClick: () => void;
};

export const PricingCard = ({
    variant,
    badge,
    price,
    features,
    title,
    description,
    priceSuffix,
    className,
    buttonText,
    onClick,
}: Props) => {
    return (
        <div className={cn(pricingCardVariants({variant}), className, "border")}>
            <div className="flex items-end gap-x-4 justify-between">
                <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-2">
                        <h6 className="font-medium text-xl">{title}</h6>
                        {badge ? (
                            <Badge className={cn(pricingCardBadgeVariants({variant}))}>
                                {badge}
                            </Badge>
                        ) : null
                        }
                 </div>
                 <p
                 className={cn(
                    "text-xs",
                    pricingCardSecondaryTextVariants({variant})
                 )}
                 >
                    {description}
                 </p>
                 </div>
                <div className="flex items-baseline gap-x-1">
    <h4 className="text-3xl font-medium">
        {Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }).format(price)}
    </h4>
    <span className={cn(pricingCardSecondaryTextVariants({variant}))}>
        {priceSuffix}
    </span>
</div>
            </div>
            <Button
            className="w-full mt-6 mb-6"
            size="lg"
            variant={variant === "highlighted" ? "default" : "outline"}
            onClick={onClick}
            >
                {buttonText}
            </Button>
            <div className="flex flex-col gap-y-2 mt-6">
                <p className="font-medium uppercase">Features</p>
                <ul
                className={cn(
                    "flex flex-col gap-y-2.5",
                    pricingCardSecondaryTextVariants({
                        variant
                    })
                )}
                >
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-x-2.5">
                            <CheckCircle className={cn(pricingCardIconVariants({variant}))}
                            />
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

