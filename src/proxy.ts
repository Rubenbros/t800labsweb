import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // `opengraph-image` no lleva punto: sin excluirla, next-intl la trata como una página y da 404.
  matcher: "/((?!api|trpc|_next|_vercel|opengraph-image|.*\\..*).*)",
};
