import InstrumentCard from "./InstrumentCard";
import { useInstrumentsProfitability } from '../../hooks/useInstrumentProfitability';
import type { Instrument } from '../../hooks/useInstruments';

interface InstrumentsListProps {
  instruments: Instrument[];
  cardsVisible: number;
  images: Record<number, string>;
  loadingImages: boolean;
  prices: Record<number, number | null>;
}

export default function InstrumentsList({ instruments, cardsVisible, images, loadingImages, prices }: InstrumentsListProps) {
  // Получаем доходность для всех инструментов (1d)
  const instrumentIds = instruments.map(inst => inst.instrumentId);
  const { data: profitability, loading: loadingProfit } = useInstrumentsProfitability(instrumentIds, '1d');

  if (instruments.length === 0) {
    return <div className="col-span-2 text-center text-lg opacity-60 py-12">Ничего не найдено</div>;
  }
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {instruments.map((item, i) => (
        <div className="flex flex-col h-full" key={item.instrumentId}>
          <InstrumentCard
            title={item.title}
            ticker={item.ticker}
            icon={images[item.instrumentId]}
            price={prices[item.instrumentId]}
            visible={i < cardsVisible}
            index={i}
            fullHeight
            loadingIcon={loadingImages}
            profitability={profitability && profitability[item.instrumentId] !== undefined ? Number(profitability[item.instrumentId]) : null}
            loadingProfit={loadingProfit}
          />
        </div>
      ))}
    </div>
  );
} 