// src/routes/AppRouter.jsx
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoutes } from '../routes/ProtectedRoutes'

import Home from '../components/Dashboard'
import ListDummy from '../views/Dummy/ListDummy'
import ListDocuments from '../views/Documents/ListDocuments'
import ListJobOffers from '../views/JobOffers/ListJobOffers'
import NotFound from '../views/NotFound'
import ShowDocument from '../views/Documents/ShowDocument'
import ShowDummy from '../views/Dummy/ShowDummy'
import ShowStudent from '../views/Students/ShowStudent'
import ShowCompany from '../views/Companies/ShowCompany'
import ShowJobOffer from '../views/JobOffers/ShowJobOffer'
import ShowReview from '../views/Reviews/ShowReview'
import NewDummy from '../views/Dummy/NewDummy'
import NewDocument from '../views/Documents/NewDocument'
import ListCompaniesSAO from '../views/SAOSinc/Companies/ListCompaniesSAO'
import ListStudentsSAO from '../views/SAOSinc/Students/ListStudentsSAO'
import ListTeachersSAO from '../views/SAOSinc/Teachers/ListTeachersSAO'
import ListFctsSAO from '../views/SAOSinc/Fcts/ListFctsSAO'
import NewJobOffer from '../views/JobOffers/NewJobOffer'
import ListStudents from '../views/Students/ListStudents'
import ListCompanies from '../views/Companies/ListCompanies'
import ListFcts from '../views/Fcts/ListFcts'
import ShowAdmin from '../views/Administrators/ShowAdmin'
import ShowTeacher from '../views/Teachers/ShowTeacher'
import ShowFct from '../views/Fcts/ShowFcts'
import ListReviews from '../views/Reviews/ListReview'
import NewReview from '../views/Reviews/NewReview'
import NewAction from '../views/Actions/NewAction'
import ShowAction from '../views/Actions/ShowAction'
import ValidateReviews from '../views/Administrators/ValidateReviews'
import ValidateSkills from '../views/Administrators/ValidateSkills'


export default function AppRouter() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Home />} />

      {/* Rutas de autenticación */}
      {/*<Route path="/" element={<Login />} />
      <Route path="/auth/password-setup" element={<PasswordSetup />} />*/}

      <Route path="/documents" element={<ListDocuments />} />
      <Route path="/documents/:id" element={<ShowDocument />} />
      <Route path="/documents/new" element={<NewDocument />} />
      {/*<Route path="/joboffers" element={<ListJobOffers />} />*/}
      <Route
        path="/joboffers"
        element={
          <ProtectedRoutes
            allowedRoles={['ADMINISTRADOR', 'PROFESOR', 'ALUMNO']}
          >
            <ListJobOffers />
          </ProtectedRoutes>
        }
      />

      <Route path="/joboffers/new" element={<NewJobOffer />} />
      <Route path="/joboffers/:id" element={<ShowJobOffer />} />
      <Route
        path="/actions/new"
        element={
          <ProtectedRoutes allowedRoles={['ADMINISTRADOR', 'PROFESOR']}>
            <NewAction />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/actions/:id"
        element={
          <ProtectedRoutes allowedRoles={['ADMINISTRADOR', 'PROFESOR']}>
            <ShowAction />
          </ProtectedRoutes>
        }
      />

      {/*<Route path="/companies" element={<ListCompanies />} />*/}
      {/* 🏢 RESTRICCIÓN EMPRESA: No puede ver listado de empresas ni ofertas */}
      <Route
        path="/companies"
        element={
          <ProtectedRoutes
            allowedRoles={['ADMINISTRADOR', 'PROFESOR', 'ALUMNO']}
          >
            <ListCompanies />
          </ProtectedRoutes>
        }
      />

      <Route path="/companies/:id" element={<ShowCompany />} />
      <Route path="/administrators/:id" element={<ShowAdmin />} />
      {/*<Route path="/administrators/validate/reviews" element={<ValidateReviews />} />
      <Route path="/administrators/validate/skills" element={<ValidateSkills />} />*/}

      {/*<Route path="/students" element={<ListStudents />} />*/}
      {/* 🎓 RESTRICCIÓN ALUMNO: No puede ver listado de alumnos */}
      <Route
        path="/students"
        element={
          <ProtectedRoutes
            allowedRoles={['ADMINISTRADOR', 'PROFESOR', 'EMPRESA']}
          >
            <ListStudents />
          </ProtectedRoutes>
        }
      />

      <Route path="/students/:id" element={<ShowStudent />} />
      <Route path="/fcts" element={<ListFcts />} />
      <Route path="/fcts/:id" element={<ShowFct />} />

      <Route
        path="/reviews"
        element={
          <ProtectedRoutes allowedRoles={['ADMINISTRADOR', 'PROFESOR','ALUMNO']}>
            <ListReviews />
          </ProtectedRoutes>
        }
      />

      <Route path="/reviews/new" element={<NewReview />} />
      <Route path="/reviews/:id" element={<ShowReview />} />

      <Route path="/teachers/:id" element={<ShowTeacher />} />

      {/*<Route path="/sinc/empresas" element={<ListCompaniesSAO />} />
      <Route path="/sinc/alumnos" element={<ListStudentsSAO />} />
      <Route path="/sinc/profesores" element={<ListTeachersSAO />} />
      <Route path="/sinc/fcts" element={<ListFctsSAO />} />*/}

      {/* Rutas protegidas para ADMIN */}
      <Route
        path="/sinc/*"
        element={
          <ProtectedRoutes allowedRoles={['ADMINISTRADOR']}>
            <Routes>
              <Route path="empresas" element={<ListCompaniesSAO />} />
              <Route path="alumnos" element={<ListStudentsSAO />} />
              <Route path="profesores" element={<ListTeachersSAO />} />
              <Route path="fcts" element={<ListFctsSAO />} />
            </Routes>
          </ProtectedRoutes>
        }
      />

      <Route
        path="/administrators/validate/*"
        element={
          <ProtectedRoutes allowedRoles={['ADMINISTRADOR']}>
            <Routes>
              <Route path="reviews" element={<ValidateReviews />} />
              <Route path="skills" element={<ValidateSkills />} />
            </Routes>
          </ProtectedRoutes>
        }
      />

      <Route path="/dummy" element={<ListDummy />} />
      <Route path="/dummy/new" element={<NewDummy />} />
      <Route path="/dummy/:id" element={<ShowDummy />} />

      {/* Más rutas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
