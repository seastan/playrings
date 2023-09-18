import React, { createContext, useState, useEffect } from 'react';
import { RotatingLines } from 'react-loader-spinner';
import { useSelector } from 'react-redux';
import useDataApi from '../hooks/useDataApi';
import LZString from 'lz-string'; // Importing lz-string

export const PluginContext = createContext();

export const PluginProvider = ({ children }) => {
  const pluginId = useSelector(state => state?.gameUi?.game?.pluginId);
  const pluginVersion = useSelector(state => state?.gameUi?.game?.pluginVersion);
  const { data, isLoading, isError, doFetchUrl, doFetchHash, setData } = useDataApi(
    '/be/api/plugins/' + pluginId,
    null,
    false
  );

  const [retrievedFromStorage, setRetrievedFromStorage] = useState(false); // Flag to track data source

  useEffect(() => {
    const compressedData = localStorage.getItem(`pluginData_${pluginId}`);
    // if (compressedData) {
    //   const decompressedData = LZString.decompressFromUTF16(compressedData);
    //   const localPlugin = JSON.parse(decompressedData);
    //   console.log('localPlugin', localPlugin, pluginVersion);
    //   if (localPlugin?.version === pluginVersion) {
    //     setData(localPlugin);
    //     setRetrievedFromStorage(true); // Set the flag
    //     console.log('Retrieved data from localStorage');
    //     return;
    //   }
    // }
    doFetchHash((new Date()).toISOString());
  }, [pluginId]);

  useEffect(() => {
    if (data && !retrievedFromStorage) {  // Check the flag before writing
      try {
        const compressedData = LZString.compressToUTF16(JSON.stringify(data));
        localStorage.setItem(`pluginData_${pluginId}`, compressedData);
      } catch (e) {
        console.warn('Failed to save data in localStorage:', e);
      }
    }
    setRetrievedFromStorage(false);  // Reset the flag for the next round
  }, [data, pluginId]);

  return (
    <PluginContext.Provider value={{ plugin: data, isLoading }}>
      {retrievedFromStorage === false && (isLoading || data?.game_def == null) ? (
        <div className="absolute flex h-full w-full items-center justify-center opacity-80 bg-gray-800">
          <RotatingLines height={100} width={100} strokeColor="white" />
        </div>
      ) : (
        children
      )}
    </PluginContext.Provider>
  );
};
