import type { Metadata } from "next";
import Link from "next/link";
import { StampChat, StampHeart, StampPlane } from "@/components/art/home";
import {
  PostcardCity,
  PostcardPlane,
  PostcardRoute,
  StepIconImport1,
  StepIconImport2,
  StepIconImport3,
  StepIconImport4,
  StepIconLocal1,
  StepIconLocal2,
  StepIconLocal3,
  StepIconLocal4,
  WhyCargo,
  WhyHealth,
  WhySupport,
} from "@/components/art/how";
import { JourneySwitch } from "@/components/how/JourneySwitch";
import { Flight } from "@/components/media/Flight";
import { Teddy } from "@/components/teddy/Teddy";
import { howItWorksSteps, type Step } from "@/lib/data";
import { whatsappHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Meet your puppy in our Downtown Dubai showroom or order a premium breed from overseas. Delivery, collection and our puppy promise.",
};

const TINTS = ["#fbe3b4", "#fde6de", "#e3f0fb", "#e6f2df"];

const LOCAL_STEPS: Step[] = [
  {
    title: "Explore our puppies",
    text: "Browse our website to view the available puppies. Each listing includes photos, breed details, age, and health information.",
  },
  {
    title: "Choose your puppy",
    text: "Once you find a puppy you love, open their profile for more information or to enquire further. You can also reach out to us directly if you have any questions.",
  },
  { title: "Meet before you choose", text: "Spend time bonding before making your decision." },
  {
    title: "Pick-up or delivery",
    text: "Pick up your puppy from us or have them delivered to your home within Dubai. Our delivery service is safe and reliable, ensuring your puppy arrives comfortably.",
  },
];

const PROMISE = [
  {
    stamp: "round",
    Icon: StampHeart,
    ink: "#a24a1a",
    tilt: "-8deg",
    title: "Hand-selected breeders",
    text: "We work only with breeders who uphold the highest ethical and health standards.",
  },
  {
    stamp: "ticket",
    Icon: StampPlane,
    ink: "#1f6b45",
    tilt: "5deg",
    title: "Full transparency",
    text: "Photos, videos, and health certificates are shared before your puppy travels.",
  },
  {
    stamp: "oval",
    Icon: StampChat,
    ink: "#5a3a28",
    tilt: "-4deg",
    title: "Safe, stress-free delivery",
    text: "We handle every detail of the import process, so your puppy arrives happy, healthy, and ready to love you.",
  },
];

const DELIVERY = [
  {
    title: "Take your puppy home the same day",
    text: "Local puppies are available immediately — visit, fall in love, and go home together.",
  },
  {
    title: "Delivery within Dubai",
    text: "Prefer to stay home? We deliver your puppy to your door within Dubai, safely and comfortably.",
  },
  {
    title: "Safe international cargo",
    text: "We handle all the paperwork and ensure comfortable travel so your puppy arrives happy and stress-free.",
  },
  {
    title: "Worldwide delivery",
    text: "We safely deliver puppies to loving homes all around the world. Our trusted international cargo partners ensure your new furry friend travels comfortably and arrives safely, no matter the distance.",
  },
];

const WHY = [
  {
    Icon: WhyCargo,
    title: "International cargo",
    text: "We safely deliver puppies to loving homes all around the world. Our trusted international cargo partners ensure your new furry friend travels comfortably and arrives safely, no matter the distance.",
  },
  {
    Icon: WhySupport,
    title: "Support 24/7",
    text: "Our team is available 24/7 to answer your questions and assist you through every step of the adoption process. From choosing your puppy to post-delivery support — we're just a message away.",
  },
  {
    Icon: WhyHealth,
    title: "Health guarantee",
    text: "All our puppies come with a verified health certificate from licensed vets. We ensure every puppy is vaccinated, dewormed, and thoroughly checked before joining your family.",
  },
];

const ON_THIS_PAGE = [
  ["two-ways", "Two ways home"],
  ["promise", "Our premium puppy promise"],
  ["delivery", "Delivery & collection"],
  ["why", "Why choose us"],
] as const;

function Steps({ steps, icons }: { steps: Step[]; icons: React.ComponentType[] }) {
  return (
    <ol className="tp-steps">
      {steps.map((s, i) => {
        const Icon = icons[i];
        return (
          <li
            key={s.title}
            className="tp-step"
            style={{ "--i": i, "--tint": TINTS[i % TINTS.length] } as React.CSSProperties}
          >
            <span aria-hidden="true" className="tp-step__icon">
              <Icon />
            </span>
            <span className="tp-step__num font-plush">Step {i + 1}</span>
            <h4 className="font-plush-text tp-step__title">{s.title}</h4>
            <p className="tp-step__text">{s.text}</p>
          </li>
        );
      })}
    </ol>
  );
}

export default function HowItWorksPage() {
  return (
    <div data-page="how" className="tp-page">
      <section
        data-pup-scene="true"
        data-tone="light"
        className="tp-scene"
        style={{ "--sky-top": "#fffbf3", "--sky-bottom": "#f6cc85" } as React.CSSProperties}
        aria-labelledby="how-title"
      >
        <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <header className="grid gap-8 md:grid-cols-12 md:items-end">
            <h1 id="how-title" className="font-plush text-giant md:col-span-7">
              How it works
            </h1>
            <p className="text-lede text-[var(--ink-soft)] md:col-span-5 md:pb-4">
              Whether you choose to visit us locally or order a premium breed from overseas, TeddyPups is here to make
              the experience unforgettable.
            </p>
          </header>
          <nav aria-label="On this page" className="mt-10 flex flex-wrap gap-2">
            {ON_THIS_PAGE.map(([id, label], i) => (
              <a
                key={id}
                href={`#${id}`}
                className="chip h-11 border-2 border-cocoa !bg-milk px-4 hover:!bg-honey-soft"
              >
                <span className="font-plush text-toffee">{i + 1}</span>
                {label}
              </a>
            ))}
          </nav>

          <div id="two-ways">
            <JourneySwitch
              teddy={
                <Teddy
                  pose="crossroads"
                  className="tp-journeys__teddy"
                  label="Teddy, waiting to see which way you pick"
                />
              }
              ways={[
                {
                  id: "local",
                  label: "In Dubai",
                  hint: "meet in person",
                  panel: (
                    <>
                      <div className="tp-journey__head">
                        <div>
                          <h3 className="font-plush tp-journey__title">Meet your puppy in person</h3>
                          <p className="text-lede mt-4 text-[var(--ink-soft)]">
                            Step into our Downtown Dubai showroom and experience the joy of choosing your puppy
                            face-to-face. We source healthy, well-socialized puppies from trusted local breeders,
                            ensuring they&apos;re raised with care, proper nutrition, and veterinary checks.
                          </p>
                        </div>
                        <div aria-hidden="true" className="tp-postcard">
                          <span className="tp-postcard__sun" />
                          <PostcardCity />
                          <span className="font-scrawl tp-postcard__to tp-postcard__to--left">Downtown Dubai</span>
                        </div>
                      </div>
                      <Steps
                        steps={LOCAL_STEPS}
                        icons={[StepIconLocal1, StepIconLocal2, StepIconLocal3, StepIconLocal4]}
                      />
                    </>
                  ),
                },
                {
                  id: "imported",
                  label: "Imported",
                  hint: "order upon request",
                  panel: (
                    <>
                      <div className="tp-journey__head">
                        <div>
                          <h3 className="font-plush tp-journey__title">Order upon request</h3>
                          <p className="text-lede mt-4 text-[var(--ink-soft)]">
                            Looking for a truly exceptional companion? Our Order Upon Request service gives you access
                            to some of the world&apos;s most sought-after teacup breeds — ethically sourced from the
                            most reputable, certified breeders across Europe, Korea, and beyond.
                          </p>
                          <p className="font-scrawl mt-4 text-toffee-ink">
                            From Korean teacup poodles to rare Maltese, Pom, and Yorkie lines, we bring the world&apos;s
                            finest puppies to Dubai, just for you.
                          </p>
                        </div>
                        <div aria-hidden="true" className="tp-postcard tp-postcard--sky">
                          <PostcardRoute />
                          <PostcardPlane />
                          <span className="font-scrawl tp-postcard__from">Europe · Korea</span>
                          <span className="font-scrawl tp-postcard__to">Dubai</span>
                        </div>
                      </div>
                      <Steps
                        steps={howItWorksSteps}
                        icons={[StepIconImport1, StepIconImport2, StepIconImport3, StepIconImport4]}
                      />
                    </>
                  ),
                },
              ]}
            />
          </div>

          <section id="promise" aria-labelledby="promise-title" className="tp-paper mt-24 -rotate-[0.6deg]">
            <p aria-hidden="true" className="font-scrawl text-lg text-toffee-ink">
              puppy passport
            </p>
            <h2 id="promise-title" className="font-plush text-huge mt-1 max-w-[16ch]">
              Our premium puppy promise
            </h2>
            <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {PROMISE.map(({ stamp, Icon, ink, tilt, title, text }, i) => (
                <li
                  key={title}
                  className="tp-entry"
                  style={{ "--ink-stamp": ink, "--tilt": tilt, "--i": i } as React.CSSProperties}
                >
                  <span className={`tp-stamp tp-stamp--${stamp}`}>
                    <Icon />
                    <span className="tp-stamp__title font-plush">{title}</span>
                  </span>
                  <p className="tp-entry__text">{text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section
            id="delivery"
            aria-labelledby="delivery-title"
            className="mt-24 grid items-center gap-10 lg:grid-cols-12"
          >
            <div className="lg:col-span-6">
              <h2 id="delivery-title" className="font-plush text-huge">
                Delivery &amp; collection
              </h2>
              <p className="text-lede mt-5 text-[var(--ink-soft)]">
                From a same-day visit in Downtown Dubai to a flight from Korea, every puppy travels comfortably and
                arrives safely.
              </p>
              <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                {DELIVERY.map((d) => (
                  <li key={d.title}>
                    <h3 className="font-plush-text text-[1.3rem] font-bold leading-snug">{d.title}</h3>
                    <p className="mt-1.5 text-[var(--ink-soft)]">{d.text}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[clamp(14rem,30vw,22rem)] lg:col-span-6">
              <PostcardCity className="absolute inset-x-0 bottom-0 w-full text-cocoa/25" />
              <Flight label="A plane flying puppies from Korea to Dubai" />
            </div>
          </section>

          <section id="why" aria-labelledby="why-title" className="mt-24 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="why-title" className="font-plush text-huge">
                Why choose us
              </h2>
              <p className="text-lede mt-6 text-[var(--ink-soft)]">
                We&apos;re here to help you find a new family member. From the moment you visit our site to the joyful
                day your puppy arrives at your door, we&apos;re with you every step of the way. Our mission is to make
                the entire adoption process smooth, transparent, and full of love.
              </p>
            </div>
            <ul className="space-y-8 lg:col-span-6 lg:col-start-7">
              {WHY.map(({ Icon, title, text }) => (
                <li key={title} className="flex gap-5">
                  <Icon />
                  <div>
                    <h3 className="font-plush text-[1.7rem]">{title}</h3>
                    <p className="mt-2 text-[var(--ink-soft)]">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="care-title"
            className="tp-board mt-24 grid items-center gap-8 md:grid-cols-[1fr_auto] md:!p-12"
          >
            <div>
              <h2 id="care-title" className="font-plush text-big">
                Unique and high quality puppies
              </h2>
              <p className="text-lede measure mt-5 text-cocoa-soft">
                When you choose TeddyPups, you can trust that you&apos;re getting a puppy of the highest quality. We
                also provide guidance and support to new pet owners, offering advice on training, nutrition, and general
                care to ensure a smooth transition for you and your new furry friend.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                  Ask us on WhatsApp
                </a>
                <Link className="btn btn-ghost" href="/puppies">
                  See available puppies
                </Link>
              </div>
            </div>
            <Teddy pose="play" facing="left" className="mx-auto w-48 md:w-56" label="Teddy, ready to play" />
          </section>
        </div>
      </section>
    </div>
  );
}
