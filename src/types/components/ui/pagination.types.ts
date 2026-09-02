import * as React from "react";
import type { ButtonProps } from "@/types/components/ui/button.types";

export type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;
