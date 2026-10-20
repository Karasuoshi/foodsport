"use client";
// The only form on the site: a one-time sign-in per device.
import { useState, type FormEvent } from "react";
import { AuthError, signIn } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email, password);
    } catch (err) {
      if (!(err instanceof AuthError)) setError("Нет связи. Попробуй ещё раз.");
      else setError(/invalid login/i.test(err.message) ? "Неверная почта или пароль." : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="journalpanel login">
      <h2>Вход в дневник</h2>
      <p className="journalsub">Один раз на этом устройстве — дальше дневник открывается сам.</p>
      <form onSubmit={submit}>
        <input type="email" autoComplete="email" placeholder="Почта" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" autoComplete="current-password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={busy || !email || !password}>Войти</button>
      </form>
      {error && <p role="alert" className="loginerror">{error}</p>}
    </section>
  );
}
