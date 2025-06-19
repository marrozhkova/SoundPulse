import "./App.css";

import React from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import RollingGallery from "./components/RollingGallery";
import SearchButtons from "./components/SearchButtons";
import Player from "./components/Player"; // Neuer Import für die Player-Komponente
import StationsList from "./components/StationsList";
import Footer from "./components/Footer";
import ImagePreloader from "./utilities/ImagePreload";
import { FetchContext } from "./contexts/FetchContext";
import { useContext } from "react";
import { UserProvider } from "./contexts/UserContext";

const App = () => {
  const { audioRef } = useContext(FetchContext);
  return (
    <>
      <UserProvider>
        <ImagePreloader />
        <Navigation />
        <Header />
        <RollingGallery autoplay={true} pauseOnHover={true} />
        <Player audio={audioRef.current} />
        <SearchButtons />
        <StationsList />
        <Footer />
      </UserProvider>
    </>
  );
};

export default App;
