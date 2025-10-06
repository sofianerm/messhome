import { useState, lazy, Suspense } from "react";
import { Toaster } from "sonner";
import "./global.css";
import {
  Calendar,
  ShoppingCart,
  UtensilsCrossed,
  Plane,
  CheckSquare,
  Menu,
  X,
  Plus,
  Search,
  User,
  Cloud,
  Car,
  Star,
  LayoutGrid,
  Film,
  Settings,
  StickyNote,
  LogOut,
} from "lucide-react";
import { useFamilySettings } from "../hooks/useFamilySettings";
import { useAuth } from "../hooks/useAuth";

// Lazy load Auth Form
const AuthForm = lazy(() => import("../components/auth/AuthForm"));
const FamilyOnboarding = lazy(() => import("../components/onboarding/FamilyOnboarding"));

// Lazy load components for better performance
const VueGenerale = lazy(() => import("../components/sections/VueGenerale"));
const AgendaFamilial = lazy(() => import("../components/sections/AgendaFamilial"));
const ListeCourses = lazy(() => import("../components/sections/ListeCourses"));
const RepasMenus = lazy(() => import("../components/sections/RepasMenus"));
const Voyages = lazy(() => import("../components/sections/Voyages"));
const TachesMaison = lazy(() => import("../components/sections/TachesMaison"));
const Meteo = lazy(() => import("../components/sections/Meteo"));
const Transport = lazy(() => import("../components/sections/Transport"));
const HeurePriere = lazy(() => import("../components/sections/HeurePriere"));
const Filmographie = lazy(() => import("../components/sections/Filmographie"));
const NotesPartagees = lazy(() => import("../components/sections/NotesPartagees"));
const FamilySettings = lazy(() => import("../components/sections/FamilySettings"));

const sections = [
  {
    id: "vue-generale",
    name: "Vue générale",
    icon: LayoutGrid,
    component: VueGenerale,
  },
  {
    id: "agenda",
    name: "Agenda familial",
    icon: Calendar,
    component: AgendaFamilial,
  },
  {
    id: "courses",
    name: "Liste de courses",
    icon: ShoppingCart,
    component: ListeCourses,
  },
  {
    id: "repas",
    name: "Repas & menus",
    icon: UtensilsCrossed,
    component: RepasMenus,
  },
  { id: "meteo", name: "Météo", icon: Cloud, component: Meteo },
  { id: "transport", name: "Transport", icon: Car, component: Transport },
  {
    id: "heure-priere",
    name: "Heures de prière",
    icon: Star,
    component: HeurePriere,
  },
  { id: "voyages", name: "Voyages", icon: Plane, component: Voyages },
  {
    id: "taches",
    name: "Tâches maison",
    icon: CheckSquare,
    component: TachesMaison,
  },
  {
    id: "notes",
    name: "Notes partagées",
    icon: StickyNote,
    component: NotesPartagees,
  },
  {
    id: "filmographie",
    name: "Filmographie",
    icon: Film,
    component: Filmographie,
  },
];

// Section paramètres (hors menu principal)
const parametresSection = {
  id: "parametres",
  name: "Paramètres",
  icon: Settings,
  component: FamilySettings,
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("vue-generale");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { settings, loading: settingsLoading } = useFamilySettings();
  const { isAuthenticated, loading: authLoading, signOut } = useAuth();

  // Chercher dans sections + paramètres
  const allSections = [...sections, parametresSection];
  const ActiveComponent =
    allSections.find((s) => s.id === activeSection)?.component || VueGenerale;
  const activeSectionName =
    allSections.find((s) => s.id === activeSection)?.name || "Vue générale";

  // Déterminer si c'est la première connexion
  const isFirstLogin = isAuthenticated && !settingsLoading && settings && !settings.family_name;

  // Auth loading state
  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563FF] mx-auto mb-4"></div>
          <p className="text-[14px] text-[#7A7A7A]">Chargement...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login form
  if (!isAuthenticated) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563FF]"></div>
        </div>
      }>
        <AuthForm />
      </Suspense>
    );
  }

  // First login - show onboarding
  if ((isFirstLogin || showOnboarding) && !settingsLoading) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563FF]"></div>
        </div>
      }>
        <FamilyOnboarding onComplete={() => setShowOnboarding(false)} />
      </Suspense>
    );
  }

  // Authenticated - show dashboard
  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-white font-inter text-[#2B2B2B] text-[13px] font-normal">
        {/* Layout principal */}
      <div className="flex h-screen">
        {/* Barre latérale gauche */}
        <div
          className={`${sidebarOpen ? "w-[240px]" : "w-[60px]"} h-full border-r border-[#EDEDED] flex flex-col transition-all duration-300 bg-white md:relative absolute z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          {/* Header de la sidebar */}
          <div className="h-[64px] flex items-center px-4 border-b border-[#EDEDED] relative">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {sidebarOpen ? (
                <X size={20} className="text-[#5C5C5C]" />
              ) : (
                <Menu size={20} className="text-[#5C5C5C]" />
              )}
            </button>
            {sidebarOpen && (
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <img 
                  src="/logo.svg" 
                  alt="Maison Dashboard" 
                  className="h-10 w-auto"
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 px-2 pt-4 overflow-y-auto">
            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 h-[44px] px-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#2563FF] text-white"
                        : "text-[#7A7A7A] hover:bg-gray-50 hover:text-[#2B2B2B]"
                    }`}
                    title={section.name}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="text-[13px] font-medium truncate">
                        {section.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer sidebar */}
          {sidebarOpen && (
            <div className="p-4 border-t border-[#EDEDED] space-y-2">
              <button
                onClick={() => setActiveSection('parametres')}
                className="flex items-center gap-2 text-[12px] text-[#9B9B9B] hover:text-[#2563FF] transition-colors w-full"
              >
                <User size={16} />
                <span>{settings?.family_name || 'Famille Messaoudi'}</span>
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-[12px] text-[#9B9B9B] hover:text-red-500 transition-colors w-full"
              >
                <LogOut size={16} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header top */}
          <div className="h-[64px] flex items-center justify-between px-6 border-b border-[#EDEDED] bg-white">
            {/* Menu mobile */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded"
              >
                <Menu size={20} className="text-[#5C5C5C]" />
              </button>
            </div>

            {/* Barre de recherche et actions */}
            <div className="flex items-center gap-4">
              <div className="relative max-w-[300px] hidden md:block">
                <div className="flex items-center h-[40px] px-4 border border-[#E5E5E5] rounded-full">
                  <Search size={16} className="text-[#C3C3C3] mr-3" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="flex-1 text-[14px] text-[#A3A3A3] bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="text-[12px] text-[#9B9B9B]">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Contenu de la section active */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563FF] mx-auto mb-4"></div>
                  <p className="text-[14px] text-[#7A7A7A]">Chargement...</p>
                </div>
              </div>
            }>
              <div className="animate-fade-in">
                <ActiveComponent />
              </div>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
