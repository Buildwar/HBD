/**
 * Property Intelligence Dashboard Page (Phase V23 / v1.23.0)
 * Comprehensive overview consolidating spatial, technical, financial, opportunities, and risks.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PropertyDto,
  PropertyIntelligenceReportDto,
  PropertyOpportunityItem,
  PropertyRiskItem,
  PropertySnapshotDto,
} from '@hbd/shared';
import {
  Building2,
  LayoutGrid,
  Lightbulb,
  ShieldAlert,
  Award,
  History,
  ArrowLeft,
  Box,
  Glasses,
  Cpu,
  DollarSign,
  Plus,
  RefreshCw,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react';
import { PropertyService } from '../services/property.service';
import { PropertySummaryCard } from '../features/property-intelligence/PropertySummaryCard';
import { PropertySpatialProfile } from '../features/property-intelligence/PropertySpatialProfile';
import { PropertyOpportunityList } from '../features/property-intelligence/PropertyOpportunityList';
import { PropertyRiskList } from '../features/property-intelligence/PropertyRiskList';
import { PropertyDataQualityGauge } from '../features/property-intelligence/PropertyDataQualityGauge';
import { PropertySnapshotManager } from '../features/property-intelligence/PropertySnapshotManager';

export const PropertyIntelligencePage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [propertyId, setPropertyId] = useState<string | null>(id || null);
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [report, setReport] = useState<PropertyIntelligenceReportDto | null>(null);
  const [snapshots, setSnapshots] = useState<PropertySnapshotDto[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SPATIAL' | 'OPPORTUNITIES' | 'RISKS' | 'QUALITY' | 'SNAPSHOTS'>('OVERVIEW');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadPropertiesAndReport();
  }, [id]);

  const loadPropertiesAndReport = async () => {
    setIsLoading(true);
    try {
      const allProps = await PropertyService.getProperties();
      setProperties(allProps);

      let targetId = id;
      if (!targetId && allProps.length > 0) {
        targetId = allProps[0].id;
      }

      if (targetId) {
        setPropertyId(targetId);
        const reportData = await PropertyService.getAnalysisReport(targetId);
        setReport(reportData);
        const snapData = await PropertyService.getSnapshots(targetId);
        setSnapshots(snapData);
      }
    } catch (err) {
      console.error('Error fetching property intelligence', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateOpportunities = async () => {
    if (!propertyId) return;
    try {
      const opps = await PropertyService.generateOpportunities(propertyId);
      if (report) {
        setReport({ ...report, opportunities: opps });
      }
      showNotice('Nuevas oportunidades detectadas mediante análisis heurístico.');
    } catch (err) {
      console.error('Error generating opportunities', err);
    }
  };

  const handleGenerateRisks = async () => {
    if (!propertyId) return;
    try {
      const risks = await PropertyService.generateRisks(propertyId);
      if (report) {
        setReport({ ...report, risks });
      }
      showNotice('Auditoría de riesgos actualizada.');
    } catch (err) {
      console.error('Error generating risks', err);
    }
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  if (isLoading && !report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-xs text-gray-400">{t('propertyIntelligence.loading')}</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 text-center">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t('propertyIntelligence.noPropertySelected')}</h2>
        <button
          onClick={() => navigate('/properties')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          {t('propertyIntelligence.goToList')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/properties')}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Property Intelligence
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {t('propertyIntelligence.subtitle')}
            </p>
          </div>
        </div>

        {/* Property Selector & Integration quick actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {properties.length > 1 && (
            <select
              value={propertyId || ''}
              onChange={(e) => navigate(`/properties/${e.target.value}`)}
              className="px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-gray-800 dark:text-gray-200"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => navigate('/viewer3d')}
            className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium shadow-sm transition-colors"
            title={t('propertyIntelligence.actions.open3D')}
          >
            <Box className="w-4 h-4 text-indigo-500" />
            3D
          </button>

          <button
            onClick={() => navigate('/ar')}
            className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium shadow-sm transition-colors"
            title={t('propertyIntelligence.actions.openAR')}
          >
            <Glasses className="w-4 h-4 text-emerald-500" />
            AR
          </button>

          <button
            onClick={() => navigate('/infrastructure')}
            className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium shadow-sm transition-colors"
            title={t('propertyIntelligence.actions.technicalInst')}
          >
            <Cpu className="w-4 h-4 text-purple-500" />
            {t('propertyIntelligence.actions.installations')}
          </button>
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className="max-w-7xl mx-auto mb-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs opacity-75 hover:opacity-100">
            Cerrar
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Summary Card */}
        <PropertySummaryCard
          property={report.property}
          investment={report.investment}
          onEdit={() => navigate('/properties')}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            {t('propertyIntelligence.tabs.overview')}
          </button>
          <button
            onClick={() => setActiveTab('SPATIAL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'SPATIAL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            {t('propertyIntelligence.tabs.spatial')} ({report.spatial.roomsCount})
          </button>
          <button
            onClick={() => setActiveTab('OPPORTUNITIES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'OPPORTUNITIES'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            {t('propertyIntelligence.tabs.opportunities')} ({report.opportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('RISKS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'RISKS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            {t('propertyIntelligence.tabs.risks')} ({report.risks.length})
          </button>
          <button
            onClick={() => setActiveTab('QUALITY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'QUALITY'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Award className="w-4 h-4" />
            {t('propertyIntelligence.tabs.dataQuality')} ({report.dataQuality.completionPercentage}%)
          </button>
          <button
            onClick={() => setActiveTab('SNAPSHOTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'SNAPSHOTS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <History className="w-4 h-4" />
            {t('propertyIntelligence.tabs.snapshots')} ({snapshots.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PropertySpatialProfile spatial={report.spatial} />
              <PropertyOpportunityList
                opportunities={report.opportunities}
                onGenerateMore={handleGenerateOpportunities}
              />
            </div>

            <div className="space-y-6">
              <PropertyDataQualityGauge quality={report.dataQuality} />
              <PropertyRiskList
                risks={report.risks}
                onGenerateMore={handleGenerateRisks}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Spatial */}
        {activeTab === 'SPATIAL' && (
          <div className="space-y-6">
            <PropertySpatialProfile spatial={report.spatial} />
          </div>
        )}

        {/* Tab 3: Opportunities */}
        {activeTab === 'OPPORTUNITIES' && (
          <div className="space-y-6">
            <PropertyOpportunityList
              opportunities={report.opportunities}
              onGenerateMore={handleGenerateOpportunities}
            />
          </div>
        )}

        {/* Tab 4: Risks */}
        {activeTab === 'RISKS' && (
          <div className="space-y-6">
            <PropertyRiskList
              risks={report.risks}
              onGenerateMore={handleGenerateRisks}
            />
          </div>
        )}

        {/* Tab 5: Data Quality */}
        {activeTab === 'QUALITY' && (
          <div className="space-y-6">
            <PropertyDataQualityGauge quality={report.dataQuality} />
          </div>
        )}

        {/* Tab 6: Snapshots */}
        {activeTab === 'SNAPSHOTS' && propertyId && (
          <div className="space-y-6">
            <PropertySnapshotManager
              propertyId={propertyId}
              snapshots={snapshots}
              onSnapshotCreated={(newSnap) => setSnapshots((prev) => [newSnap, ...prev])}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyIntelligencePage;
