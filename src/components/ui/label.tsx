import * as React from "react"
import { cn } from "@/lib/utils"

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-[11px] font-black uppercase tracking-widest text-white/40 leading-none", className)}
      {...props}
    />
  ),
)
Label.displayName = "Label"

export { Label }
