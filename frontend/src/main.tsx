import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './site'
import ProductPage from './product'
import './i18n'
import './style.css'

const Admin = lazy(() => import('./admin'))
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } })
function Root() { return <QueryClientProvider client={queryClient}><BrowserRouter><Routes><Route path="/admin/*" element={<Suspense fallback={<div className="loading">Loading team workspace…</div>}><Admin/></Suspense>}/><Route path="/products/:slug" element={<ProductPage/>}/><Route path="*" element={<App/>}/></Routes></BrowserRouter></QueryClientProvider> }
createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>)
