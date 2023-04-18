import React, { createContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useDataApi from '../hooks/useDataApi';

export const PluginContext = createContext();

export const PluginProvider = ({ children }) => {
  const pluginId = useSelector(state => state?.gameUi?.game?.pluginId);
  const { data, isLoading, isError, doFetchUrl, doFetchHash, setData } = useDataApi(
    '/be/api/plugins/' + pluginId,
    null
  );

  useEffect(() => {
    doFetchUrl('/be/api/plugins/' + pluginId);
  }, [pluginId]);

  return (
    <PluginContext.Provider value={{ plugin: data, isLoading }}>
      {children}
    </PluginContext.Provider>
  );
};
