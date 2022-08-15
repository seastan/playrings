import { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import BroadcastContext from '../../../contexts/BroadcastContext';
import useDataApi from '../../../hooks/useDataApi';

export const usePlugin = () => {    
    //const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    const pluginUuid = useSelector(state => state?.gameUi?.game?.pluginUuid);
    const pluginVersion = useSelector(state => state?.gameUi?.game?.pluginVersion);
    const { data, isLoading, isError, doFetchUrl, doFetchHash, setData } = useDataApi(
        "/be/api/plugins/"+pluginUuid+"/"+pluginVersion,
        null
    );
    useEffect(() => {
        console.log("plugininfo",pluginUuid, pluginVersion)
        doFetchUrl("/be/api/plugins/"+pluginUuid+"/"+pluginVersion);
    }, [pluginUuid, pluginVersion, data]);
    console.log("pluginuP", pluginUuid, data)
    return data;
}