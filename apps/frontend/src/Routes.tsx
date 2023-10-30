import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "wouter";
import {
    PAGES_PATH,
    PAGE_EXPORTS_SCHEMA,
    PageExports,
} from "@/configs/routing";

type RouteElement = ReturnType<typeof Route>;
const CONVERT_TO_WEBPATH_REGEX = new RegExp(
    `^${PAGES_PATH}|(index)?.page.tsx$`,
    "g",
);

let routes: RouteElement[] = [];

for (const [path, getModule] of Object.entries(
    import.meta.glob("@/pages/**/(index|404).page.tsx"),
)) {
    let routerPath = path
        .replace(CONVERT_TO_WEBPATH_REGEX, "") // Removes: "/src/pages/", ".page.tsx", trailing "/index"
        .replace(/\[\.{3}(.+?)\]|(404)$/g, ":$1$2*") // Replace [...slug] and /404 with a "catch-all" aka /:slug*
        .replace(/\[(.+)\]/, ":$1"); // Replace [id] with a wouter query param

    if (routerPath !== "/") {
        routerPath = routerPath.replace(/\/$/, "");
    }

    const isCatchAll = routerPath.match(/:.+?\*/g)?.length ?? 0 > 0;

    const LazyComponent = React.lazy(() =>
        getModule().then((unvalidatedExports) => {
            const exports = PAGE_EXPORTS_SCHEMA.safeParse(unvalidatedExports);
            if (exports.success) return exports.data as PageExports;
            if (import.meta.env.DEV) {
                const errorMessage = `"${path}" does not export a React function component as a default export.`;
                console.error(errorMessage);
                return { default: () => errorMessage };
            }

            return {
                default: () => <Redirect to="/404" />,
            };
        }),
    );

    routes[isCatchAll ? "push" : "unshift"](
        <Route key={routerPath} path={routerPath} component={LazyComponent} />,
    );
}

export default function Routes() {
    return (
        <Suspense>
            <Switch>{routes}</Switch>
        </Suspense>
    );
}
