import { useMutation } from "@tanstack/react-query";
import { mpesaService } from "@/services/mpesa.service";

export function useMpesa() {
  const stkPush = useMutation({
    mutationFn: mpesaService.triggerStkPush,
  });

  return { stkPush };
}
