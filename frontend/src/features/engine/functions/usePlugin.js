import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import useDataApi from '../../../hooks/useDataApi';

export const usePlugin = () => {    
    //const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    const pluginId = useSelector(state => state?.gameUi?.game?.pluginId);
    const { data, isLoading, isError, doFetchUrl, doFetchHash, setData } = useDataApi(
        "/be/api/plugins/"+pluginId,
        null
    );
    useEffect(() => {
        console.log("plugininfo 1",pluginId)
        doFetchUrl("/be/api/plugins/"+pluginId);
    }, [pluginId]);
    console.log("plugininfo 2", pluginId, data)
    return data;
}