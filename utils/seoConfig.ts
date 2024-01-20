// Type imports
import type { ManifestOptions } from "vite-plugin-pwa"

/**
 * Defines the default SEO configuration for the website.
 */
export const seoConfig = {
  baseURL: 'https://salvatorelaspata.net', // Change this to your production URL.
  description:
    "Salvatore La Spata Website - Full-Stack Software Engineer", // Change this to be your website's description.
  type: "website",
  image: {
    url: "sticker.webp", // Change this to your website's thumbnail.
    alt: "Salvatore La Spata - Developer.", // Change this to your website's thumbnail description.
    width: 1200,
    height: 630
  },
  siteName: "Salvatore La Spata - Full-Stack Software Engineer", // Change this to your website's name,
  twitter: {
    card: "summary_large_image"
  }
}

/**
 * Defines the configuration for PWA webmanifest.
 */
export const manifest: Partial<ManifestOptions> = {
  name: "Salvatore La Spata - Full-Stack Software Engineer", // Change this to your website's name.
  short_name: "Salvatore La Spata - Full-Stack Software Engineer", // Change this to your website's short name.
  description:
    "Salvatore La Spata - Full-Stack Software Engineer is an opionated Astro starter for building robust static websites.", // Change this to your websites description.
  theme_color: "#ffffff", // Change this to your primary color.
  background_color: "#1f2937", // Change this to your background color.
  display: "minimal-ui",
  icons: [
    {
      src: "/logo-code.svg",
      sizes: "192x192",
      type: "image/svg"
    },
    {
      src: "/logo-learn.svg",
      sizes: "192x192",
      type: "image/svg"
    },
    {
      src: "/logo-npm.svg",
      sizes: "192x192",
      type: "image/svg"
    },
    {
      src: "/logo-odata.svg",
      sizes: "192x192",
      type: "image/svg"
    },
    {
      src: "/logo-sicily.svg",
      sizes: "192x192",
      type: "image/svg"
    },
    {
      src: "/social-github--white.svg",
      sizes: "192x192",
      type: "image/svg"
    },
    {
      src: "/social-github.svg",
      sizes: "192x192",
      type: "image/svg"
    },
    {
      src: "/social-gmail.svg",
      sizes: "192x192",
      type: "image/svg"
    }, {
      src: "/sticker.webp",
      sizes: "192x192",
      type: "image/svg"
    },
    {
      src: "/social-linkedin.svg",
      sizes: "192x192",
      type: "image/svg"
    },
  ]
}