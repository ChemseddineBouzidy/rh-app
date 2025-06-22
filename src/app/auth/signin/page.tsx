"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("superadmin@example.com");
  const [password, setPassword] = useState("SuperSecret123!");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      // Si connecté, on redirige vers /admin
      router.push("/admin");
    }
  }, [status, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Email ou mot de passe invalide");
    } else {
      // Redirection après connexion réussie
      router.push("/admin");
    }
  }

  if (status === "loading") {
    return <p>Chargement...</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Connexion</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Se connecter</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
