import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { PageLoader } from './components/common/PageLoader.js';

// Core sync views
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

// Lazy-loaded views for optimized code splitting & bundle size
const ProjectsPage = React.lazy(() =>
  import('./pages/ProjectsPage.js').then((m) => ({ default: m.ProjectsPage }))
);
const ProjectDetailPage = React.lazy(() =>
  import('./pages/ProjectDetailPage.js').then((m) => ({ default: m.ProjectDetailPage }))
);
const PlansPage = React.lazy(() =>
  import('./pages/PlansPage.js').then((m) => ({ default: m.PlansPage }))
);
const FurniturePage = React.lazy(() =>
  import('./pages/FurniturePage.js').then((m) => ({ default: m.FurniturePage }))
);
const Viewer3DPage = React.lazy(() =>
  import('./pages/Viewer3DPage.js').then((m) => ({ default: m.Viewer3DPage }))
);
const RendersPage = React.lazy(() =>
  import('./pages/RendersPage.js').then((m) => ({ default: m.RendersPage }))
);
const ProjectGalleryPage = React.lazy(() =>
  import('./features/ai-vision/ProjectGalleryPage.js').then((m) => ({ default: m.ProjectGalleryPage }))
);
const ConstructionPage = React.lazy(() =>
  import('./pages/ConstructionPage.js').then((m) => ({ default: m.ConstructionPage }))
);
const ConstructionExecutionPage = React.lazy(() =>
  import('./pages/ConstructionExecutionPage.js').then((m) => ({ default: m.ConstructionExecutionPage }))
);
const ProductsPage = React.lazy(() =>
  import('./pages/ProductsPage.js').then((m) => ({ default: m.ProductsPage }))
);
const RetailCatalogPage = React.lazy(() =>
  import('./pages/RetailCatalogPage.js').then((m) => ({ default: m.RetailCatalogPage }))
);
const TechnicalInfrastructurePage = React.lazy(() =>
  import('./pages/TechnicalInfrastructurePage.js').then((m) => ({ default: m.TechnicalInfrastructurePage }))
);
const ARVisualizationPage = React.lazy(() =>
  import('./pages/ARVisualizationPage.js').then((m) => ({ default: m.ARVisualizationPage }))
);
const PropertiesListPage = React.lazy(() =>
  import('./pages/PropertiesListPage.js').then((m) => ({ default: m.PropertiesListPage }))
);
const PropertyIntelligencePage = React.lazy(() =>
  import('./pages/PropertyIntelligencePage.js').then((m) => ({ default: m.PropertyIntelligencePage }))
);
const ProjectFinancialPage = React.lazy(() =>
  import('./pages/ProjectFinancialPage.js').then((m) => ({ default: m.ProjectFinancialPage }))
);
const ProjectProcurementPage = React.lazy(() =>
  import('./pages/ProjectProcurementPage.js').then((m) => ({ default: m.ProjectProcurementPage }))
);
const DocumentsPage = React.lazy(() =>
  import('./pages/DocumentsPage.js').then((m) => ({ default: m.DocumentsPage }))
);
const CopilotPage = React.lazy(() =>
  import('./pages/CopilotPage.js').then((m) => ({ default: m.CopilotPage }))
);
const SettingsPage = React.lazy(() =>
  import('./pages/SettingsPage.js').then((m) => ({ default: m.SettingsPage }))
);
const ProfilePage = React.lazy(() =>
  import('./pages/ProfilePage.js').then((m) => ({ default: m.ProfilePage }))
);
const AboutPage = React.lazy(() =>
  import('./pages/AboutPage.js').then((m) => ({ default: m.AboutPage }))
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-dark-bg">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas protegidas con AppLayout y Suspense para Lazy Loading */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route
                path="/properties"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PropertiesListPage />
                  </Suspense>
                }
              />
              <Route
                path="/properties/:id"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PropertyIntelligencePage />
                  </Suspense>
                }
              />
              <Route
                path="/property-intelligence"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PropertyIntelligencePage />
                  </Suspense>
                }
              />
              <Route
                path="/projects"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProjectsPage />
                  </Suspense>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProjectDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="/plans"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PlansPage />
                  </Suspense>
                }
              />
              <Route
                path="/furniture"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <FurniturePage />
                  </Suspense>
                }
              />
              <Route
                path="/viewer3d"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Viewer3DPage />
                  </Suspense>
                }
              />
              <Route
                path="/renders"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <RendersPage />
                  </Suspense>
                }
              />
              <Route
                path="/vision"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProjectGalleryPage />
                  </Suspense>
                }
              />
              <Route
                path="/gallery"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProjectGalleryPage />
                  </Suspense>
                }
              />
              <Route
                path="/construction"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ConstructionPage />
                  </Suspense>
                }
              />
              <Route
                path="/execution"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ConstructionExecutionPage />
                  </Suspense>
                }
              />
              <Route
                path="/projects/:id/execution"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ConstructionExecutionPage />
                  </Suspense>
                }
              />
              <Route
                path="/products"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProductsPage />
                  </Suspense>
                }
              />
              <Route
                path="/projects/:id/products"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProductsPage />
                  </Suspense>
                }
              />
              <Route
                path="/catalog"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <RetailCatalogPage />
                  </Suspense>
                }
              />
              <Route
                path="/projects/:id/catalog"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <RetailCatalogPage />
                  </Suspense>
                }
              />
              <Route
                path="/infrastructure"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TechnicalInfrastructurePage />
                  </Suspense>
                }
              />
              <Route
                path="/projects/:id/infrastructure"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TechnicalInfrastructurePage />
                  </Suspense>
                }
              />
              <Route
                path="/ar"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ARVisualizationPage />
                  </Suspense>
                }
              />
              <Route
                path="/projects/:id/ar"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ARVisualizationPage />
                  </Suspense>
                }
              />
              <Route
                path="/financial"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProjectsPage />
                  </Suspense>
                }
              />
              <Route
                path="/projects/:id/financial"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProjectFinancialPage />
                  </Suspense>
                }
              />
              <Route
                path="/procurement"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProjectsPage />
                  </Suspense>
                }
              />
              <Route
                path="/projects/:id/procurement"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProjectProcurementPage />
                  </Suspense>
                }
              />
              <Route
                path="/documents"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <DocumentsPage />
                  </Suspense>
                }
              />
              <Route
                path="/copilot"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CopilotPage />
                  </Suspense>
                }
              />
              <Route
                path="/projects/:id/copilot"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CopilotPage />
                  </Suspense>
                }
              />
              <Route
                path="/settings"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <SettingsPage />
                  </Suspense>
                }
              />
              <Route
                path="/profile"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProfilePage />
                  </Suspense>
                }
              />
              <Route
                path="/about"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AboutPage />
                  </Suspense>
                }
              />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
