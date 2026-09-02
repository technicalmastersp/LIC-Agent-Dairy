import * as React from "react";
import type { Toast, ToastAction } from "@/components/ui/toast";

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
export type ToastActionElement = React.ReactElement<typeof ToastAction>;
