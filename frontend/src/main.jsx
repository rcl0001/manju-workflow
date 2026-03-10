import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#722ed1',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#f5222d',
          borderRadius: 12,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Card: {
            borderRadiusLG: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          },
          Button: {
            borderRadius: 8,
            controlHeight: 44,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 44,
          },
          Steps: {
            colorPrimary: '#722ed1',
          }
        }
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
