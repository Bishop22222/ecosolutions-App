import { supabase } from "./supabase.js";
import { setUser } from "./state.js";

export async function handleRegister() {
  const email = document.getElementById("reg-email")?.value;
  const username = document.getElementById("reg-username")?.value;
  const password = document.getElementById("reg-password")?.value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) return console.log(error.message);

  const user = data.user;

  await supabase.from("profiles").insert({
    id: user.id,
    username,
    points_balance: 0
  });

  navigate("login");
}

export async function handleLogin() {
  const email = document.getElementById("username")?.value;
  const password = document.getElementById("password")?.value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return console.log(error.message);

  setUser(data.user);
  navigate("dashboard");
}

export async function handleLogout() {
  await supabase.auth.signOut();
  setUser(null);
  navigate("login");
}
