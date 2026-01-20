import * as React from "react";
import { NavigationOverlayContext } from "./context.js";

export const useNavigationOverlayConfig = () => {
  return React.useContext(NavigationOverlayContext);
};
