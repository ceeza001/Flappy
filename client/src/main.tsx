import React, { useMemo, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { App } from "./App";

const Root = () => {
  const manifestUrl = "https://0b11230f-7899-465f-a5b0-441a39bad871-00-4fs9y6wz3wmd.picard.replit.dev:8080/tonconnect-manifest.json"

  const debug = true; // or set this based on some condition
  console.log(manifestUrl);
  
  useEffect(() => {
    if (debug) {
      import('eruda').then((lib) => lib.default.init());
    }
  }, [debug]);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <TonConnectUIProvider manifestUrl={manifestUrl}>
          <App />
        </TonConnectUIProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
