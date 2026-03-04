import { useState, useEffect } from "react";
import SubmitCVForm from "./pages/SubmitCVForm";
import PreviewCV from "./pages/PreviewCV";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", onLocationChange);
    return () => window.removeEventListener("popstate", onLocationChange);
  }, []);

  if (currentPath === "/preview") {
    return <PreviewCV />;
  }

  return <SubmitCVForm />;
}

export default App;
