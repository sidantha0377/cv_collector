"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleLogout() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  allCookies.forEach((cookie) => {
    cookieStore.delete(cookie.name);
  });

  redirect("/");
}
