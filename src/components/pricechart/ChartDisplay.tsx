import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "../../styles/components/general.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
  ScriptableContext,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

interface ChartDisplayProps {
  chartData: { time: number; price: number }[];
  upperBound: number;
  lowerBound: number;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({
  chartData,
  upperBound,
  lowerBound,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getFilteredData = () => {
    if (!isMobile || chartData.length <= 10) return chartData;

    const step = Math.ceil(chartData.length / 8);
    return chartData.filter(
      (_, index) => index % step === 0 || index === chartData.length - 1
    );
  };

  const filteredData = getFilteredData();
  const highestPrice = Math.max(...filteredData.map((d) => d.price));
  const lowestPrice = Math.min(...filteredData.map((d) => d.price));

  const generatePriceLabels = () => {
    const labelCount = isMobile ? 5 : 7;
    const step = (highestPrice - lowestPrice) / (labelCount - 1);
    const labels = [];

    for (let i = 0; i < labelCount; i++) {
      const price = highestPrice - step * i;
      labels.push(price);
    }

    return labels;
  };

  const priceLabels = generatePriceLabels();

  const formatPrice = (price: number) => {
    if (isMobile) {
      return price >= 1000
        ? `€${(price / 1000).toFixed(0)}k`
        : `€${price.toFixed(0)}`;
    }
    return `€${price.toLocaleString("de-DE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const data = {
    labels: filteredData.map(() => ""),
    datasets: [
      {
        label: "BTC Price",
        data: filteredData.map((point) => point.price),
        borderColor: "#14b8a6",
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(20, 184, 166, 0.3)");
          gradient.addColorStop(1, "rgba(20, 184, 166, 0.05)");
          return gradient;
        },
        borderWidth: isMobile ? 2 : 3,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: isMobile ? 4 : 6,
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: "#14b8a6",
        pointHoverBackgroundColor: "#ffffff",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#f3f4f6",
        bodyColor: "#f3f4f6",
        borderColor: "#14b8a6",
        borderWidth: 1,
        cornerRadius: 8,
        padding: isMobile ? 8 : 12,
        titleFont: {
          size: isMobile ? 12 : 14,
        },
        bodyFont: {
          size: isMobile ? 12 : 14,
        },
        displayColors: false,
        callbacks: {
          title: (context: TooltipItem<"line">[]) => {
            if (context && context[0] && filteredData[context[0].dataIndex]) {
              const date = new Date(filteredData[context[0].dataIndex].time);
              return date.toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            }
            return "";
          },
          label: (context: TooltipItem<"line">) => {
            const value = context.raw as number;
            return `€${value.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        suggestedMin: lowerBound,
        suggestedMax: upperBound,
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: isMobile ? 4 : 6,
      },
    },
  } as const;

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <Line data={data} options={options} />

        <div className="price-labels">
          {priceLabels.map((price, index) => (
            <div
              key={index}
              className={
                index === 0 ? "price-label-current" : "price-label-prev"
              }
            >
              {formatPrice(price)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartDisplay;
