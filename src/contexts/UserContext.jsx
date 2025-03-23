import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

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

    localStorage.setItem("registeredUser", JSON.stringify(newUser));

    setUser(newUser);
    localStorage.setItem("activeUser", JSON.stringify(newUser));
    setIsAuthenticated(true);
  };

  const loginUser = async (username, password) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const savedUser = JSON.parse(localStorage.getItem("registeredUser"));

    if (
      savedUser &&
      savedUser.username === username &&
      savedUser.password === password
    ) {
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
