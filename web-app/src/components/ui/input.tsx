import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: React.ReactNode
  prefixNode?: React.ReactNode
  suffixNode?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, hint, error, prefixNode, suffixNode, id, ...props }, ref) => {
    const [focus, setFocus] = React.useState(false)
    const generatedId = React.useId()
    const uid = id || generatedId

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {label && (
          <label htmlFor={uid} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex min-h-[44px] items-center gap-2 rounded-[10px] border bg-card px-3 text-muted-foreground transition-colors",
            error ? "border-destructive" : focus ? "border-ring shadow-[0_0_0_2px_var(--ring)]" : "border-border"
          )}
        >
          {prefixNode}
          <InputPrimitive
            ref={ref}
            id={uid}
            type={type}
            onFocus={(e) => {
              setFocus(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocus(false)
              props.onBlur?.(e)
            }}
            data-slot="input"
            className="flex-1 bg-transparent py-[11px] text-base text-foreground outline-none min-w-0 placeholder:text-muted-foreground"
            {...props}
          />
          {suffixNode}
        </div>
        {(hint || error) && (
          <div className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
            {error || hint}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
