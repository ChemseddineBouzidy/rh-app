import { getServerSession, signOut } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions as any);
  const Session = session as any;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-800 shadow">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-extrabold text-blue-700 tracking-wide">
            BAYLLO
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-gray-700 dark:text-gray-200 hover:underline"
          >
            Accueil
          </Link>
          <Link
            href="/profile"
            className="text-gray-700 dark:text-gray-200 hover:underline"
          >
            Mon profil
          </Link>
          <Link
            href="/employees"
            className="text-gray-700 dark:text-gray-200 hover:underline"
          >
            Employés
          </Link>
          <Link
            href="/requests"
            className="text-gray-700 dark:text-gray-200 hover:underline"
          >
            Mes demandes
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="ml-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gradient-to-b from-blue-50 to-transparent dark:from-gray-800">
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-700 mb-4 text-center">
          Bienvenue{Session?.user?.name ? `, ${Session.user.name}` : ""} !
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center max-w-2xl">
          BAYLLO, votre solution RH moderne pour gérer vos employés, demandes et
          informations personnelles en toute simplicité.
        </p>
        <div className="flex gap-4">
          <Link
            href="/employees"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Voir les employés
          </Link>
          <Link
            href="/profile"
            className="px-6 py-3 bg-white border border-blue-600 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 dark:bg-gray-900 dark:border-blue-400 dark:text-blue-300 transition"
          >
            Mon profil
          </Link>
        </div>
      </section>

      {/* Main content */}
      <main className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8 flex flex-col gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Navigation rapide
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/profile"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Mon profil
              </Link>
            </li>
            <li>
              <Link
                href="/employees"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Liste des employés
              </Link>
            </li>
            <li>
              <Link
                href="/requests"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Mes demandes
              </Link>
            </li>
          </ul>
        </div>
        <div className="mt-4">
          <p className="text-gray-700 dark:text-gray-300">
            Pour toute question, contactez l'administrateur RH.
          </p>
        </div>
      </main>
      <footer className="mt-auto py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} BAYLLO. Tous droits réservés.
      </footer>
    </div>
  );
}
