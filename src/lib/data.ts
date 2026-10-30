import puppiesJson from "@/data/puppies.json";
import familyPhotosJson from "@/data/family-photos.json";
import faqsJson from "@/data/faqs.json";
import stepsJson from "@/data/steps.json";
import homeWallOrder from "@/data/home-wall-order.json";
import goneHomeJson from "@/data/gone-home.json";

export type Media = {
  id: string;
  url: string;
  kind: "image" | "video";
  width: number;
  height: number;
  alt: string;
  caption: string;
  focalX: number;
  focalY: number;
  color: string;
  blurDataUrl: string | null;
  durationS: number | null;
  poster: Media | null;
};

export type Origin = "local" | "imported";

export type Puppy = {
  slug: string;
  name: string;
  displayName: string;
  breed: string;
  gender: "male" | "female" | "male-female";
  genderLabel: string;
  age: string;
  colour: string;
  description: string;
  status: "available" | "reserved" | "rehomed";
  featured: boolean;
  origin: Origin;
  breeds: string[];
  collections: string[];
  cover: Media;
  media: Media[];
};

export type Breed = { slug: string; name: string; n?: number };
export type Faq = { id: string; question: string; answer: string };
export type Step = { title: string; text: string };

export const puppies = puppiesJson.puppies as Puppy[];
/** Puppies who have already gone home; they keep their profile pages. */
export const rehomed = goneHomeJson as Puppy[];
export const allPuppies = [...puppies, ...rehomed];
export const breeds = puppiesJson.breeds as Breed[];
export const filterBreeds = puppiesJson.filterBreeds as Breed[];
export const collections = puppiesJson.collections as Breed[];
export const familyPhotos = familyPhotosJson as Media[];
/** The home page shows the same family photos, featured ones first. */
export const homeFamilyPhotos = homeWallOrder.map((id) => familyPhotos.find((m) => m.id === id)!);
export const faqs = faqsJson as Faq[];
export const homeSteps = stepsJson.home as Step[];
export const howItWorksSteps = stepsJson.howItWorks as Step[];

export function getPuppy(slug: string) {
  return allPuppies.find((p) => p.slug === slug);
}

export type PuppyFilters = { origin?: string; breed?: string; gender?: string; collection?: string };
export const FILTER_KEYS = ["origin", "breed", "gender", "collection"] as const;

/** Filters combine; a "boy & girl" litter matches either gender. */
export function filterPuppies(list: Puppy[], f: PuppyFilters) {
  return list.filter(
    (p) =>
      (!f.origin || p.origin === f.origin) &&
      (!f.breed || p.breeds.includes(f.breed)) &&
      (!f.gender || p.gender === f.gender || p.gender === "male-female") &&
      (!f.collection || p.collections.includes(f.collection)),
  );
}

/** "boy" / "girl" / "boy & girl", as the cards print it. */
export function genderWord(p: Puppy) {
  return p.genderLabel.toLowerCase();
}

export function hasVideo(p: Puppy) {
  return p.media.some((m) => m.kind === "video");
}

/** Named pups lead with their name and print the breed in the meta line. */
export function puppyMeta(p: Puppy, sep = ", ") {
  return [p.name ? p.breed : null, genderWord(p), p.age].filter(Boolean).join(sep);
}
