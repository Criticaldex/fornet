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
import { useSession } from 'next-auth/react'
import { getCandleLastValue, getMappedCandleValues } from '@/services/liveValues'

if (typeof Highcharts === "object") {
    HighchartsExporting(Highcharts)
    HighchartsExportData(Highcharts)
    HighchartsData(Highcharts)
    HighchartsPriceIndicator(Highcharts)
    HighchartsAccessibility(Highcharts)
}

export function CandleChart({ i, line, name, unit, interval }: any) {
    const { data: session } = useSession();
    const currentCandleRef = useRef<any>(null);
    const [initialData, setInitialData] = useState<any[]>([]);
    const lastTimestampRef = useRef<number>(0);
    const [isReady, setIsReady] = useState(false);
    const chartRef = useRef<any>(null);

    const numVelas = 30;
    const candleDuration = ((interval * 60 * 60 * 1000) / numVelas);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getMappedCandleValues({ line: line, name: name, interval: interval }, session?.user.db);

                setInitialData(data);

                if (data.length > 0) {
                    const lastCandle = data[data.length - 1];
                    currentCandleRef.current = {
                        open: lastCandle[1],
                        high: lastCandle[2],
                        low: lastCandle[3],
                        close: lastCandle[4],
                        timestamp: lastCandle[0],
                    };
                    lastTimestampRef.current = lastCandle[0];
                    setIsReady(true);
                }
            } catch (error) {
                console.error('Error fetching candle data:', error);
            }
        };
        fetchData();
    }, [line, name, interval]);

    const updateCandleData = async (series: any) => {
        try {
            if (!series || !series.data) return;

            const currentTime = Date.now();
            const alignedCandleStart = Math.floor(currentTime / candleDuration) * candleDuration;

            const lastValue: any = await getCandleLastValue({ line: line, name: name }, session?.user.db)
            if (!lastValue || !Array.isArray(lastValue)) return;

            const newValue = lastValue[0][1];

            // Is it necessary to create a  candle?
            if (!currentCandleRef.current || currentCandleRef.current.timestamp < alignedCandleStart) {
                if (currentCandleRef.current) {
                    series.addPoint([
                        currentCandleRef.current.timestamp,
                        currentCandleRef.current.open,
                        currentCandleRef.current.high,
                        currentCandleRef.current.low,
                        currentCandleRef.current.close,
                    ], true);
                }

                currentCandleRef.current = {
                    open: newValue,
                    high: newValue,
                    low: newValue,
                    close: newValue,
                    timestamp: alignedCandleStart,
                };
                lastTimestampRef.current = alignedCandleStart;

                series.addPoint(
                    [alignedCandleStart, newValue, newValue, newValue, newValue],
                    true, // redraw
                    true  // shift: elimina la primera vela automáticamente
                );
            } else {
                // Actualiza vela actual
                currentCandleRef.current = {
                    ...currentCandleRef.current,
                    high: Math.max(currentCandleRef.current.high, newValue),
                    low: Math.min(currentCandleRef.current.low, newValue),
                    close: newValue,
                };

                const lastPoint = series.data[series.data.length - 1];
                if (lastPoint && lastPoint.update) {
                    lastPoint.update({
                        high: currentCandleRef.current.high,
                        low: currentCandleRef.current.low,
                        close: currentCandleRef.current.close,
                    }, true);
                }
            }
        } catch (error) {
            console.error('Error en updateCandleData: ', error);
        }
    };

    useEffect(() => {
        const series = chartRef.current?.chart?.series?.[0];
        if (!isReady && !series) return;

        const intervalId = setInterval(() => {
            updateCandleData(series);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isReady]);

    const options = {
        ...chartOptions,
        title: { text: '' },
        chart: {
            marginLeft: 30,
            marginRight: 30,
        },
        xAxis: {
            type: 'datetime',
            gridLineWidth: 2,
            tickInterval: candleDuration,
        },
        legend: { enabled: false },
        yAxis: {
            labels: {
                align: 'left',
                x: -10,
                overflow: 'justify',
            },
            opposite: false,
        },
        rangeSelector: { enabled: false },
        navigator: { enabled: false },
        scrollbar: { enabled: false },
        exporting: { enabled: true },
        credits: { enabled: false },
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
            <HighchartsReact
                highcharts={Highcharts}
                constructorType={'stockChart'}
                options={options}
                ref={chartRef}
            />
        </div>
    );
}
