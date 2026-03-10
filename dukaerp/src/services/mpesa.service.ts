import axios from "axios";

export const mpesaService = {
  async triggerStkPush({ phone, amount, shop_id, sale_id }: { phone: string; amount: number; shop_id: string; sale_id?: string }) {
    try {
      const res = await axios.post("/functions/v1/mpesa-stk-push", {
        phone,
        amount,
        shop_id,
        sale_id,
      });
      return res.data;
    } catch (error) {
      console.error("mpesa stk push", error);
      throw error;
    }
  },
};
