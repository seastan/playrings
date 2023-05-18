import { useState, useEffect } from "react";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

async function axiosRetry(
  url: string,
  options: AxiosRequestConfig,
  retries: number,
  delay: number
): Promise<AxiosResponse> {
  try {
    const result = await axios(url, options);
    return result;
  } catch (error) {
    if (retries > 0) {
      // Wait for the specified delay before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry with an increased delay
      return axiosRetry(url, options, retries - 1, delay * 2);
    } else {
      // If retries are exhausted, throw the error
      throw error;
    }
  }
}


const useDataApi = <T extends any>(initialUrl: string, initialData: T) => {
  const [data, setData] = useState(initialData);
  const [url, setUrl] = useState(initialUrl); // Mechanism to refetch by changing url
  const [hash, setHash] = useState<any>(null); // Mechanism to refrech same url, by changing hash
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const retries = 3;
        const initialDelay = 1000; // 1 second    
        const result = await axiosRetry(url, {}, retries, initialDelay);
    
        //const result = await axios(url, {timeout: 10000});
        setData(result.data);
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [url, hash]);
  return {
    data,
    isLoading,
    isError,
    doFetchUrl: setUrl,
    doFetchHash: setHash,
    setData, // Override what was fetched by the API (For example, websocket updates)
  };
};

export default useDataApi;
