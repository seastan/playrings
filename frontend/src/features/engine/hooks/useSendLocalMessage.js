import { useSetMessages } from '../../../contexts/MessagesContext';


export const useSendLocalMessage = () => {
    const setMessages = useSetMessages();
    return (message) => {
        // Generate a random shortcode
        const shortcode = Math.random().toString(36).substring(2, 10);
        // Get timestamp in the format: "2023-07-27T21:27:12.660052Z"
        const now = new Date();
        const timestamp = now.toISOString();

        setMessages([{
            "game_update": null,
            "sent_by": -1,
            "shortcode": shortcode,
            "text": message,
            "when": timestamp
            }])
    }
}
