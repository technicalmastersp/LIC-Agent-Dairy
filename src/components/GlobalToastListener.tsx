import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { toastEmitter } from "../../utils/toastEmitter";

const GlobalToastListener = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Register the real toast function once component mounts
    toastEmitter.register(({ title, description, variant }) => {
      toast({ title, description, variant });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // renders nothing
};

export default GlobalToastListener;