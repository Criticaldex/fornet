'use client'
import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import HighchartsPriceIndicator from 'highcharts/modules/price-indicator'
import HighchartsAccessibility from 'highcharts/modules/accessibility'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsData from 'highcharts/modules/data'
import { useRef, useState, useEffect } from 'react'
import { chartOptions } from '@/components/chart.components'
import { getMappedCandleValues } from '@/services/values'
import { useSession } from 'next-auth/react'

if (typeof Highcharts === "object") {
    HighchartsExporting(Highcharts)
    HighchartsExportData(Highcharts)
    HighchartsData(Highcharts)
    HighchartsPriceIndicator(Highcharts)
    HighchartsAccessibility(Highcharts)
}

export function CandleChart({ i, line, name, unit, interval }: any) {
    const { data: session } = useSession();
    const [initialData, setInitialData] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setInitialData(await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${line}/${name}/${interval}/candle`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-type': 'application/json',
                            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
                        },
                    }
                ).then(res => res.json()));
            } catch (error) {
                console.error('Error fetching candle data:', error);
            }
        };

        fetchData();
    }, [line, name, interval, session]);

    // const fetchLastValue = async (line: string, name: string) => {
    //     const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${line}/${name}/lastValue`;
    //     try {
    //         const response = await fetch(apiUrl);
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         const data = await response.json();
    //         if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
    //             return data[0][1];
    //         }
    //         throw new Error('Formato de datos no reconocido');
    //     } catch (error) {
    //         console.error('Error en fetchLastValue:', error);
    //         return null;
    //     }
    // };

    // const updateCandleData = async (series: any, timestamp: number, line: string, name: string) => {
    //     try {
    //         if (!series || !series.data) return;

    //         const now = Date.now();
    //         const candleStart = Math.floor(now / candleDuration) * candleDuration;

    //         // Alinear a intervalos de XX:00 o XX:30
    //         const minutes = new Date(candleStart).getMinutes();
    //         const alignedCandleStart =
    //             minutes >= 30
    //                 ? candleStart - (minutes - 30) * 60 * 1000
    //                 : candleStart - minutes * 60 * 1000;

    //         const shouldCreateNewCandle =
    //             !currentCandleRef.current || currentCandleRef.current.timestamp < alignedCandleStart;

    //         const apiValue = await fetchLastValue(line, name);
    //         if (apiValue === null) return;

    //         if (shouldCreateNewCandle) {
    //             if (currentCandleRef.current) {
    //                 series.addPoint(
    //                     [
    //                         currentCandleRef.current.timestamp,
    //                         currentCandleRef.current.open,
    //                         currentCandleRef.current.high,
    //                         currentCandleRef.current.low,
    //                         currentCandleRef.current.close,
    //                     ],
    //                     true,
    //                     series.data.length > 100 // Eliminar puntos antiguos si hay más de 100
    //                 );
    //             }

    //             const lastClose = currentCandleRef.current?.close ?? apiValue;

    //             currentCandleRef.current = {
    //                 open: lastClose,
    //                 high: apiValue,
    //                 low: apiValue,
    //                 close: apiValue,
    //                 timestamp: alignedCandleStart,
    //             };
    //             lastTimestampRef.current = alignedCandleStart;

    //             series.addPoint(
    //                 [alignedCandleStart, lastClose, apiValue, apiValue, apiValue],
    //                 true,
    //                 series.data.length > 100
    //             );
    //         } else {
    //             const newPrice = apiValue;

    //             currentCandleRef.current = {
    //                 open: currentCandleRef.current.open,
    //                 high: Math.max(currentCandleRef.current.high, newPrice),
    //                 low: Math.min(currentCandleRef.current.low, newPrice),
    //                 close: newPrice,
    //                 timestamp: currentCandleRef.current.timestamp,
    //             };

    //             setLastPrice(newPrice);

    //             const lastPoint = series.data[series.data.length - 1];
    //             if (lastPoint && lastPoint.update) {
    //                 lastPoint.update(
    //                     {
    //                         high: currentCandleRef.current.high,
    //                         low: currentCandleRef.current.low,
    //                         close: currentCandleRef.current.close,
    //                     },
    //                     true
    //                 );
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error en updateCandleData:', error);
    //     }
    // };

    const options = {
        ...chartOptions,
        title: { text: '' },
        chart: {
            marginLeft: 30,
            marginRight: 30,
            events: {
                // load: function (this: any) {
                //     const chart = this;
                //     const series = chart.series[0];
                //     if (series && series.data.length > 0) {
                //         const lastPoint = series.data[series.data.length - 1];
                //         currentCandleRef.current = {
                //             open: lastPoint.open,
                //             high: lastPoint.high,
                //             low: lastPoint.low,
                //             close: lastPoint.close,
                //             timestamp: lastPoint.x,
                //         };
                //         setLastPrice(lastPoint.close);
                //         lastTimestampRef.current = lastPoint.x;
                //     }

                //     const intervalId = setInterval(() => {
                //         updateCandleData(series, Date.now(), line, name);
                //     }, 1000);

                //     chart.intervalId = intervalId;
                // },
                // destroy: function (this: any) {
                //     if (this.intervalId) {
                //         clearInterval(this.intervalId);
                //     }
                // },
            },
        },
        xAxis: {
            type: 'datetime',
            gridLineWidth: 2,
            // tickInterval: candleDuration, // Ticks cada 30 minutos
        },
        legend: {
            enabled: false,
        },
        yAxis: {
            labels: {
                align: 'left',
                x: -10,
                overflow: 'justify',
            },
            opposite: false,
        },
        rangeSelector: {
            enabled: false,
        },
        navigator: {
            enabled: false,
        },
        exporting: {
            enabled: true,
        },
        credits: {
            enabled: false,
        },
        tooltip: {
            backgroundColor: '#f76f20',
            borderColor: '#ff9900',
            borderRadius: 8,
            style: {
                color: 'white',
                fontWeight: 'bold',
            },
            positioner: function (labelWidth: number, labelHeight: number, point: any) {
                return {
                    x: point.plotX + 20,
                    y: point.plotY - labelHeight - 10,
                };
            },
        },
        plotOptions: {
            candlestick: {
                dataGrouping: { enabled: false },
                lastPrice: {
                    enabled: true,
                    color: '#f76f20',
                    label: {
                        enabled: true,
                        align: 'left',
                        x: 20,
                        y: 10,
                        style: {
                            color: '#f76f20',
                            fontWeight: 'bold',
                        },
                        backgroundColor: '#f76f20',
                        borderColor: '#FF0000',
                        borderRadius: 3,
                        borderWidth: 1,
                        padding: 4,
                        // formatter: function (this: any) {
                        //     return Highcharts.numberFormat(lastPrice || 0, 2);
                        // },
                    },
                },
            },
        },
        series: [
            {
                type: 'candlestick',
                name: 'Value',
                color: '#FF7F7F',
                upColor: '#90EE90',
                data: initialData,
            },
        ],
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} constructorType={'stockChart'} options={options} />
        </div>
    );
}