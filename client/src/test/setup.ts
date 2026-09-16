// Adds jest-dom's matchers (toBeInTheDocument, etc.) and unmounts each
// rendered component after every test — without this, components from a
// previous test stay mounted and queries like getByRole match duplicates.
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
});
