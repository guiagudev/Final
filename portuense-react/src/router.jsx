import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import React from "react";
import RivalesPorGenero from "./pages/Rivales/RivalesPorGenero";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Jugadores from "./pages/Jugadores";
import PrimerEquipoDashboard from "./pages/PrimerEquipoDashboard";
import Calendario from "./pages/Calendario";
import DetalleJugador from "./pages/DetalleJugador";
import ContratoJugador from "./pages/ContratoJugador";
import AcademiaDashboard from "./pages/AcademiaDashboard";
import UserManager from "./pages/UserManager";
import PaginaCuotas from "./pages/Cuota";
import AcademiaCategoria from "./pages/AcademiaCategoria";
import DireccionDeportiva from "./pages/DireccionDeportiva";
import ClubesRivalesPorGenero from "./pages/Rivales/ClubesRivalesPorGenero";
import PrimerEquipoDireccion from "./pages/DireccionDeportiva/PrimerEquipo";
import AcademiaDireccion from "./pages/DireccionDeportiva/Academia";
import NuevoComentario from "./pages/NuevoComentario";
import DocsyExcel from "./pages/DireccionDeportiva/DocsyExcel";
import JugadoresPorCategoria from "./pages/DireccionDeportiva/JugadoresPorCategoria";
import JugadoresDelClub from "./pages/Rivales/JugadoresdelClub";
import DetalleJugadorRival from "./pages/Rivales/DetalleJugadorRival";
import ClubDetalle from "./pages/Rivales/ClubDetalle";
import ExcelPorCategoria from "./pages/DireccionDeportiva/ExcelPorCategoria";
import JugadorDocumentos from "./pages/DireccionDeportiva/JugadorDocumentos";
export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/primer-equipo" element={<PrimerEquipoDashboard />} />
        {/* <Route path="/academia" element={<AcademiaDashboard />}/> */}
        <Route path="/jugadores" element={<Jugadores />} />
        <Route path="/jugadores/:id" element={<DetalleJugador />} />
        <Route
          path="/jugadores/:id/comentario-nuevo"
          element={<NuevoComentario />}
        />
        <Route path="/jugadores/:id/contrato" element={<ContratoJugador />} />
        <Route path="/academia" element={<AcademiaDashboard />} />
        <Route path="/academia/:categoria" element={<AcademiaCategoria />} />
        <Route
          path="/direccion-deportiva/academia"
          element={<AcademiaDireccion />}
        />

        <Route path="/usuarios" element={<UserManager />} />
        <Route path="/cuotas" element={<PaginaCuotas />} />
        <Route path="/direccion-deportiva" element={<DireccionDeportiva />} />
        <Route path="/clubes-rivales/:genero" element={<ClubesRivalesPorGenero />} />
        <Route
          path="/clubes-rivales/:genero/:clubId/jugadores"
          element={<JugadoresDelClub />}
        >
          <Route path=":jugadorId" element={<DetalleJugadorRival />} />
        </Route>

        <Route
          path="/direccion-deportiva/primer-equipo"
          element={<PrimerEquipoDireccion />}
        />
        <Route
          path="/direccion-deportiva/primer-equipo/:categoria/:equipo"
          element={<DocsyExcel />}
        />
        
        <Route
          path="/direccion-deportiva/academia/:categoria/:equipo"
          element={<DocsyExcel />}
        />
       
        <Route
          path="/direccion-deportiva/academia/:categoria/:equipo/jugadores"
          element={<JugadoresPorCategoria />}
        />
        <Route
          path="/direccion-deportiva/primer-equipo/:categoria/:equipo/jugadores"
          element={<JugadoresPorCategoria />}
        />
        <Route path="/clubes-rivales/:genero/:id" element={<ClubDetalle />} />
        <Route
          path="/direccion-deportiva/primer-equipo/:categoria/:equipo/excel"
          element={<ExcelPorCategoria />}
        />
        <Route
          path="/direccion-deportiva/academia/:categoria/:equipo/excel"
          element={<ExcelPorCategoria />}
        />
        <Route path="/jugadores/:id/documentos" element={<JugadorDocumentos />} />
        <Route path="/rivales/:genero" element={<RivalesPorGenero />} />
      </Routes>
    </BrowserRouter>
  );
}
