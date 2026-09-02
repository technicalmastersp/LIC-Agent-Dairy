import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/types/components/ui/toast.types";
import type { actionTypes } from "@/hooks/use-toast";

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};
export type ActionType = typeof actionTypes;
export type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };
export interface State {
  toasts: ToasterToast[];
}
export type Toast = Omit<ToasterToast, "id">;
