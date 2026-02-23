import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }else {
    console.warn("🧭 Navigation is not ready yet. Retrying shortly...");
  }
}

module.exports = {
  navigationRef,
  navigate
};