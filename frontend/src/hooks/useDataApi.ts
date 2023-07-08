import { useState, useEffect } from "react";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

async function axiosRetry(
  url: string,
  options: AxiosRequestConfig,
  retries: number,
  delay: number
): Promise<AxiosResponse> {
  try {
    console.log("pluginTrace axiosRetry try 1", url)
    const an_axios = axios.create({
      timeout: 8000, 
    });
    const result = await an_axios(url, options);

    console.log("pluginTrace axiosRetry try 2", url, result)
    return result;
  } catch (error) {
    console.log("pluginTrace axiosRetry catch 1", url, error)
    if (retries > 0) {
      // Wait for the specified delay before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
      console.log("pluginTrace axiosRetry catch 2", url)
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
        const retries = 4;
        const initialDelay = 1000; 
        console.log("pluginTrace useDataApi 1", url)
        const result = await axiosRetry(url, {}, retries, initialDelay);
        console.log("pluginTrace useDataApi 2", result)
        //const result = await axios(url, {timeout: 2000});
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
