import React, { useState } from "react";
import Button from "../../components/basic/Button";
import { RotatingLines } from "react-loader-spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarO } from "@fortawesome/free-regular-svg-icons";
import { faChevronRight, faStar as faStarS } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { useSiteL10n } from "../../hooks/useSiteL10n";

export const PluginsTable = ({ plugins, setSelectedPlugin}) => {
  const siteL10n = useSiteL10n();
  const [starHoverIndex, setStarHoverIndex] = useState(null);
  console.log("plugins 1", plugins)
  const toggleFavorite = () => null;
  const numPlugins = plugins?.length || 0;

  for (var i=0; i<numPlugins; i++) {
    const pluginTemp = {...plugins[i]};
    plugins[i]["options"] =  <div>
      <Button onClick={() => toggleFavorite(pluginTemp.plugin_id)} isPrimary className="mx-2 mt-2">Favorite</Button>
      <Button onClick={() => setSelectedPlugin(pluginTemp)} isPrimary className="mx-2 mt-2">Play</Button>
    </div>
  }

  const trClass = "relative m-2 h-full w-full flex items-center text-white no-underline select-none"

  return (
    <div className="w-full" style={{minHeight: "600px"}}>
      <div className="text-center text-white text-2xl mb-2">Public Plugins</div>
        <div className="w-full">
          {plugins == null ?      
            <div className="flex justify-center">
              <RotatingLines
                height={100}
                width={100}
                strokeColor="white"/>
            </div> 
            :
            <table className="w-full">
            {plugins?.map((plugin, pluginIndex) => {
              return(
                <tr className={trClass} onClick={() => setSelectedPlugin(plugin)}>
                  <div className={"absolute rounded-lg w-full h-full opacity-50  hover:bg-gray-600 " + ((pluginIndex % 2 === 0) ? " bg-gray-800" : " bg-gray-900")}></div>
                  <div className="relative m-4">
                    <div className="text-xl inline">{plugin.name}</div>
                    <a 
                      className={"text-white text-lg pl-2"} 
                      target="_blank">
                      <FontAwesomeIcon 
                        className="cursor-pointer"
                        icon={starHoverIndex === pluginIndex ? faStarS : faStarO}
                        onMouseEnter={() => {setStarHoverIndex(pluginIndex)}}
                        onMouseLeave={() => {setStarHoverIndex(null)}}/>
                    </a>
                    <div className="inline">({plugin.num_favorites})</div>
                    <div className="text-xs">{siteL10n("Last update:") + " " + moment.utc(plugin.updated_at).local().format("YYYY-MM-DD HH:mm:ss")}</div>
                    <div className="text-xs">{siteL10n("Author:") + " " + plugin.author_alias}</div>
                  </div>
                  <div className="absolute right-0 flex items-center p-4">
                    <a className="text-white" target="_blank" onClick={() => {}}>
                      <FontAwesomeIcon size="2x" icon={faChevronRight}/>
                    </a>
                  </div>
                </tr>
              )
            })}
            </table>
          }
          <div>
        </div>
      </div>
    </div>
  );
};
export default PluginsTable;
