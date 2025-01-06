import * as React from "react"

import { type VariantProps } from "class-variance-authority"

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof Toast>,
    VariantProps<typeof toastVariants> {
  variant?: "default" | "destructive"
}

export type ToastActionElement = React.ReactElement<typeof ToastAction> 