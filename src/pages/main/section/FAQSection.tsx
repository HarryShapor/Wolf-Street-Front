import AccordionItem from "../../../components/ui/AccordionItem";
import SectionContainer from "../../../components/ui/SectionContainer";
import { FaShieldAlt, FaCreditCard, FaChartLine, FaKey } from "react-icons/fa";

export default function FAQSection() {
  const faqItems = [
    {
      question: "Насколько безопасны мои средства?",
      answer:
        "95% активов в холодном хранении, шифрование AES-256, двухфакторная аутентификация. За 3 года — ноль взломов.",
      icon: <FaShieldAlt className="text-green-500" />,
    },
    {
      question: "Какие способы пополнения и вывода?",
      answer:
        "Банковские карты, SWIFT переводы, криптовалюты (BTC, ETH, USDT). Минимум: пополнение $10, вывод $20.",
      icon: <FaCreditCard className="text-blue-500" />,
    },
    {
      question: "Какие инструменты для торговли?",
      answer:
        "300+ торговых пар, спот-торговля, фьючерсы с плечом до 1:100, маржинальная торговля и опционы.",
      icon: <FaChartLine className="text-purple-500" />,
    },
    {
      question: "Не могу войти в аккаунт, что делать?",
      answer:
        "Проверьте email/пароль, используйте 'Восстановить пароль'. При блокировке 2FA — обратитесь в поддержку.",
      icon: <FaKey className="text-orange-500" />,
    },
  ];

  return (
    <SectionContainer id="faq" maxWidth={800}>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-light-accent dark:text-dark-accent mb-4 tracking-wide">
          Часто задаваемые вопросы
        </h2>
        <p className="text-light-fg/70 dark:text-dark-fg/70 text-lg max-w-2xl mx-auto">
          Ответы на популярные вопросы о торговле и безопасности
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {faqItems.map((item, idx) => (
          <AccordionItem
            key={idx}
            title={item.question}
            text={item.answer}
            icon={item.icon}
          />
        ))}
      </div>
    </SectionContainer>
  );
}
