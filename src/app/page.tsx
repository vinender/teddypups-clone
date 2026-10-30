import { Families } from "@/components/home/Families";
import { Hero } from "@/components/home/Hero";
import { HomeCta } from "@/components/home/HomeCta";
import { Journey } from "@/components/home/Journey";
import { Meet } from "@/components/home/Meet";
import { Paths } from "@/components/home/Paths";
import { Questions } from "@/components/home/Questions";
import { Trust } from "@/components/home/Trust";

export default function HomePage() {
  return (
    <div data-page="home" className="tp-page">
      <Hero />
      <Meet />
      <Paths />
      <Journey />
      <Trust />
      <Families />
      <Questions />
      <HomeCta />
    </div>
  );
}
