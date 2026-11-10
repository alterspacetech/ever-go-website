"use client";

import { useWhatsApp } from "@/context/CatalogContext";
import { useStore } from "@/context/StoreContext";

export default function SignupForm() {
  const { toast } = useStore();
  const whatsapp = useWhatsApp();

  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get("email").trim();
    whatsapp.open(`Hello EVER-GO, please add me to your updates list.\n\nName: ${form.get("name").trim()}\nWhatsApp: ${form.get("phone").trim()}${email ? `\nEmail: ${email}` : ""}`);
    toast("Opening WhatsApp…");
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>Name<input name="name" autoComplete="name" placeholder="Your name" required /></label>
      <label>WhatsApp number<input name="phone" type="tel" autoComplete="tel" placeholder="Your WhatsApp number" required /></label>
      <label className="full">Email (optional)<input name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label>
      <div className="full" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn green" type="submit">Sign up on WhatsApp</button>
        <span className="note">Opens WhatsApp with your details filled in.</span>
      </div>
    </form>
  );
}