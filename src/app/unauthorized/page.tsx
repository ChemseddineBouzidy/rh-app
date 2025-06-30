// app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-gray-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md flex flex-col items-center border border-red-100">
        <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
          <svg
            width="36"
            height="36"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="text-red-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Accès refusé</h1>
        <p className="text-gray-600 mb-4 text-center">
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}
