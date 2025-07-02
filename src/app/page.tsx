import { getServerSession, signOut } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Building2, Target, Users, Umbrella, Building, Square, Sparkles, Shield, Clock, TrendingUp, Heart, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function Home() {
  const session = await getServerSession(authOptions as any);
  const Session = session as any;

  // Function to get dashboard link based on user role
  const getDashboardLink = () => {
    if (!Session?.user?.role) return "/auth/signin";

    switch (Session.user.role) {
      case "admin":
        return "/admin";
      case "rh":
        return "/admin";
      case "manager":
        return "/manager";
      case "employe":
        return "/employe";
      default:
        return "/employe";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-800 shadow">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-extrabold text-blue-700 tracking-wide flex items-center gap-2">
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

          {Session?.user ? (
            <>
              <Link
                href={getDashboardLink()}
                className="text-gray-700 dark:text-gray-200 hover:underline"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-gray-700 dark:text-gray-200 hover:underline"
              >
                Mon profil
              </Link>
              <form action="/api/auth/signout" method="POST" className="inline">
                <button
                  type="submit"
                  className="ml-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="ml-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Se connecter
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gradient-to-b from-blue-50 to-transparent dark:from-gray-800">
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-700 mb-4 text-center">
          Bienvenue
          {Session?.user?.first_name ? `, ${Session.user.first_name}` : ""} sur Bayllo
          !
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center max-w-2xl">
          Application RH tout-en-un - Votre solution moderne pour gérer vos
          employés, demandes et informations personnelles en toute simplicité.
        </p>
        <div className="flex gap-4">
          {Session?.user ? (
            <Link
              href={getDashboardLink()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Accéder au Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Se connecter
            </Link>
          )}
          <Link
            href="#presentation"
            className="px-6 py-3 bg-white border border-blue-600 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 dark:bg-gray-900 dark:border-blue-400 dark:text-blue-300 transition"
          >
            En savoir plus
          </Link>
        </div>
      </section>

      {/* Presentation Section */}
      <section id="presentation" className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center justify-center gap-3">
              <Square className="h-8 w-8 fill-blue-600" />
              Présentation de Bayllo – Application RH tout-en-un
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Bayllo est une application web complète de gestion des ressources
              humaines (RH), conçue pour simplifier, centraliser et automatiser les
              processus RH au sein des entreprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-3">
               Pourquoi Bayllo et c’est pas Mayllo ?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Dans un environnement professionnel en constante évolution, les
                entreprises ont besoin d'un outil moderne, sécurisé et facile à
                utiliser pour :
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Suivre les employés
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Gérer les congés
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Superviser les départements
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Maintenir la conformité administrative
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-gray-700 p-8 rounded-lg">
              <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Notre Mission
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Bayllo est né de ce besoin : un système RH clair, intuitif, et
                parfaitement adapté aux PME comme aux grandes structures.
              </p>
              
              {/* Pourquoi Bayllo et c'est quoi Bayllo */}
              <div className="mt-6 p-4 bg-white dark:bg-gray-600 rounded-lg border-l-4 border-blue-500">
                <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  C'est quoi Bayllo ?
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Bayllo combine "Bay" (baie, symbole d'ouverture et de sérénité) et "llo" 
                  (suffixe évoquant la modernité). C'est votre espace RH digital, 
                  une baie tranquille dans l'océan complexe de la gestion humaine.
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Gestion des Employés
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Centralisez toutes les informations de vos employés en un seul
                endroit
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Umbrella className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Gestion des Congés
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatisez les demandes et validations de congés avec des règles
                métier
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Building className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Départements
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Organisez votre entreprise par départements et suivez les
                performances
              </p>
            </div>
          </div>

          {/* Enhanced "Pourquoi Bayllo" section with shadcn */}
          <div className="mt-16 space-y-8">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-3">
                  <Target className="h-6 w-6 text-blue-600" />
                  Pourquoi choisir Bayllo ?
                </CardTitle>
                <CardDescription className="text-base">
                  Découvrez pourquoi Bayllo est la solution RH de choix pour votre entreprise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                      <CardContent className="flex items-start gap-3 p-4">
                        <Sparkles className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100">Simplicité d'usage</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Interface intuitive conçue pour tous les profils utilisateurs</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                      <CardContent className="flex items-start gap-3 p-4">
                        <Shield className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100">Conformité légale</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Respect automatique des règles du droit du travail</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-4">
                    <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
                      <CardContent className="flex items-start gap-3 p-4">
                        <Clock className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100">Gain de temps</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Automatisation des tâches répétitives et chronophages</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                      <CardContent className="flex items-start gap-3 p-4">
                        <TrendingUp className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100">Évolutif</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">S'adapte à la croissance de votre entreprise</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-8" />

            {/* C'est quoi Bayllo section */}
            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-indigo-600" />
                  C'est quoi Bayllo ?
                  <Badge variant="secondary" className="ml-2">Notre Histoire</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-0 bg-white/50 dark:bg-gray-800/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        L'origine du nom
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Bayllo</strong> combine <em>"Bay"</em> (baie, symbole d'ouverture et de sérénité) 
                        et <em>"llo"</em> (suffixe évoquant la modernité et l'innovation).
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-white/50 dark:bg-gray-800/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Notre vision
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        C'est votre <strong>espace RH digital</strong>, une baie tranquille dans l'océan 
                        complexe de la gestion humaine.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-indigo-200 bg-indigo-50 dark:bg-indigo-900/30">
                  <CardContent className="p-4">
                    <blockquote className="text-center italic text-indigo-800 dark:text-indigo-200">
                      "Bayllo transforme la complexité RH en simplicité digitale, 
                      pour que vous puissiez vous concentrer sur l'essentiel : vos équipes."
                    </blockquote>
                    <p className="text-center text-sm text-indigo-600 dark:text-indigo-400 mt-2">
                      — L'équipe Bayllo
                    </p>
                  </CardContent>
                </Card>

                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline" className="border-blue-200 text-blue-700">Moderne</Badge>
                  <Badge variant="outline" className="border-green-200 text-green-700">Intuitif</Badge>
                  <Badge variant="outline" className="border-purple-200 text-purple-700">Évolutif</Badge>
                  <Badge variant="outline" className="border-orange-200 text-orange-700">Sécurisé</Badge>
                  <Badge variant="outline" className="border-pink-200 text-pink-700">Humain</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Navigation for logged users */}
      {Session?.user && (
        <main className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8 flex flex-col gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
              Navigation rapide
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href={getDashboardLink()}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Mon profil
                </Link>
              </li>
              {(Session.user.role === "admin" ||
                Session.user.role === "rh") && (
                <li>
                  <Link
                    href="/admin/users"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Gestion des employés
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div className="mt-4">
            <p className="text-gray-700 dark:text-gray-300">
              Pour toute question, contactez l'administrateur RH.
            </p>
          </div>
        </main>
      )}

      <footer className="mt-auto py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} BAYLLO. Tous droits réservés.
      </footer>
    </div>
  );
}
