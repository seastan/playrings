import React, { useState, useEffect, useContext } from "react";
import { useSelector } from 'react-redux';

const plugins = {
    lotrlcg: require("../../plugins/lotrlcg/definitions/gameDefinition.json")
};

export const useGameDefinition = () => {
    const pluginId = useSelector(state => state?.gameUi?.pluginId);
    return plugins[pluginId];
}