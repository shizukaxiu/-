import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { AdminPage } from './pages/AdminPage'
import { useAuthStore } from './store/authStore'

function App() {
  const { user } = useAuthStore()

  // 未登录：展示登录页
  if (!user) {
    return <LoginPage />
  }

  // 普通用户：进入原有业务界面
  if (user.role === 'user') {
    return (
      <Layout>
        <HomePage />
      </Layout>
    )
  }

  // 系统管理员：进入后台管理界面
  return <AdminPage />
}

export default App
