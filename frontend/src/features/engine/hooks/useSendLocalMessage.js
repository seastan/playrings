import { useDispatch } from 'react-redux';
import { setAlert } from '../../store/playerUiSlice';


export const useSendLocalMessage = () => {
    const dispatch = useDispatch();
    return (message) => {
        dispatch(setAlert({
            "timestamp": Date.now(),
            "text": message,
            "level": "info"
        }))
    }
}
