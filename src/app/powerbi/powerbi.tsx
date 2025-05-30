'use client'
import React, { useState, useEffect } from 'react';
import { models, Report, Embed, service } from 'powerbi-client';
import { PowerBIEmbed } from 'powerbi-client-react';
import 'powerbi-report-authoring';

export function PowerBi({ entraToken, embedURL }: any) {

   const [report, setReport] = useState<Report>();

   useEffect(() => {
      if (report) {
         report.setComponentTitle('Embedded Report');
      }
   }, [report]);

   return (
      <PowerBIEmbed
         embedConfig={{
            type: 'report',   // Supported types: report, dashboard, tile, visual, qna, paginated report and create
            // id: '<Report Id>',
            embedUrl: embedURL,
            accessToken: entraToken,
            tokenType: models.TokenType.Embed, // Use models.TokenType.Aad for SaaS embed
            settings: {
               panes: {
                  filters: {
                     expanded: false,
                     visible: false
                  }
               },
               background: models.BackgroundType.Transparent,
            }
         }}

         eventHandlers={
            new Map([
               ['loaded', function () { console.log('Report loaded'); }],
               ['rendered', function () { console.log('Report rendered'); }],
               ['error', function (event) { console.log(event?.detail); }],
               ['visualClicked', () => console.log('visual clicked')],
               ['pageChanged', (event) => console.log(event)],
            ])
         }

         cssClassName={"reportClass"}

         getEmbeddedComponent={(embedObject: Embed) => {
            console.log(`Embedded object of type "${embedObject.embedtype}" received`);
            setReport(embedObject as Report);
         }}
      />
   );
};