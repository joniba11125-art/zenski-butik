import { HelpCircle } from "lucide-react";
import { Hero } from "@/components/shop/Hero";
import { FeaturedProducts } from "@/components/shop/FeaturedProducts";
import { Testimonials } from "@/components/shop/Testimonials";
import { PromoPopup } from "@/components/shop/PromoPopup";

function GoldDivider() {
  return (
    <div className="bg-[#fffaf0] px-4">
      <div className="mx-auto max-w-7xl">
        <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />
      </div>
    </div>
  );
}

function FAQSection() {
  const questions = [
    {
      question: "Kako funkcioniše rezervacija?",
      answer:
        "Odaberete proizvod i veličinu, pošaljete rezervaciju, a butik vas kontaktira za potvrdu narudžbe putem telefona ili emaila.",
    },
    {
      question: "Koliko košta dostava?",
      answer: "Dostava brzom poštom u BiH iznosi 11,00 KM.",
    },
    {
      question: "Koliko traje isporuka?",
      answer: "Isporuka traje 1-3 radna dana, zavisno od lokacije.",
    },
    {
      question: "Da li je dozvoljeno otvaranje paketa?",
      answer: "Da, dozvoljeno je otvaranje paketa pri dostavi.",
    },
    {
      question: "Da li radite povrat novca?",
      answer:
        "Povrate ne radimo. Zamjene su moguće u roku od 24h prema pravilima butika.",
    },
    {
      question: "Gdje se nalazi butik?",
      answer: "Butik se nalazi na adresi Irac, Rudarska 50, Tuzla.",
    },
  ];

  return (
    <section id="faq" className="bg-white px-4 py-10 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#061537] text-white">
            <HelpCircle className="h-5 w-5" />
          </div>

          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#b8912f]">
            FAQ
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
            Česta pitanja
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-600 md:text-base">
            Najvažnije informacije o rezervacijama, dostavi, zamjenama i lokaciji butika.
          </p>
        </div>

        <div className="grid gap-2.5 md:gap-4 md:grid-cols-2">
          {questions.map((item) => (
            <div
              key={item.question}
              className="rounded-2xl border border-neutral-200 bg-[#fffaf0] p-3.5 shadow-sm md:p-6"
            >
              <h3 className="text-sm font-semibold text-neutral-950 md:text-lg">
                {item.question}
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-neutral-600 md:text-sm md:leading-6">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      <GoldDivider />
      <FeaturedProducts />
      <GoldDivider />
      <Testimonials />
      <GoldDivider />
      <FAQSection />
      <PromoPopup />
    </main>
  );
}
