import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FaqAccordion } from './FaqAccordion'
import { HelpCircle, Anchor } from 'lucide-react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Perguntas Frequentes | Lancha em Cabo Frio',
  description: 'Tire suas dúvidas sobre o aluguel de lanchas em Cabo Frio. Como funciona a reserva, segurança, pagamento e muito mais.',
}

const FAQ_ITEMS = [
  {
    question: 'Como funciona a reserva?',
    answer:
      'A reserva é feita 100% online, de forma rápida e segura. Basta escolher a embarcação desejada, selecionar a data e o horário disponíveis, informar o número de pessoas e efetuar o pagamento. Após a confirmação você receberá todos os detalhes por e-mail, incluindo o local de embarque e as instruções para o dia do passeio.',
  },
  {
    question: 'Preciso ter habilitação para conduzir a lancha?',
    answer:
      'Depende da embarcação escolhida. As lanchas maiores são fornecidas com piloto experiente e habilitado incluído no preço — você aproveita o passeio sem precisar conduzir. Para embarcações menores e jet ski pode ser exigida habilitação náutica. As informações específicas de cada embarcação estão detalhadas na página do anúncio.',
  },
  {
    question: 'O que está incluído no preço?',
    answer:
      'O preço base inclui o aluguel da embarcação pelo período contratado, combustível, coletes salva-vidas, kit de segurança obrigatório e, conforme a embarcação, o piloto. Itens extras como bebidas, alimentos, equipamentos de mergulho e snorkel podem ser adicionados conforme disponibilidade do proprietário. Verifique o que está incluído em cada anúncio.',
  },
  {
    question: 'Posso cancelar minha reserva?',
    answer:
      'Sim. Cancelamentos realizados com mais de 48 horas de antecedência têm reembolso integral. Cancelamentos entre 24 e 48 horas têm reembolso de 50% do valor pago. Cancelamentos com menos de 24 horas de antecedência não são reembolsáveis. Em caso de mau tempo confirmado pela Marinha, a reserva é automaticamente remarcada ou reembolsada integralmente.',
  },
  {
    question: 'Quantas pessoas cabem na lancha?',
    answer:
      'A capacidade varia de acordo com a embarcação. Em geral, nossas lanchas comportam de 8 a 20 pessoas. A capacidade máxima de cada embarcação está indicada no respectivo anúncio e deve ser rigorosamente respeitada por questões de segurança e exigência da Marinha do Brasil.',
  },
  {
    question: 'É seguro? O barco tem colete salva-vidas?',
    answer:
      'Sim, a segurança é nossa prioridade. Todas as embarcações listadas na plataforma passam por vistoria periódica e possuem o kit de segurança completo exigido pela Marinha do Brasil, incluindo coletes salva-vidas em número suficiente para todos os passageiros, extintor de incêndio, sinalizadores e âncora. Nossos pilotos são habilitados e têm amplo conhecimento da região.',
  },
  {
    question: 'Qual o local de embarque?',
    answer:
      'O local de embarque varia conforme a embarcação. A maioria parte do Marina Cabo Frio ou do Píer Central, ambos de fácil acesso no centro da cidade. O endereço exato e as instruções de chegada são enviados por e-mail após a confirmação da reserva. Se tiver dúvidas, basta entrar em contato conosco pelo WhatsApp.',
  },
  {
    question: 'O que acontece em caso de mau tempo?',
    answer:
      'A segurança dos passageiros sempre vem em primeiro lugar. Caso a previsão meteorológica ou as condições do mar estejam inadequadas no dia do passeio, a saída pode ser cancelada ou adiada. Nesse caso, você tem a opção de reagendar sem custo adicional para uma data disponível ou receber o reembolso integral do valor pago.',
  },
  {
    question: 'Como funciona o pagamento?',
    answer:
      'Aceitamos pagamento via cartão de crédito (parcelamento em até 12x) e Pix. O pagamento é processado de forma segura na nossa plataforma. Uma parte pode ser cobrada como sinal no momento da reserva, e o saldo restante quitado antes do embarque, conforme a política de cada embarcação.',
  },
  {
    question: 'Posso levar animais de estimação?',
    answer:
      'Isso depende da política do proprietário de cada embarcação. Algumas lanchas aceitam pets de pequeno porte, desde que o animal seja sociável e o tutor responsável pelo comportamento. Ao finalizar sua reserva, verifique as regras no anúncio ou entre em contato conosco antes para confirmar.',
  },
]

export default function FaqPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f8fafc]">

        {/* Hero */}
        <div className="relative bg-[#0a2540] pt-32 pb-20 px-4 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1600&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4 text-[#00b4d8]" />
              Tire suas dúvidas
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
              Perguntas Frequentes
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Encontre respostas rápidas sobre reservas, segurança, pagamento e tudo o que você precisa saber antes de zarpar.
            </p>
          </div>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>

        {/* CTA */}
        <div className="bg-[#0a2540] py-16 px-4 text-center">
          <Anchor className="w-10 h-10 text-[#00b4d8] mx-auto mb-4" />
          <h2 className="font-playfair text-3xl font-bold text-white mb-3">
            Ainda tem dúvidas?
          </h2>
          <p className="text-white/60 mb-6">
            Nossa equipe está disponível de segunda a domingo, das 8h às 20h.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contato"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00b4d8] hover:bg-[#0096b7] text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl"
            >
              Fale conosco
              <ChevronRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/5522999990000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all"
            >
              WhatsApp
            </a>
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
