/**
 * @fileoverview React component to display historical stock data using Lightweight Charts
 * @author Incremental Capitalist
 */

import React, { useState, useEffect, useRef } from 'react';
import { createChart, IChartApi, Time } from 'lightweight-charts';

/**
 * Interface for individual stock data points
 * @interface StockData
 * @property {number} t - The timestamp of the data point in milliseconds
 * @property {number} o - The opening price
 * @property {number} h - The highest price
 * @property {number} l - The lowest price
 * @property {number} c - The closing price
 * @property {number} v - The trading volume
 */
interface StockData {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

/**
 * Main App component for displaying stock data chart
 * @returns {JSX.Element} The rendered App component
 */
const App: React.FC = () => {
  // State to store the fetched stock data
  const [data, setData] = useState<StockData[]>([]);
  // State to manage loading status
  const [loading, setLoading] = useState<boolean>(true);
  // State to store any error messages
  const [error, setError] = useState<string | null>(null);
  // State to store the current stock symbol
  const [symbol, setSymbol] = useState<string>('AAPL');
  // State to keep track of the current page number for pagination
  const [page, setPage] = useState<number>(1);
  // State to indicate if there are more pages of data to load
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Ref for the chart container DOM element
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Ref to store the chart instance
  const chartRef = useRef<IChartApi | null>(null);

  /**
   * Fetches stock data from the API
   * @param {number} pageNum - The page number to fetch
   * @param {boolean} append - Whether to append the new data or replace existing data
   */
  const fetchData = async (pageNum: number, append: boolean = false) => {
    try {
      // Set loading state to true before fetching data
      setLoading(true);
      // Replace this with actual API call when backend is set up
      const response = { data: [] as StockData[], hasMore: false }; // Placeholder
      
      // Update data state based on append flag
      if (append) {
        setData(prevData => [...prevData, ...response.data]);
      } else {
        setData(response.data);
      }
      
      // Update other states based on API response
      setHasMore(response.hasMore);
      setPage(pageNum);
      setLoading(false);
    } catch (err) {
      // Set error state if API call fails
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  // Effect to fetch initial data on component mount or when symbol changes
  useEffect(() => {
    fetchData(1);
  }, [symbol]);

  // Effect to create and update chart when data changes
  useEffect(() => {
    // Check if chart container exists and data is available
    if (chartContainerRef.current && data.length > 0) {
      // Create new chart if it doesn't exist
      if (!chartRef.current) {
        chartRef.current = createChart(chartContainerRef.current, {
          width: 600,
          height: 300,
        });
      }

      // Add candlestick series to the chart
      const candlestickSeries = chartRef.current.addCandlestickSeries();
      // Set data for the candlestick series
      candlestickSeries.setData(data.map(d => ({
        time: new Date(d.t).getTime() / 1000 as Time,
        open: d.o,
        high: d.h,
        low: d.l,
        close: d.c,
      })));
    }

    // Cleanup function to remove chart when component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data]);

  /**
   * Handles changes in the symbol input field
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event
   */
  const handleSymbolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSymbol(event.target.value.toUpperCase());
  };

  /**
   * Handles form submission to fetch data for a new symbol
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchData(1);
  };

  /**
   * Loads more data when the "Load More" button is clicked
   */
  const loadMore = () => {
    if (hasMore) {
      fetchData(page + 1, true);
    }
  };

  // Render error message if there's an error
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Stock Data</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={symbol}
          onChange={handleSymbolChange}
          placeholder="Enter stock symbol"
        />
        <button type="submit">Fetch Data</button>
      </form>
      <div ref={chartContainerRef} />
      {loading && <div>Loading...</div>}
      {hasMore && !loading && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
};

export default App;