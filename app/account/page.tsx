import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AccountView } from "./account-view";

export const metadata = {
  title: "Account | SwingDNA",
  description: "Manage your SwingDNA sign-in.",
};

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  return <AccountView email={user.email ?? ""} />;
}
