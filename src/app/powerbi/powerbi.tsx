'use client'
import React, { useState, useEffect } from 'react';
import { models, Report, Embed, service } from 'powerbi-client';
import { IHttpPostMessageResponse } from 'http-post-message';
import { PowerBIEmbed } from 'powerbi-client-react';
import 'powerbi-report-authoring';

export function PowerBi({ entraToken, embedURL }: any) {

   const [report, setReport] = useState<Report>();
   const [displayMessage, setMessage] = useState('');
   const [isFilterPaneVisibleAndExpanded, setIsFilterPaneVisibleAndExpanded] = useState<boolean>(false);
   const [isZoomedOut, setIsZoomedOut] = useState<boolean>(false);
   const [isDataSelectedEvent, setIsDataSelectedEvent] = useState<boolean>(false);
   const [dataSelectedEventDetails, setDataSelectedEventDetails] = useState<any>(null);

   // Constants for zoom levels
   const zoomOutLevel = 0.5;
   const zoomInLevel = 0.9;

   /**
    * Map of event handlers to be applied to the embedded report
    */
   const [eventHandlersMap, setEventHandlersMap] = useState<Map<string, (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null>>(new Map([
      ['loaded', () => console.log('Report has loaded')],
      ['rendered', () => console.log('Report has rendered')],
      ['error', (event?: service.ICustomEvent<any>) => {
         if (event) {
            console.error(event.detail);
         }
      }],
      ['visualClicked', () => console.log('visual clicked')],
      ['pageChanged', (event) => console.log(event)],
   ]));

   useEffect(() => {
      if (report) {
         report.setComponentTitle('Embedded Report');
      }
   }, [report]);

   /**
    * Set display message and log it in the console
    */
   const setDisplayMessageAndConsole = (message: string): void => {
      setMessage(message);
      console.log(message);
   }

   /**
    * Toggle Filter Pane
    */
   const toggleFilterPane = async (): Promise<IHttpPostMessageResponse<void> | undefined> => {
      if (!report) {
         setDisplayMessageAndConsole('Report not available');
         return;
      }

      const filterPaneVisibleAndExpanded = !isFilterPaneVisibleAndExpanded;
      setIsFilterPaneVisibleAndExpanded(filterPaneVisibleAndExpanded);

      // Update the settings to show/hide the filter pane
      const settings = {
         panes: {
            filters: {
               expanded: filterPaneVisibleAndExpanded,
               visible: filterPaneVisibleAndExpanded,
            },
         },
      };

      try {
         const response: IHttpPostMessageResponse<void> = await report.updateSettings(settings);
         setDisplayMessageAndConsole(filterPaneVisibleAndExpanded ? 'Filter pane is visible.' : 'Filter pane is hidden.');
         return response;
      } catch (error) {
         console.error(error);
         return;
      }
   };

   /**
    * Set data selected event
    */
   const setDataSelectedEvent = () => {
      const dataSelectedEvent = !isDataSelectedEvent;
      setIsDataSelectedEvent(dataSelectedEvent);

      if (dataSelectedEvent) {
         // Adding dataSelected event in eventHandlersMap
         setEventHandlersMap(new Map<string, (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null>([
            ...eventHandlersMap,
            ['dataSelected', (event) => {
               if (event?.detail.dataPoints.length) {
                  setDataSelectedEventDetails(event.detail);
                  setDisplayMessageAndConsole(`Data selected: ${JSON.stringify(event.detail.dataPoints[0])}`);
               }
            }],
         ]));

         setMessage('Data Selected event has been successfully set. Click on a data point to see the details.');
      } else {
         eventHandlersMap.delete('dataSelected');
         report?.off('dataSelected');
         setMessage('Data Selected event has been successfully unset.')
      }
   }

   /**
    * Toggle zoom
    */
   const toggleZoom = async (): Promise<void> => {
      if (!report) {
         setDisplayMessageAndConsole('Report not available');
         return;
      }

      try {
         const newZoomLevel: number = isZoomedOut ? zoomInLevel : zoomOutLevel;
         await report.setZoom(newZoomLevel);
         setIsZoomedOut(!isZoomedOut);
         setDisplayMessageAndConsole(`Zoom level set to ${newZoomLevel * 100}%`);
      } catch (errors) {
         console.log(errors);
         setDisplayMessageAndConsole('Failed to change zoom level.');
      }
   }

   /**
    * Refresh report event
    */
   const refreshReport = async (): Promise<void> => {
      if (!report) {
         setDisplayMessageAndConsole('Report not available');
         return;
      }

      try {
         await report.refresh();
         setDisplayMessageAndConsole('The report has been refreshed successfully.');
      } catch (error: any) {
         setDisplayMessageAndConsole(error.detailedMessage || 'Failed to refresh report.');
      }
   }

   /**
    * Full screen event
    */
   const enableFullScreen = (): void => {
      if (!report) {
         setDisplayMessageAndConsole('Report not available');
         return;
      }

      report.fullscreen();
      setDisplayMessageAndConsole('Report opened in full screen mode.');
   }

   return (
      <div className="flex flex-col h-full">
         {/* Control Buttons */}
         <div className="flex flex-wrap gap-2 p-2 bg-bgLight rounded-t-md">
            <button
               onClick={toggleFilterPane}
               className="py-1 px-3 rounded-md text-textColor font-bold border border-accent bg-bgDark hover:bg-bgLight"
            >
               {isFilterPaneVisibleAndExpanded ? "Hide Filter Pane" : "Show Filter Pane"}
            </button>

            <button
               onClick={setDataSelectedEvent}
               className="py-1 px-3 rounded-md text-textColor font-bold border border-accent bg-bgDark hover:bg-bgLight"
            >
               {isDataSelectedEvent ? "Disable Data Selection" : "Enable Data Selection"}
            </button>

            <button
               onClick={toggleZoom}
               className="py-1 px-3 rounded-md text-textColor font-bold border border-accent bg-bgDark hover:bg-bgLight"
            >
               {isZoomedOut ? "Zoom In" : "Zoom Out"}
            </button>

            <button
               onClick={refreshReport}
               className="py-1 px-3 rounded-md text-textColor font-bold border border-accent bg-bgDark hover:bg-bgLight"
            >
               Refresh Report
            </button>

            <button
               onClick={enableFullScreen}
               className="py-1 px-3 rounded-md text-textColor font-bold border border-accent bg-bgDark hover:bg-bgLight"
            >
               Full Screen
            </button>
         </div>

         {/* Data Selected Details */}
         {dataSelectedEventDetails && (
            <div className="px-4 py-2 bg-bgDark text-textColor text-xs border-t border-foreground">
               <strong>Selected Data:</strong> {JSON.stringify(dataSelectedEventDetails, null, 2)}
            </div>
         )}

         {/* PowerBI Report */}
         <div className="flex-1">
            <PowerBIEmbed
               embedConfig={{
                  type: 'report',
                  embedUrl: embedURL,
                  accessToken: entraToken,
                  tokenType: models.TokenType.Embed,
                  settings: {
                     panes: {
                        filters: {
                           expanded: isFilterPaneVisibleAndExpanded,
                           visible: isFilterPaneVisibleAndExpanded
                        }
                     },
                     background: models.BackgroundType.Transparent,
                  }
               }}

               eventHandlers={eventHandlersMap}

               cssClassName={"reportClass h-full"}

               getEmbeddedComponent={(embedObject: Embed) => {
                  console.log(`Embedded object of type "${embedObject.embedtype}" received`);
                  setReport(embedObject as Report);
               }}
            />
         </div>
      </div>
   );
};