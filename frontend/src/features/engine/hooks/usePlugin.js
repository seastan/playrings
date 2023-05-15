import { useContext } from 'react';
import { PluginContext } from '../../../contexts/PluginContext';

export const usePlugin = () => {
  const { plugin } = useContext(PluginContext);
  console.log("usePlugin 1", plugin);
  return plugin;
};