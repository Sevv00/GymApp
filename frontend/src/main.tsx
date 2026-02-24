import { createRoot } from "react-dom/client"
import "./index.css"
import { BrowserRouter, Route, Routes } from "react-router"
import { Register } from "./pages/Register.tsx"
import { Parent } from "./pages/Parent"
import { Login } from "./pages/Login.tsx"
import { ThemeProvider } from "./components/theme-provider.tsx"
import { Layout } from "./Layout.tsx"
import { ParentProtected } from "./ParentProtected.tsx"
import { ClassRoom } from "./pages/ClassRoom.tsx"
import { Fundraiser } from "./pages/Fundraiser.tsx"
import { Raport } from "./pages/Raport.tsx"
import { Admin } from "./pages/Admin.tsx"

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ParentProtected />}>
            <Route path="/" element={<Parent />} />
            <Route path="/classes/:class_id" element={<ClassRoom />} />
            <Route
              path="/fundraisers/:fundraiser_id"
              element={<Fundraiser />}
            />
            <Route path="/raport" element={<Raport />} />
            <Route path="/raport/:type/:id" element={<Raport />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </ThemeProvider>,
)
