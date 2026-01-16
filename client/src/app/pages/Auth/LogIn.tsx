// src/app/Auth/LogIn.tsx
import { useNavigate } from "react-router-dom";
import LoginForm from "../../../components/Auth/LoginForm/LoginForm";
import { useState } from "react";
import { apiService } from "../../../utils/api";

interface LogInData {
  email: string;
  password: string;
}

const LogIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<LogInData>({
    email: "",
    password: "",
  });

  const inputs = [
    {
      label: "Username",
      placeholder: "Enter your username or email",
      type: "email",
      name: "email",
    },
    {
      label: "Password",
      placeholder: "Enter your password",
      type: "password",
      name: "password",
    },
  ];

  const handleSubmit = async () => {
    if (!data.email || !data.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiService.login(data);
      
      // Save token and user data
      apiService.setToken(response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="w-full max-w-xl mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      <LoginForm<LogInData>
        title="Welcome To Fire Guard System"
        inputs={inputs}
        btn="Login"
        underBtn={{
          Link: { url: "/forget-password", content: "Forgot password?" },
        }}
        setData={setData}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default LogIn;
