import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-none border border-transparent px-1.5 py-0.5 font-mono text-[10px] font-normal tracking-[0.14em] whitespace-nowrap uppercase transition-colors focus-visible:ring-1 focus-visible:ring-foreground has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-foreground bg-transparent text-foreground [a]:hover:bg-white/5",
        secondary:
          "border-border bg-transparent text-muted-foreground [a]:hover:text-foreground",
        destructive:
          "border-destructive/40 bg-destructive/15 text-destructive [a]:hover:bg-destructive/25",
        outline:
          "border-border text-muted-foreground [a]:hover:text-foreground",
        ghost:
          "text-muted-foreground hover:text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
