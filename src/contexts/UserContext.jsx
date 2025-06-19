import React, { createContext, useState, useContext, useEffect } from "react";

export const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const activeUser = JSON.parse(localStorage.getItem("activeUser"));
    if (activeUser) {
      setUser(activeUser);
      setIsAuthenticated(true);
    }
  }, []);

  const registerUser = ({ username, email, password }) => {
    const newUser = { username, email, password };
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem("activeUser", JSON.stringify(newUser));
    setIsAuthenticated(true);
  };

  const loginUser = async (username, password) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const savedUser = users.find(
      (user) => user.username === username && user.password === password
    );

    if (savedUser) {
      setUser(savedUser);
      localStorage.setItem("activeUser", JSON.stringify(savedUser));
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  };

  const logoutUser = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("activeUser");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        registerUser,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
