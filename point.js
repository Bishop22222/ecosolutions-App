import { supabase } from "./supabase.js";
import { getUser } from "./state.js";

export async function fetchPoints() {
  const user = getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from("profiles")
    .select("username, points_balance")
    .eq("id", user.id)
    .single();

  document.getElementById("points").textContent = data.points_balance;
  return data.points_balance;
}

export async function addPoints(amount) {
  const user = getUser();
  if (!user) return;

  const current = await fetchPoints();

  await supabase.from("profiles").update({
    points_balance: current + amount
  }).eq("id", user.id);

  await supabase.from("points_history").insert({
    user_id: user.id,
    points: amount
  });

  fetchPoints();
}

export async function getHistory() {
  const user = getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("points_history")
    .select("created_at, points")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return data;
}
