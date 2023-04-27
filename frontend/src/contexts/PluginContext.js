import React, { createContext, useState, useEffect } from 'react';
import { RotatingLines } from 'react-loader-spinner';
import { useSelector } from 'react-redux';
import useDataApi from '../hooks/useDataApi';

export const PluginContext = createContext();

export const PluginProvider = ({ children }) => {
  const pluginId = useSelector(state => state?.gameUi?.game?.pluginId);
  const { data, isLoading, isError, doFetchUrl, doFetchHash, setData } = useDataApi(
    '/be/api/plugins/' + pluginId,
    null
  );
  console.log("pluginTrace PluginProvider base 1", {pluginId, isLoading})

  useEffect(() => {
    console.log("pluginTrace PluginProvider useEffect 1", {pluginId, isLoading})
    doFetchUrl('/be/api/plugins/' + pluginId);
    console.log("pluginTrace PluginProvider useEffect 2", {pluginId, isLoading})
  }, [pluginId]);

  return (
    <PluginContext.Provider value={{ plugin: data, isLoading }}>
        {isLoading ?
            <div className="absolute flex h-full w-full items-center justify-center opacity-80 bg-gray-800">
            <RotatingLines
                height={100}
                width={100}
                strokeColor="white"/>
            </div>
        :
        children}
    </PluginContext.Provider>
  );
};
