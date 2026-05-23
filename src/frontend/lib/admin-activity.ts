import { supabase } from "@/integrations/supabase/client";

export type AdminActivityType = "premium_purchase" | "account_settings" | "device_event" | "contact_message";

export type AdminActivity = {
  type: AdminActivityType;
  title: string;
  message: string;
  userId?: string;
  userEmail?: string;
  createdAt: string;
};

export function createAdminActivityChannel() {
  return supabase.channel("voltx-admin-activity", {
    config: { broadcast: { self: true } },
  });
}

export async function emitAdminActivity(activity: Omit<AdminActivity, "createdAt">) {
  const channel = createAdminActivityChannel();
  await channel.subscribe(async (status) => {
    if (status !== "SUBSCRIBED") return;
    await channel.send({
      type: "broadcast",
      event: "user_activity",
      payload: { ...activity, createdAt: new Date().toISOString() },
    });
    await supabase.removeChannel(channel);
  });
}
