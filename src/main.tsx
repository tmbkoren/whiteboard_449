import "@excalidraw/excalidraw/index.css";
import './index.css'
import { createRouter,  RouterProvider } from '@tanstack/react-router';
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen.ts";



const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
  scrollRestoration: true
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root');

if (!rootElement?.innerHTML) {
  const root = ReactDOM.createRoot(rootElement!);
  root.render(<RouterProvider router={router} />);
}
