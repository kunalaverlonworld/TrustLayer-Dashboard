import AppRouter from "./routes/AppRouter";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <AppRouter />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          /* style: {
            background: "#111827",
            color: "#fff",
            borderRadius: "12px",
            padding: "14px 16px",
            fontSize: "14px",
          }, */
          style: {
            background: "rgba(17,24,39,0.95)",
            backdropFilter: "blur(6px)",
            color: "#fff",
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          },
          success: {
            style: {
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              color: "#fff",
            },
          },
          error: {
            style: {
              background: "linear-gradient(135deg, #dc2626, #991b1b)",
              color: "#fff",
            },
          },
        }}
      />
    </>
  );
}

export default App;
