import type { MetadataRoute } from "next";
import { SITE_URL } from "./_lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The club's internal management system.
      disallow: "/sistema",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
