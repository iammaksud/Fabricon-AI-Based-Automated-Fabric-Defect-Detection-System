import LoginBrandPanel from '../components/auth/LoginBrandPanel';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="fc-login-page">
      <div className="fc-login-grid">
        <LoginBrandPanel />
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
