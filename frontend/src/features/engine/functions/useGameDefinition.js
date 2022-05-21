import React, { useState, useEffect, useContext } from "react";
import { useSelector } from 'react-redux';

export const useGameDefinition = () => {
    return useSelector(state => state?.gameUi?.gameDef);
}