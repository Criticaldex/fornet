'use client'
import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import HighchartsPriceIndicator from 'highcharts/modules/price-indicator'
import HighchartsAccessibility from 'highcharts/modules/accessibility'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsData from 'highcharts/modules/data'
import { useRef, useState } from 'react'
import { chartOptions } from '@/components/chart.components'
import { getMappedCandleValues } from '@/services/values'
import { useSession } from 'next-auth/react';

if (typeof Highcharts === "object") {
    HighchartsExporting(Highcharts)
    HighchartsExportData(Highcharts)
    HighchartsData(Highcharts)
    HighchartsPriceIndicator(Highcharts)
    HighchartsAccessibility(Highcharts)
}

export function CandleChart({ i, line, name, unit, interval }: any) {
    const candleDuration = 1 * 60 * 1000;
    const currentCandleRef = useRef<any>({
        open: 100,
        high: 100,
        low: 100,
        close: 100,
        timestamp: Date.now()
    });
    const lastTimestampRef = useRef<number>(0);
    const [lastPrice, setLastPrice] = useState(100);
    const [initialData] = useState([
        [Date.now() - 300000, 100, 102, 99, 101],
        [Date.now() - 240000, 101, 103, 100, 102],
        [Date.now() - 180000, 102, 104, 101, 103],
        [Date.now() - 120000, 103, 105, 102, 104],
        [Date.now() - 60000, 104, 106, 103, 105]
    ]);
    const { data: session } = useSession();
    const initialData1 = getMappedCandleValues({ line, name, interval }, session?.user.db);
    // const { data: session } = useSession();
    // const allData = await getMappedCandleValues({ line: line, name: name, interval: interval }, session?.user.db);

    const updateCandleData = (series: any, timestamp: number) => {
        try {
            if (!series || !series.data) return;

            const now = timestamp || Date.now();
            const shouldCreateNewCandle = !lastTimestampRef.current ||
                now - lastTimestampRef.current >= candleDuration;

            if (shouldCreateNewCandle) {
                if (currentCandleRef.current) {
                    series.addPoint([
                        currentCandleRef.current.timestamp,
                        currentCandleRef.current.open,
                        currentCandleRef.current.high,
                        currentCandleRef.current.low,
                        currentCandleRef.current.close
                    ], true, false);
                }

                const lastClose = series.data.length > 0
                    ? series.data[series.data.length - 1].close
                    : 100;

                currentCandleRef.current = {
                    open: lastClose,
                    high: lastClose,
                    low: lastClose,
                    close: lastClose,
                    timestamp: now
                };
                lastTimestampRef.current = now;

                series.addPoint([
                    now,
                    lastClose,
                    lastClose,
                    lastClose,
                    lastClose
                ], true, false);
            } else {
                const newPrice = currentCandleRef.current.close + (Math.random() - 0.5) * 2;

                currentCandleRef.current = {
                    open: currentCandleRef.current.open,
                    high: Math.max(currentCandleRef.current.high, newPrice),
                    low: Math.min(currentCandleRef.current.low, newPrice),
                    close: newPrice,
                    timestamp: currentCandleRef.current.timestamp
                };

                setLastPrice(newPrice);

                const lastPoint = series.data[series.data.length - 1];
                if (lastPoint && lastPoint.update) {
                    lastPoint.update({
                        high: currentCandleRef.current.high,
                        low: currentCandleRef.current.low,
                        close: currentCandleRef.current.close
                    }, true);
                }
            }
        } catch (error) {
            console.error('Error en updateCandleData:', error);
        }
    };

    const options = {
        title: { text: '' },
        ...chartOptions,
        chart: {
            events: {
                load: function (this: any) {
                    const chart = this;
                    const series = chart.series[0];
                    if (series && series.data.length > 0) {
                        const lastPoint = series.data[series.data.length - 1];
                        currentCandleRef.current = {
                            open: lastPoint.open,
                            high: lastPoint.high,
                            low: lastPoint.low,
                            close: lastPoint.close,
                            timestamp: lastPoint.x
                        };
                        setLastPrice(lastPoint.close);
                        lastTimestampRef.current = lastPoint.x;
                    }

                    const intervalId = setInterval(() => {
                        updateCandleData(series, Date.now());
                    }, 1000);

                    chart.intervalId = intervalId;
                },
                destroy: function (this: any) {
                    if (this.intervalId) {
                        clearInterval(this.intervalId);
                    }
                }
            }
        },
        xAxis: {
            type: 'datetime',
            gridLineWidth: 2
        },
        legend: {
            enabled: false,
        },
        yAxis: {
            labels: {
                align: "left"
            },
            opposite: false
        },
        rangeSelector: {
            enabled: false
        },
        navigator: {
            enabled: false
        },
        exporting: {
            enabled: true
        },
        credits: {
            enabled: false
        },
        tooltip: {
            backgroundColor: '#f76f20',
            borderColor: '#ff9900',
            borderRadius: 8,
            style: {
                color: 'white',
                fontWeight: 'bold'
            }
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
                        x: 10,
                        y: 0,
                        style: {
                            color: '#f76f20',
                            fontWeight: 'bold'
                        },
                        backgroundColor: '#f76f20',
                        borderColor: '#FF0000',
                        borderRadius: 3,
                        borderWidth: 1,
                        padding: 4,
                        formatter: function (this: any) {
                            return Highcharts.numberFormat(lastPrice, 2);
                        }
                    }
                }
            }
        },
        series: [{
            type: 'candlestick',
            name: 'Value',
            color: '#FF7F7F',
            upColor: '#90EE90',
            data: initialData
        }]
    };

    return (
        <div className="m-2">
            <HighchartsReact
                highcharts={Highcharts}
                constructorType={'stockChart'}
                options={options}
            />
        </div>
    );
}
