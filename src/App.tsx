import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { DemoProvider } from "./store/DemoContext";

export default function App() {
  return (
    <DemoProvider>
      <RouterProvider router={router} />
    </DemoProvider>
  );
}
