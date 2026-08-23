import { cartoonAvatar } from "@/lib/cartoon-avatar";

export const marketingCast = {
  ada: {
    name: "Adaeze Okonkwo",
    short: "Adaeze",
    handle: "adaeze.ok",
    src: cartoonAvatar("adaeze.ok"),
  },
  kelechi: {
    name: "Kelechi Nwosu",
    short: "Kelechi",
    handle: "kelechi.nwosu",
    src: cartoonAvatar("kelechi.nwosu"),
  },
  tomiwa: {
    name: "Tomiwa Bello",
    short: "Tomiwa",
    handle: "tomiwa.bello",
    src: cartoonAvatar("tomiwa.bello"),
  },
  seyi: {
    name: "Seyi Adebayo",
    short: "Seyi",
    handle: "seyi.adebayo",
    src: cartoonAvatar("seyi.adebayo"),
  },
  amaka: {
    name: "Amaka Eze",
    short: "Amaka",
    handle: "amaka.creates",
    src: cartoonAvatar("amaka.creates"),
  },
  tolu: {
    name: "Tolu Ajayi",
    short: "Tolu",
    handle: "tolu.ajayi",
    src: cartoonAvatar("tolu.ajayi"),
  },
} as const;

export const marketingPhotos = {
  street: "/marketing/u-woman-phone.jpg",
  studio: "/marketing/u-studio.jpg",
  rooftop: "/marketing/u-city.jpg",
  hero: "/marketing/hero-skaters.png",
  closing: "/marketing/closing-studio.jpg",
  whoBrands: "/marketing/who-brands.jpg",
  whoAgencies: "/marketing/who-agencies.jpg",
  whoCreators: "/marketing/who-creators.jpg",
  workspace: "/marketing/workspace-billboard.jpg",
  blogPlaceholder: "/marketing/blog-placeholder.png",
  draft: "/marketing/draft-v2.jpg",
  osCreator: "/marketing/os-creator.jpg",
} as const;
