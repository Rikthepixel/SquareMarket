import { FunctionComponent } from "react";
import { DefaultParams, RouteComponentProps } from "wouter";
import { z } from "zod";

export const PAGES_PATH = "/src/pages";

export const PAGE_EXPORTS_SCHEMA = z.object({ default: z.function() });
export type PageExports = {
    default: FunctionComponent<RouteComponentProps<DefaultParams>>;
};
