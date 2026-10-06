/**
 * Properties List Page (Phase V23 / v1.23.0)
 * Hub for browsing, creating, and managing all real estate properties.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PropertyDto, PropertyType, PropertyCondition } from '@hbd/shared';
import { Building2, Plus, MapPin, Home, ArrowRight, ShieldAlert, Award, FolderKanban } from 'lucide-react';
import { PropertyService } from '../services/property.service';

export const PropertiesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('APARTMENT');
  const [condition, setCondition] = useState<PropertyCondition>('GOOD');
  const [city, setCity] = useState('');
  const [usableSurfaceM2, setUsableSurfaceM2] = useState<number>(85);
  const [roomsCount, setRoomsCount] = useState<number>(3);
  const [bathroomsCount, setBathroomsCount] = useState<number>(2);
  const [constructionYear, setConstructionYear] = useState<number>(2005);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const data = await PropertyService.getProperties();
      setProperties(data);
    } catch (err) {
      console.error('Error loading properties', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const created = await PropertyService.createProperty({
        name,
        propertyType,
        condition,
        address: { city },
        usableSurfaceM2,
        roomsCount,
        bathroomsCount,
        constructionYear,
      });

      setIsCreateModalOpen(false);
      setName('');
      loadProperties();
      navigate(`/properties/${created.id}`);
    } catch (err) {
      console.error('Error creating property', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight">
              {t('properties.title')}
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('properties.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('properties.registerProperty')}
        </button>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="text-center py-16 text-gray-400 text-xs">
            {t('properties.loading')}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center max-w-lg mx-auto">
            <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {t('properties.noProperties')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
              {t('properties.noPropertiesDesc')}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              {t('properties.registerNow')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => navigate(`/properties/${prop.id}`)}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 uppercase">
                      {prop.propertyType}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {prop.condition}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {prop.name}
                  </h3>

                  {prop.address?.city && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      {prop.address.city}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                      <div className="text-xs font-bold text-gray-900 dark:text-white">
                        {prop.usableSurfaceM2 ? `${prop.usableSurfaceM2} m²` : '—'}
                      </div>
                      <div className="text-[10px] text-gray-400">{t('properties.surface')}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                      <div className="text-xs font-bold text-gray-900 dark:text-white">
                        {prop.roomsCount || 0}
                      </div>
                      <div className="text-[10px] text-gray-400">{t('properties.rooms')}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                      <div className="text-xs font-bold text-gray-900 dark:text-white">
                        {(prop as any).projects?.length || 0}
                      </div>
                      <div className="text-[10px] text-gray-400">{t('properties.projects')}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>{t('properties.viewAnalysis')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('properties.registerNew')}
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('properties.name')}
                </label>
                <input
                  type="text"
                  placeholder={t('properties.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('properties.type')}
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="APARTMENT">{t('propertyTypes.apartment')}</option>
                    <option value="HOUSE">{t('propertyTypes.house')}</option>
                    <option value="DUPLEX">{t('propertyTypes.duplex')}</option>
                    <option value="PENTHOUSE">{t('propertyTypes.penthouse')}</option>
                    <option value="STUDIO">{t('propertyTypes.studio')}</option>
                    <option value="TOWNHOUSE">{t('propertyTypes.townhouse')}</option>
                    <option value="VILLA">{t('propertyTypes.villa')}</option>
                    <option value="OFFICE">{t('propertyTypes.office')}</option>
                    <option value="COMMERCIAL">{t('propertyTypes.commercial')}</option>
                    <option value="OTHER">{t('propertyTypes.other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('properties.condition')}
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as PropertyCondition)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="GOOD">{t('propertyConditions.good')}</option>
                    <option value="NEW">{t('propertyConditions.new')}</option>
                    <option value="NEEDS_UPDATE">{t('propertyConditions.needsUpdate')}</option>
                    <option value="RENOVATION_REQUIRED">{t('propertyConditions.renovationRequired')}</option>
                    <option value="FULL_RENOVATION">{t('propertyConditions.fullRenovation')}</option>
                    <option value="UNKNOWN">{t('propertyConditions.unknown')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('properties.cityLocation')}
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Madrid"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('properties.usableSurfaceM2')}
                  </label>
                  <input
                    type="number"
                    value={usableSurfaceM2}
                    onChange={(e) => setUsableSurfaceM2(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('properties.roomsCount')}
                  </label>
                  <input
                    type="number"
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('properties.bathroomsCount')}
                  </label>
                  <input
                    type="number"
                    value={bathroomsCount}
                    onChange={(e) => setBathroomsCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('properties.constructionYear')}
                  </label>
                  <input
                    type="number"
                    value={constructionYear}
                    onChange={(e) => setConstructionYear(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  {t('properties.saveProperty')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesListPage;
