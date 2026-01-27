import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from '../context/LanguageContext'
import type { ReactElement, ReactNode } from 'react'

interface WrapperProps {
  children: ReactNode
}

// All providers wrapper for complete app testing
function AllProviders({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </BrowserRouter>
  )
}

// Router-only wrapper for simple component testing
function RouterWrapper({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

// Language provider wrapper
function LanguageWrapper({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </BrowserRouter>
  )
}

// Custom render with all providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Export everything
export * from '@testing-library/react'
export {
  customRender as render,
  RouterWrapper,
  LanguageWrapper,
  AllProviders,
}
