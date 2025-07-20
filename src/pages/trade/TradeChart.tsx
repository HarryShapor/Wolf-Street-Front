import React from "react";
import Card from "../../components/ui/Card";
import CandlestickChart from "../../components/ui/CandlestickChart";

interface TradeChartProps {
  data: any[];
}

const TradeChart: React.FC<TradeChartProps> = ({
  data,
}) => (
  <Card
    className="p-0 flex flex-col bg-transparent rounded-2xl h-full"
    disableHover={true}
  >
    <div
      className="flex-1 w-full h-full overflow-hidden"
      style={{
        width: "100%",
        height: "100%",
        margin: 0,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {(!data || data.length === 0) ? (
        <div className="text-lg text-light-fg/70 dark:text-dark-fg/70 font-semibold">
          Нет данных для выбранного инструмента/интервала
        </div>
      ) : (
        <CandlestickChart data={data} />
      )}
    </div>
  </Card>
);

export default TradeChart;
